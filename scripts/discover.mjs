/**
 * Dynamic ATS Discovery & Scraping Engine (AI Ops, RevOps, Automação & Produto)
 * 
 * Não depende de empresas fixas:
 * 1. Faz varredura por palavras-chave na busca pública de ATSs (Gupy Portal Search)
 * 2. Descobre dinamicamente dezenas de empresas contratando no Brasil
 * 3. Faz varredura multi-empresa nos endpoints públicos de Greenhouse e Lever
 * 4. Aplica filtros estritos:
 *    - Apenas AI Ops, RevOps, N8N, Automação, CRM, Product Owner, Analista de Requisitos/Produto
 *    - Descarte de desenvolvedores puros (backend/frontend puros)
 *    - Apenas Remoto ou Híbrido (<= 150km de Muzambinho e <= 2 dias)
 *    - Detecção e etiquetagem de vagas afirmativas
 * 
 * Uso: node scripts/discover.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// Palavras-chave do nicho
const SEARCH_KEYWORDS = [
  'n8n',
  'revops',
  'sales ops',
  'ai ops',
  'aiops',
  'automação de processos',
  'automacao de processos',
  'crm',
  'product owner',
  'analista de produto',
  'analista de requisitos',
  'hubspot',
  'salesforce',
  'make.com',
  'rpa'
];

// Empresas em escala no Brasil com boards no Greenhouse e Lever
const EXPANDED_SCALEUP_SLUGS = {
  greenhouse: [
    { slug: 'quintoandar', name: 'QuintoAndar' },
    { slug: 'vtex', name: 'VTEX' },
    { slug: 'gympass', name: 'Wellhub (Gympass)' },
    { slug: 'loft', name: 'Loft' },
    { slug: 'nuvemshop', name: 'Nuvemshop' },
    { slug: 'pipefy', name: 'Pipefy' },
    { slug: 'hotmart', name: 'Hotmart' },
    { slug: 'rdstation', name: 'RD Station' },
    { slug: 'takeblip', name: 'Take Blip' },
    { slug: 'contaazul', name: 'Conta Azul' },
    { slug: 'dock', name: 'Dock' },
    { slug: 'creditas', name: 'Creditas' },
  ],
  lever: [
    { slug: 'neon', name: 'Banco Neon' },
    { slug: 'olist', name: 'Olist' },
    { slug: 'buser', name: 'Buser' },
    { slug: 'dasa', name: 'Dasa Tech' },
    { slug: 'zup', name: 'Zup Innovation' }
  ]
};

// Cidades mapeadas e distâncias aproximadas para Muzambinho (KM)
const DISTANCES_TO_MUZAMBINHO = {
  'muzambinho': 0, 'guaxupe': 18, 'guaxupé': 18, 'monte belo': 25, 'juruaia': 30,
  'mococa': 45, 'pocos de caldas': 55, 'poços de caldas': 55, 'alfenas': 65,
  'sao joao da boa vista': 85, 'são joão da boa vista': 85, 'varginha': 115,
  'pouso alegre': 120, 'ribeirao preto': 135, 'ribeirão preto': 135, 'araras': 140,
  'rio claro': 150, 'campinas': 195, 'sao paulo': 285, 'são paulo': 285, 'sp': 285,
  'belo horizonte': 380, 'rio de janeiro': 450
};

function calculateDistanceToMuzambinho(location) {
  if (!location) return null;
  const l = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [city, dist] of Object.entries(DISTANCES_TO_MUZAMBINHO)) {
    const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (l.includes(cleanCity)) return dist;
  }
  if (l.includes('sao paulo') || l.includes('capital')) return 285;
  return null;
}

function calculateDaysOpen(isoDate) {
  const diffTime = Math.abs(new Date().getTime() - new Date(isoDate).getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function detectAffirmative(title, desc = '') {
  const combined = `${title} ${desc}`.toLowerCase();
  const patterns = [
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(pcd|pcds|defici[êe]ncia)\b/i, reason: 'Afirmativa PcD' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(mulher|mulheres|feminina)\b/i, reason: 'Afirmativa Mulheres' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(negr[ao]s?|pret[ao]s?|pard[ao]s?)\b/i, reason: 'Afirmativa Pessoas Negras' },
    { regex: /\bvaga\s+afirmativa\b|\bprograma\s+afirmativo\b/i, reason: 'Programa Afirmativo' }
  ];

  for (const p of patterns) {
    if (p.regex.test(combined)) {
      return { isAffirmative: true, reason: p.reason };
    }
  }
  return { isAffirmative: false };
}

function isNicheRole(title, desc = '') {
  const combined = `${title} ${desc}`.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Descarte explícito de desenvolvedores puros (backend/frontend tradicional)
  const isPureDev = 
    (titleLower.includes('desenvolvedor backend') || 
     titleLower.includes('backend developer') ||
     titleLower.includes('desenvolvedor front-end') ||
     titleLower.includes('frontend developer') ||
     titleLower.includes('dev backend') ||
     titleLower.includes('dev frontend') ||
     titleLower.includes('desenvolvedor react') ||
     titleLower.includes('desenvolvedor java') ||
     titleLower.includes('desenvolvedor c#') ||
     titleLower.includes('desenvolvedor .net'));

  const explicitNicheExemption = 
    combined.includes('n8n') || 
    combined.includes('ai ops') || 
    combined.includes('aiops') || 
    combined.includes('revops') || 
    combined.includes('automação de processos') ||
    combined.includes('automacao de processos');

  if (isPureDev && !explicitNicheExemption) {
    return false;
  }

  // 2. Termos do nicho (AI Ops, RevOps, Automação, CRM, Produto)
  const requiredTerms = [
    'n8n', 'make.com', 'zapier', 'ai ops', 'aiops', 'revops', 'revenue operations',
    'sales ops', 'sales operations', 'marketing ops', 'crm', 'hubspot', 'salesforce',
    'product owner', ' po ', 'analista de produto', 'analista de requisitos',
    'product manager', ' pm ', 'automação de processos', 'automacao de processos',
    'rpa', 'process automation', 'agentes de ia'
  ];

  return requiredTerms.some(term => combined.includes(term));
}

function detectWorkplace(title, location) {
  const combined = `${title} ${location}`.toLowerCase();
  if (combined.includes('híbrido') || combined.includes('hibrido') || combined.includes('hybrid')) return 'hibrido';
  if (combined.includes('remoto') || combined.includes('remote') || combined.includes('home office')) return 'remoto';
  if (combined.includes('presencial') || combined.includes('on-site')) return 'presencial';
  return 'remoto';
}

function validateLocationAndRadius(workplace, location, title, desc) {
  // Presencial é descartado
  if (workplace === 'presencial') return { valid: false, reason: 'Presencial' };
  
  // Remoto é sempre aceito
  if (workplace === 'remoto') return { valid: true, distance: 0, days: 0 };

  // Híbrido: máximo 2 dias presenciais e <= 150km de Muzambinho
  if (workplace === 'hibrido') {
    const text = `${title} ${desc}`.toLowerCase();
    const days = text.includes('3x') || text.includes('3 dias') ? 3 : 
                 text.includes('4x') || text.includes('4 dias') ? 4 : 2;
    if (days > 2) return { valid: false, reason: `Mais de 2 dias presenciais (${days}d)` };

    const distance = calculateDistanceToMuzambinho(location);
    if (distance !== null && distance > 150) {
      return { valid: false, reason: `Distância ${distance}km > 150km de Muzambinho` };
    }
    return { valid: true, distance: distance ?? 0, days };
  }

  return { valid: false };
}

const TECHS = [
  'N8N', 'Make', 'Zapier', 'OpenAI API', 'LangChain', 'AI Agents',
  'HubSpot', 'Salesforce', 'Pipedrive', 'RD Station', 'CRM', 
  'Webhooks', 'REST APIs', 'Postman', 'Typeform', 'WhatsApp API',
  'Jira', 'Confluence', 'Figma', 'Product Discovery', 'SQL', 'Python', 
  'Node.js', 'TypeScript', 'Metabase', 'Mixpanel', 'BPMN', 'RPA'
];

function extractStacks(text) {
  const found = [];
  for (const t of TECHS) {
    const reg = new RegExp(`(^|[^a-zA-Z0-9#+])${t.toLowerCase()}([^a-zA-Z0-9#+]|$)`, 'i');
    if (reg.test(text)) found.push(t);
  }
  return found;
}

function detectSeniority(text) {
  const l = text.toLowerCase();
  if (l.includes('estágio') || l.includes('estagiário')) return 'estagio';
  if (l.includes('especialista') || l.includes('lead') || l.includes('head') || l.includes('coordenador')) return 'especialista';
  if (l.includes('sênior') || l.includes('senior') || l.includes('sr')) return 'senior';
  if (l.includes('pleno') || l.includes('pl')) return 'pleno';
  if (l.includes('júnior') || l.includes('junior') || l.includes('jr')) return 'junior';
  return 'pleno';
}

/**
 * 1. Descoberta Dinâmica via Gupy Portal Search API
 */
async function discoverGupyJobs(keyword) {
  const discovered = [];
  try {
    const url = `https://portal.gupy.io/api/v1/jobs?jobName=${encodeURIComponent(keyword)}&limit=30`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];

    const json = await res.json();
    const rawJobs = Array.isArray(json) ? json : (json.data || []);

    for (const raw of rawJobs) {
      const title = raw.name || '';
      const desc = raw.description || '';

      // Filtro de nicho
      if (!isNicheRole(title, desc)) continue;

      const workplace = raw.isRemoteWork ? 'remoto' : detectWorkplace(title, `${raw.city || ''} ${raw.state || ''}`);
      const locStr = raw.isRemoteWork ? 'Remoto - Brasil' : `${raw.city ? raw.city + ', ' : ''}${raw.state || 'Brasil'}`;
      
      const geoCheck = validateLocationAndRadius(workplace, locStr, title, desc);
      if (!geoCheck.valid) continue;

      const affirmative = detectAffirmative(title, desc);
      const stacks = extractStacks(`${title} ${desc}`);
      const daysOpen = calculateDaysOpen(raw.publishedDate);

      const canonicalUrl = raw.jobUrl || 
        (raw.careerPageUrl ? `${raw.careerPageUrl}/job/${raw.id}` : `https://portal.gupy.io/job/${raw.id}`);

      discovered.push({
        id: `gupy_disc_${raw.id}`,
        title,
        company: raw.careerPageName || 'Empresa (Descoberta via Gupy)',
        companyLogo: raw.careerPageLogo,
        platform: 'gupy',
        canonicalUrl,
        publishedAt: raw.publishedDate,
        daysOpen,
        workplaceType: workplace,
        location: locStr,
        city: raw.city,
        state: raw.state,
        seniority: detectSeniority(title),
        stacks: stacks.length > 0 ? stacks : ['Automação', 'Processos', 'CRM'],
        description: desc.slice(0, 450) || `Oportunidade na ${raw.careerPageName} no nicho de ${keyword.toUpperCase()}.`,
        requirements: stacks.map(s => `Conhecimento prático em ${s}`),
        isActive: true,
        isAffirmative: affirmative.isAffirmative,
        affirmativeReason: affirmative.reason,
        distanceFromMuzambinhoKm: geoCheck.distance,
        hybridDaysPerWeek: geoCheck.days,
      });
    }
  } catch (err) {
    // Silencia erros de timeout em palavras pontuais
  }
  return discovered;
}

/**
 * 2. Descoberta Multi-Empresa em Greenhouse
 */
async function scrapeGreenhouseCompany(company) {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = [];

    for (const raw of (data.jobs || [])) {
      const title = raw.title || '';
      const content = raw.content || '';
      const loc = raw.location?.name || '';

      if (!isNicheRole(title, content)) continue;

      const workplace = detectWorkplace(title, loc);
      const geoCheck = validateLocationAndRadius(workplace, loc, title, content);
      if (!geoCheck.valid) continue;

      const affirmative = detectAffirmative(title, content);
      const stacks = extractStacks(`${title} ${content}`);
      const daysOpen = calculateDaysOpen(raw.updated_at);

      jobs.push({
        id: `gh_disc_${company.slug}_${raw.id}`,
        title,
        company: company.name,
        platform: 'greenhouse',
        canonicalUrl: raw.absolute_url,
        publishedAt: raw.updated_at,
        daysOpen,
        workplaceType: workplace,
        location: loc || 'Remoto - Brasil',
        seniority: detectSeniority(title),
        stacks: stacks.length > 0 ? stacks : ['RevOps', 'AI Ops', 'Produto'],
        description: `Oportunidade na ${company.name} focada em ${title}. Inscrição direta via Greenhouse.`,
        requirements: stacks.map(s => `Experiência com ${s}`),
        isActive: true,
        isAffirmative: affirmative.isAffirmative,
        affirmativeReason: affirmative.reason,
        distanceFromMuzambinhoKm: geoCheck.distance,
        hybridDaysPerWeek: geoCheck.days,
      });
    }
    return jobs;
  } catch (err) {
    return [];
  }
}

/**
 * 3. Descoberta Multi-Empresa em Lever
 */
async function scrapeLeverCompany(company) {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${company.slug}?mode=json`);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = [];

    for (const raw of data) {
      const title = raw.text || '';
      const desc = raw.descriptionPlain || '';
      const loc = raw.categories?.location || '';

      if (!isNicheRole(title, desc)) continue;

      const workplace = detectWorkplace(title, loc);
      const geoCheck = validateLocationAndRadius(workplace, loc, title, desc);
      if (!geoCheck.valid) continue;

      const affirmative = detectAffirmative(title, desc);
      const pubIso = new Date(raw.createdAt).toISOString();
      const daysOpen = calculateDaysOpen(pubIso);
      const stacks = extractStacks(`${title} ${desc}`);

      jobs.push({
        id: `lever_disc_${company.slug}_${raw.id}`,
        title,
        company: company.name,
        platform: 'lever',
        canonicalUrl: raw.hostedUrl,
        publishedAt: pubIso,
        daysOpen,
        workplaceType: workplace,
        location: loc || 'Remoto - Brasil',
        seniority: detectSeniority(title),
        stacks: stacks.length > 0 ? stacks : ['Automação', 'RevOps', 'Processos'],
        description: desc.slice(0, 400) || `Oportunidade de ${title} na ${company.name}.`,
        requirements: stacks.map(s => `Conhecimento em ${s}`),
        isActive: true,
        isAffirmative: affirmative.isAffirmative,
        affirmativeReason: affirmative.reason,
        distanceFromMuzambinhoKm: geoCheck.distance,
        hybridDaysPerWeek: geoCheck.days,
      });
    }
    return jobs;
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('================================================================');
  console.log('📡 RADAR VAGAS - DISCOVERY ENGINE ATIVADA');
  console.log('🎯 Nicho: AI Ops, RevOps, Automação (N8N) & Produto');
  console.log('📍 Filtro Geográfico: 100% Remoto OU Híbrido (<= 150km de Muzambinho - MG, max 2d)');
  console.log('🚫 Descarte: Desenvolvedores puros (backend/frontend tradicional)');
  console.log('================================================================\n');

  const allDiscovered = [];

  // 1. Busca dinâmica no Gupy por palavras-chave
  console.log('🔎 [1/3] Varrendo busca dinâmica pública de ATSs (Gupy Portal)...');
  for (const kw of SEARCH_KEYWORDS) {
    const results = await discoverGupyJobs(kw);
    if (results.length > 0) {
      console.log(`   ↳ Palavra-chave "${kw}": ${results.length} vagas de nicho encontradas`);
      allDiscovered.push(...results);
    }
  }

  // 2. Varredura Greenhouse em scale-ups
  console.log('\n🔎 [2/3] Varrendo scale-ups com Greenhouse...');
  for (const comp of EXPANDED_SCALEUP_SLUGS.greenhouse) {
    const jobs = await scrapeGreenhouseCompany(comp);
    if (jobs.length > 0) {
      console.log(`   ↳ ${comp.name}: ${jobs.length} vagas no nicho retidas`);
      allDiscovered.push(...jobs);
    }
  }

  // 3. Varredura Lever em scale-ups
  console.log('\n🔎 [3/3] Varrendo scale-ups com Lever...');
  for (const comp of EXPANDED_SCALEUP_SLUGS.lever) {
    const jobs = await scrapeLeverCompany(comp);
    if (jobs.length > 0) {
      console.log(`   ↳ ${comp.name}: ${jobs.length} vagas no nicho retidas`);
      allDiscovered.push(...jobs);
    }
  }

  // Deduplicação por URL Canônica e Título
  const uniqueMap = new Map();
  for (const j of allDiscovered) {
    const key = j.canonicalUrl || `${j.company}_${j.title}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, j);
    }
  }
  const finalized = Array.from(uniqueMap.values());

  const outDir = path.resolve('src/data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'liveJobs.json'), JSON.stringify(finalized, null, 2), 'utf-8');

  console.log('\n================================================================');
  console.log(`✅ DISCOBERTA CONCLUÍDA COM SUCESSO!`);
  console.log(`Total de vagas retidas estritamente no seu nicho: ${finalized.length}`);
  console.log(`Vagas afirmativas identificadas: ${finalized.filter(j => j.isAffirmative).length}`);
  console.log(`Vagas 100% remotas: ${finalized.filter(j => j.workplaceType === 'remoto').length}`);
  console.log(`Salvo em: src/data/liveJobs.json`);
  console.log('================================================================\n');
}

main();
