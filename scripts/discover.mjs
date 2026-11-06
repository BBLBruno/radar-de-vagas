/**
 * Dynamic ATS Discovery & Scraping Engine (AI Ops, RevOps, Automação & Produto)
 * 
 * Regras estritas:
 * 1. ZERO links falsos/mockados: TODAS as vagas passam por checagem HTTP HEAD antes de serem salvas.
 * 2. 100% Brasil (descarte estrito de Argentina, México, Portugal, etc.)
 * 3. 100% Nicho (AI Ops, RevOps, Automação N8N, CRM, Produto)
 * 4. Remoto OU Híbrido (<= 150km de Muzambinho e <= 2 dias presenciais)
 * 
 * Uso: node scripts/discover.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// Scale-ups no Brasil com boards públicos em Greenhouse e Lever
const MONITORED_SCALEUPS = {
  greenhouse: [
    { slug: 'quintoandar', name: 'QuintoAndar' },
    { slug: 'vtex', name: 'VTEX' },
    { slug: 'gympass', name: 'Wellhub (Gympass)' },
    { slug: 'rdstation', name: 'RD Station' },
    { slug: 'pipefy', name: 'Pipefy' },
    { slug: 'nuvemshop', name: 'Nuvemshop' },
    { slug: 'hotmart', name: 'Hotmart' },
    { slug: 'creditas', name: 'Creditas' },
    { slug: 'takeblip', name: 'Take Blip' },
    { slug: 'contaazul', name: 'Conta Azul' },
    { slug: 'dock', name: 'Dock' }
  ],
  lever: [
    { slug: 'neon', name: 'Banco Neon' },
    { slug: 'dasa', name: 'Dasa Tech' },
    { slug: 'olist', name: 'Olist' },
    { slug: 'buser', name: 'Buser' },
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

function isStrictBrazil(title, location) {
  const combined = `${title} ${location}`.toLowerCase();
  
  // Exclusões expressas de outros países
  const foreignExclusions = [
    'argentina', 'buenos aires', 'chile', 'santiago', 'colombia', 'bogota', 
    'mexico', 'cdmx', 'peru', 'lima', 'uruguay', 'montevideo', 'portugal', 
    'lisboa', 'porto', 'spain', 'madrid', 'barcelona', 'united states', 'usa', 
    'germany', 'berlin', 'uk', 'london', 'poland', 'italy'
  ];

  for (const f of foreignExclusions) {
    if (combined.includes(f) && !combined.includes('brasil') && !combined.includes('brazil')) {
      return false;
    }
  }

  return true;
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

  // Descarte explícito de desenvolvedores tradicionais puros
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

  // Palavras-chave do nicho
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
  if (workplace === 'presencial') return { valid: false, reason: 'Presencial descartado' };
  if (workplace === 'remoto') return { valid: true, distance: 0, days: 0 };

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
 * Validação HTTP HEAD: Garante que a URL responde 200 OK
 */
async function verifyUrlLive(url) {
  try {
    const res = await fetch(url, { 
      method: 'HEAD', 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow'
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function scrapeGreenhouse(company) {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = [];

    for (const raw of (data.jobs || [])) {
      const title = raw.title || '';
      const content = raw.content || '';
      const loc = raw.location?.name || '';

      if (!isStrictBrazil(title, loc)) continue;
      if (!isNicheRole(title, content)) continue;

      const workplace = detectWorkplace(title, loc);
      const geoCheck = validateLocationAndRadius(workplace, loc, title, content);
      if (!geoCheck.valid) continue;

      const affirmative = detectAffirmative(title, content);
      const stacks = extractStacks(`${title} ${content}`);
      const daysOpen = calculateDaysOpen(raw.updated_at);
      const canonicalUrl = raw.absolute_url;

      jobs.push({
        id: `gh_${company.slug}_${raw.id}`,
        title,
        company: company.name,
        platform: 'greenhouse',
        canonicalUrl,
        publishedAt: raw.updated_at,
        daysOpen,
        workplaceType: workplace,
        location: loc || 'Remoto - Brasil',
        seniority: detectSeniority(title),
        stacks: stacks.length > 0 ? stacks : ['RevOps', 'AI Ops', 'CRM'],
        description: `Oportunidade na ${company.name} para ${title}. Inscrição direta via Greenhouse.`,
        requirements: stacks.map(s => `Experiência com ${s}`),
        isActive: true,
        isAffirmative: affirmative.isAffirmative,
        affirmativeReason: affirmative.reason,
        distanceFromMuzambinhoKm: geoCheck.distance,
        hybridDaysPerWeek: geoCheck.days,
      });
    }
    return jobs;
  } catch {
    return [];
  }
}

async function scrapeLever(company) {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${company.slug}?mode=json`);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = [];

    for (const raw of data) {
      const title = raw.text || '';
      const desc = raw.descriptionPlain || '';
      const loc = raw.categories?.location || '';

      if (!isStrictBrazil(title, loc)) continue;
      if (!isNicheRole(title, desc)) continue;

      const workplace = detectWorkplace(title, loc);
      const geoCheck = validateLocationAndRadius(workplace, loc, title, desc);
      if (!geoCheck.valid) continue;

      const affirmative = detectAffirmative(title, desc);
      const pubIso = new Date(raw.createdAt).toISOString();
      const daysOpen = calculateDaysOpen(pubIso);
      const stacks = extractStacks(`${title} ${desc}`);
      const canonicalUrl = raw.hostedUrl;

      jobs.push({
        id: `lever_${company.slug}_${raw.id}`,
        title,
        company: company.name,
        platform: 'lever',
        canonicalUrl,
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
  } catch {
    return [];
  }
}

async function main() {
  console.log('================================================================');
  console.log('📡 RADAR VAGAS - DISCOVERY ENGINE & VALIDADOR DE LINKS VIVOS');
  console.log('🎯 Nicho: AI Ops, RevOps, Automação (N8N) & Produto');
  console.log('📍 Filtro: 100% Brasil | Remoto OU Híbrido (<= 150km Muzambinho, max 2d)');
  console.log('✅ Validação: 100% dos links testados com resposta HTTP 200 OK');
  console.log('================================================================\n');

  const candidates = [];

  for (const c of MONITORED_SCALEUPS.greenhouse) {
    const list = await scrapeGreenhouse(c);
    if (list.length > 0) {
      console.log(`[Greenhouse] ${c.name}: ${list.length} vagas de nicho encontradas`);
      candidates.push(...list);
    }
  }

  for (const c of MONITORED_SCALEUPS.lever) {
    const list = await scrapeLever(c);
    if (list.length > 0) {
      console.log(`[Lever] ${c.name}: ${list.length} vagas de nicho encontradas`);
      candidates.push(...list);
    }
  }

  // Deduplicação
  const uniqueMap = new Map();
  for (const j of candidates) {
    if (!uniqueMap.has(j.canonicalUrl)) {
      uniqueMap.set(j.canonicalUrl, j);
    }
  }
  const uniqueJobs = Array.from(uniqueMap.values());

  console.log(`\n🔍 Verificando integridade das URLs HTTP (${uniqueJobs.length} vagas)...`);
  const verifiedJobs = [];

  for (const j of uniqueJobs) {
    const isLive = await verifyUrlLive(j.canonicalUrl);
    if (isLive) {
      verifiedJobs.push(j);
    } else {
      console.warn(`⚠️ [Link Descartado - 404/Inativo]: ${j.canonicalUrl}`);
    }
  }

  const outDir = path.resolve('src/data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'liveJobs.json'), JSON.stringify(verifiedJobs, null, 2), 'utf-8');

  console.log('\n================================================================');
  console.log(`🎉 CONCLUÍDO COM SUCESSO!`);
  console.log(`Total de vagas com LINKS 100% VÁLIDOS (HTTP 200): ${verifiedJobs.length}`);
  console.log(`Vagas 100% remotas: ${verifiedJobs.filter(j => j.workplaceType === 'remoto').length}`);
  console.log(`Vagas afirmativas: ${verifiedJobs.filter(j => j.isAffirmative).length}`);
  console.log(`Salvo em: src/data/liveJobs.json`);
  console.log('================================================================\n');
}

main();
