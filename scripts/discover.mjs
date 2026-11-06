/**
 * Motor Generalizado de Descoberta de Vagas (Brasil & Internacional 100% Remoto)
 * 
 * Fontes integradas (Qualquer empresa, todas as senioridades e modalidades):
 * 1. Gupy Global Search (Busca aberta em milhares de empresas no Brasil - Remoto, Híbrido e Presencial)
 * 2. EmpregosTec (www.empregostec.com.br/feed/) + Extração direta de links InHire, Gupy, Sólides
 * 3. InHire Discovery (Vagas diretas *.inhire.app de dezenas de empresas)
 * 4. Comunidades Tech Brasil (GitHub: backend-br, frontendbr, qa-brasil, datascience-br)
 * 5. Greenhouse & Lever Multi-Board Index (Brasil - Remoto, Híbrido e Presencial)
 * 6. Vagas Internacionais 100% Remotas (Remotive API, Jobicy API, Arbeitnow Remote API)
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const GUPY_SEARCH_TERMS = [
  'analista de implantacao',
  'onboarding',
  'suporte tecnico',
  'analista de suporte',
  'analista de dados',
  'analista de bi',
  'power bi',
  'sales ops',
  'revops',
  'operacoes comerciais',
  'analista de crm',
  'hubspot',
  'n8n',
  'automacao de processos',
  'analista de processos',
  'analista de requisitos',
  'analista de produto',
  'product owner',
  'analista de sistemas',
  'desenvolvedor junior',
  'desenvolvedor pleno',
  'estagio ti',
  'qa',
  'devops'
];

const GREENHOUSE_BOARDS = [
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
];

const LEVER_BOARDS = [
  { slug: 'neon', name: 'Banco Neon' },
  { slug: 'dasa', name: 'Dasa Tech' },
  { slug: 'olist', name: 'Olist' },
  { slug: 'buser', name: 'Buser' },
  { slug: 'zup', name: 'Zup Innovation' }
];

const GITHUB_REPOS = [
  { repo: 'backend-br/vagas', label: 'Backend BR' },
  { repo: 'frontendbr/vagas', label: 'Frontend BR' },
  { repo: 'qa-brasil/vagas', label: 'QA Brasil' },
  { repo: 'datascience-br/vagas', label: 'Data Science BR' }
];

const DISTANCES_TO_MUZAMBINHO = {
  'muzambinho': 0, 'guaxupe': 18, 'guaxupé': 18, 'monte belo': 25, 'juruaia': 30,
  'mococa': 45, 'pocos de caldas': 55, 'poços de caldas': 55, 'alfenas': 65,
  'sao joao da boa vista': 85, 'são joão da boa vista': 85, 'varginha': 115,
  'pouso alegre': 120, 'ribeirao preto': 135, 'ribeirão preto': 135, 'araras': 140,
  'rio claro': 150, 'campinas': 195, 'sao paulo': 285, 'são paulo': 285,
  'belo horizonte': 380, 'rio de janeiro': 450, 'curitiba': 540, 'porto alegre': 950
};

function calculateDistanceToMuzambinho(location) {
  if (!location) return undefined;
  const l = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [city, dist] of Object.entries(DISTANCES_TO_MUZAMBINHO)) {
    const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (l.includes(cleanCity)) return dist;
  }
  return undefined;
}

function calculateDaysOpen(isoDate) {
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return 1;
  const diffTime = Math.max(0, new Date().getTime() - parsed.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function detectSeniority(title, desc = '') {
  const t = title.toLowerCase();
  const full = `${title} ${desc}`.toLowerCase();

  // Palavras executivas / liderança / especialista no título têm prioridade
  if (
    /\b(staff|principal|director|diretor|head|lead|líder|lider|especialista|specialist|manager|gerente|coordenador|coordinator|vp|chief|architect|arquiteto)\b/i.test(t)
  ) {
    return 'especialista';
  }
  if (/\b(estágio|estagio|estagiário|estagiario|intern|internship|trainee)\b/i.test(t)) {
    return 'estagio';
  }
  if (/\b(sênior|senior|sr\.?|iii)\b/i.test(t)) {
    return 'senior';
  }
  if (/\b(júnior|junior|jr\.?|assistente|auxiliar|entry|associate|trainee| i |nível 1|n1)\b/i.test(t)) {
    return 'junior';
  }
  if (/\b(pleno|pl\.?|mid|ii|nível 2|n2)\b/i.test(t)) {
    return 'pleno';
  }

  if (full.includes('júnior') || full.includes('junior')) return 'junior';
  if (full.includes('sênior') || full.includes('senior')) return 'senior';
  return 'pleno';
}

function detectCategories(title, desc = '') {
  const t = title.toLowerCase();
  const combined = `${title} ${desc}`.toLowerCase();
  const cats = [];

  if (/\b(implanta[çc][ãa]o|onboarding|implementation|ativac[ãa]o|customer success|cs|setup)\b/i.test(combined)) {
    cats.push('implantacao');
  }
  if (/\b(suporte|support|service desk|help desk|n1|n2|n3|sustenta[çc][ãa]o|atendimento t[ée]cnico)\b/i.test(combined)) {
    cats.push('suporte');
  }
  if (/\b(dados|data|bi\b|business intelligence|power bi|looker|metabase|analytics|sql|etl)\b/i.test(combined)) {
    cats.push('dados_bi');
  }
  if (/\b(revops|revenue operations|sales ops|sales operations|crm|hubspot|salesforce|pipedrive|rd station|opera[çc][õo]es comerciais|comercial)\b/i.test(combined)) {
    cats.push('crm_revops');
  }
  if (/\b(n8n|zapier|make\.com|automa[çc][ãa]o|automation|rpa|ai ops|aiops|agentes de ia|ai agents|processos|bpm|bpmn|prompt)\b/i.test(combined)) {
    cats.push('automacao_ia');
  }
  if (/\b(product owner|\bpo\b|product manager|\bpm\b|analista de produto|analista de requisitos|analista de neg[óo]cios|business analyst|discovery)\b/i.test(combined)) {
    cats.push('produto');
  }
  if (/\b(desenvolvedor|developer|software engineer|engenheiro de software|frontend|front-end|backend|back-end|full stack|fullstack|mobile|react|node|java|python|php|dotnet|\.net|golang)\b/i.test(t)) {
    cats.push('desenvolvimento');
  }
  if (/\b(qa|quality assurance|testes|tester|devops|sre|cloud|infraestrutura|seguran[çc]a|cybersecurity|redes)\b/i.test(t)) {
    cats.push('qa_infra');
  }

  if (cats.length === 0) cats.push('geral');
  return cats;
}

function detectAffirmative(title, desc = '') {
  const t = title.toLowerCase();
  const combined = `${title} ${desc}`.toLowerCase();

  if (/\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(pcd|pcds|defici[êe]ncia)\b/i.test(combined) || /\bvaga\s+exclusiva\s+para\s+pcd/i.test(combined) || /\(pcd\)/i.test(t)) {
    return { isAffirmative: true, reason: 'Afirmativa PcD' };
  }
  if (/\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(mulher|mulheres|feminina)\b/i.test(combined)) {
    return { isAffirmative: true, reason: 'Afirmativa Mulheres' };
  }
  if (/\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(negr[ao]s?|pret[ao]s?|pard[ao]s?)\b/i.test(combined)) {
    return { isAffirmative: true, reason: 'Afirmativa Pessoas Negras' };
  }
  if (/\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(lgbt|lgbtqia\+|trans)\b/i.test(combined)) {
    return { isAffirmative: true, reason: 'Afirmativa LGBTQIA+' };
  }
  if (/\bvaga\s+afirmativa\b|\bprograma\s+afirmativo\b/i.test(combined)) {
    return { isAffirmative: true, reason: 'Vaga Afirmativa' };
  }
  return { isAffirmative: false };
}

const TECH_DICTIONARY = [
  { label: 'N8N', regex: /\bn8n\b/i },
  { label: 'Make.com', regex: /\b(make\.com|integromat)\b/i },
  { label: 'Zapier', regex: /\bzapier\b/i },
  { label: 'Power BI', regex: /\bpower\s*bi\b/i },
  { label: 'SQL', regex: /\b(sql|mysql|postgresql|postgres|oracle)\b/i },
  { label: 'HubSpot', regex: /\bhubspot\b/i },
  { label: 'Salesforce', regex: /\bsalesforce\b/i },
  { label: 'CRM', regex: /\bcrm\b/i },
  { label: 'RevOps', regex: /\b(revops|revenue operations)\b/i },
  { label: 'Sales Ops', regex: /\b(sales ops|sales operations)\b/i },
  { label: 'Suporte N2', regex: /\b(suporte t[ée]cnico|suporte n2|service desk|sustenta[çc][ãa]o)\b/i },
  { label: 'Implantação', regex: /\b(implanta[çc][ãa]o|onboarding|implementation)\b/i },
  { label: 'Python', regex: /\bpython\b/i },
  { label: 'JavaScript', regex: /\bjavascript\b/i },
  { label: 'TypeScript', regex: /\btypescript\b/i },
  { label: 'React', regex: /\breact\b/i },
  { label: 'Node.js', regex: /\bnode(\.js|js)?\b/i },
  { label: 'Java', regex: /\bjava\b/i },
  { label: 'C# / .NET', regex: /\b(c#|\.net|dotnet)\b/i },
  { label: 'PHP', regex: /\bphp\b/i },
  { label: 'Go', regex: /\b(golang)\b/i },
  { label: 'AWS', regex: /\baws\b/i },
  { label: 'Docker', regex: /\bdocker\b/i },
  { label: 'Jira', regex: /\bjira\b/i },
  { label: 'BPMN / Processos', regex: /\b(bpmn|bizagi|mapeamento de processos)\b/i },
  { label: 'APIs / Webhooks', regex: /\b(api rest|rest api|webhooks|postman|integra[çc][õo]es)\b/i },
  { label: 'IA / LLMs', regex: /\b(openai|langchain|llm|intelig[êe]ncia artificial|ai agents|agentes de ia)\b/i },
  { label: 'Excel / Sheets', regex: /\b(excel|google sheets|planilhas)\b/i },
  { label: 'QA / Testes', regex: /\b(cypress|playwright|selenium|qa)\b/i }
];

function extractStacks(text) {
  const found = [];
  for (const item of TECH_DICTIONARY) {
    if (item.regex.test(text)) {
      found.push(item.label);
    }
  }
  return found;
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 1. Coleta Gupy Global Search (Qualquer empresa no Brasil: Remoto, Híbrido e Presencial)
 */
async function scrapeGupyGlobal() {
  console.log('🔎 [1/5] Varrendo Gupy Global Search (Todas as empresas no Brasil)...');
  const jobs = [];

  for (const term of GUPY_SEARCH_TERMS) {
    try {
      const url = `https://portal.gupy.io/job-search/term=${encodeURIComponent(term)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (!res.ok) continue;

      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!match) continue;

      const nextData = JSON.parse(match[1]);
      const list = nextData.props?.pageProps?.initialJobList?.data || [];

      for (const raw of list) {
        const daysOpen = calculateDaysOpen(raw.publishedDate);
        if (daysOpen > 30) continue;

        const workplace = 
          raw.workplaceType === 'remote' ? 'remoto' :
          raw.workplaceType === 'hybrid' ? 'hibrido' : 'presencial';

        const city = raw.city || '';
        const state = raw.state || '';
        const location = workplace === 'remoto' 
          ? (city ? `Remoto (${city} - ${state})` : 'Remoto - Brasil')
          : `${city ? city + ', ' : ''}${state || 'Brasil'}`;

        const cleanDesc = stripHtml(raw.description || '');
        const stacks = extractStacks(`${raw.name} ${cleanDesc}`);
        const categories = detectCategories(raw.name, cleanDesc);
        const affirmative = detectAffirmative(raw.name, cleanDesc);

        jobs.push({
          id: `gupy_${raw.id}`,
          title: raw.name.trim(),
          company: raw.careerPageName || 'Empresa na Gupy',
          companyLogo: raw.careerPageLogo,
          platform: 'gupy',
          canonicalUrl: raw.jobUrl,
          publishedAt: raw.publishedDate,
          daysOpen,
          workplaceType: workplace,
          location,
          city,
          state,
          seniority: detectSeniority(raw.name, cleanDesc),
          stacks: stacks.length > 0 ? stacks : ['TI / Digital'],
          description: cleanDesc.slice(0, 500) || `Vaga para ${raw.name} na empresa ${raw.careerPageName}.`,
          requirements: stacks.map(s => `Conhecimento em ${s}`),
          isActive: true,
          isAffirmative: affirmative.isAffirmative,
          affirmativeReason: affirmative.reason,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: calculateDistanceToMuzambinho(location),
          isInternational: false,
        });
      }
    } catch {}
  }

  console.log(`   ✅ Gupy Global: ${jobs.length} vagas coletadas de múltiplas empresas.`);
  return jobs;
}

/**
 * 2. Coleta EmpregosTec (www.empregostec.com.br) + Extração de InHire, Gupy, Sólides (1000 itens do feed)
 */
async function scrapeEmpregosTec() {
  console.log('🔎 [2/5] Varrendo EmpregosTec (www.empregostec.com.br) & InHire / Gupy / Sólides...');
  const jobs = [];

  try {
    const res = await fetch('https://www.empregostec.com.br/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

    for (const itemXml of items) {
      const rawTitle = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
      const pubDateStr = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
      const contentEncoded = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || '';
      const descCdata = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || '';

      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
      const publishedAt = isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString();
      const daysOpen = calculateDaysOpen(publishedAt);
      if (daysOpen > 30) continue;

      const applyMatch = contentEncoded.match(/<a href=["']([^"']+)["'][^>]*>Candidatar-se agora/i);
      const canonicalUrl = applyMatch ? applyMatch[1].trim() : link;
      if (!canonicalUrl) continue;

      const companyMatch = contentEncoded.match(/<strong>Empresa:<\/strong>\s*([^<]+)/i) ||
                           rawTitle.match(/na empresa\s+(.+)$/i);
      const company = companyMatch ? stripHtml(companyMatch[1]).trim() : 'Empresa Verificada';

      const title = stripHtml(rawTitle)
        .replace(/^Vaga Home Office:\s*/i, '')
        .replace(/\s+na empresa\s+.+$/i, '')
        .trim();

      let platform = 'empregostec';
      const urlLower = canonicalUrl.toLowerCase();
      if (urlLower.includes('inhire.app')) platform = 'inhire';
      else if (urlLower.includes('gupy.io')) platform = 'gupy';
      else if (urlLower.includes('solides')) platform = 'solides';
      else if (urlLower.includes('greenhouse.io')) platform = 'greenhouse';
      else if (urlLower.includes('lever.co')) platform = 'lever';

      const cleanDesc = stripHtml(descCdata || contentEncoded);
      const stacks = extractStacks(`${title} ${cleanDesc}`);
      const categories = detectCategories(title, cleanDesc);
      const affirmative = detectAffirmative(title, cleanDesc);

      jobs.push({
        id: `et_${Buffer.from(canonicalUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-24)}`,
        title,
        company,
        platform,
        canonicalUrl,
        publishedAt,
        daysOpen,
        workplaceType: 'remoto',
        location: 'Remoto - Brasil',
        seniority: detectSeniority(title, cleanDesc),
        stacks: stacks.length > 0 ? stacks : ['Remoto', 'Tecnologia'],
        description: cleanDesc.slice(0, 480),
        requirements: stacks.map(s => `Experiência ou conhecimento em ${s}`),
        isActive: true,
        isAffirmative: affirmative.isAffirmative,
        affirmativeReason: affirmative.reason,
        nicheCategories: categories,
        distanceFromMuzambinhoKm: 0,
        isInternational: false,
      });
    }
  } catch (err) {
    console.error('   ⚠️ Erro no EmpregosTec:', err.message);
  }

  console.log(`   ✅ EmpregosTec + InHire/Gupy/Sólides: ${jobs.length} vagas extraídas com links diretos.`);
  return jobs;
}

/**
 * 3. Coleta Comunidades Tech Brasil (GitHub Issues Vagas)
 */
async function scrapeGitHubCommunities() {
  console.log('🔎 [3/5] Varrendo Comunidades Tech Brasil (backend-br, frontendbr, qa-brasil, datascience-br)...');
  const jobs = [];

  for (const source of GITHUB_REPOS) {
    try {
      const url = `https://api.github.com/repos/${source.repo}/issues?state=open&per_page=30`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'RadarVagasTI-Aggregator',
          'Accept': 'application/json'
        }
      });
      if (!res.ok) continue;

      const issues = await res.json();
      for (const issue of issues) {
        if (issue.pull_request) continue;

        const daysOpen = calculateDaysOpen(issue.created_at);
        if (daysOpen > 30) continue;

        const rawTitle = issue.title || '';
        const body = issue.body || '';
        const labels = (issue.labels || []).map(l => l.name.toLowerCase()).join(' ');

        const combined = `${rawTitle} ${labels} ${body}`.toLowerCase();
        const workplace = 
          combined.includes('remoto') || combined.includes('home office') ? 'remoto' :
          combined.includes('híbrido') || combined.includes('hibrido') ? 'hibrido' : 'presencial';

        const companyMatch = rawTitle.match(/(?:na|no|at|@|-)\s+([A-Z0-9][A-Za-z0-9\s.&-]+)$/);
        const company = companyMatch ? companyMatch[1].trim() : source.label;

        const stacks = extractStacks(`${rawTitle} ${labels} ${body}`);
        const categories = detectCategories(rawTitle, body);
        const affirmative = detectAffirmative(rawTitle, body);

        jobs.push({
          id: `gh_issue_${issue.id}`,
          title: rawTitle.replace(/^\[.*?\]\s*/, '').trim(),
          company,
          platform: 'github_vagas',
          canonicalUrl: issue.html_url,
          publishedAt: issue.created_at,
          daysOpen,
          workplaceType: workplace,
          location: workplace === 'remoto' ? 'Remoto - Brasil' : 'Brasil',
          seniority: detectSeniority(rawTitle, labels),
          stacks: stacks.length > 0 ? stacks : ['Desenvolvimento', 'TI'],
          description: stripHtml(body).slice(0, 480) || `Vaga publicada na comunidade ${source.label}.`,
          requirements: stacks.map(s => `Conhecimento em ${s}`),
          isActive: true,
          isAffirmative: affirmative.isAffirmative,
          affirmativeReason: affirmative.reason,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: calculateDistanceToMuzambinho(rawTitle),
          isInternational: false,
        });
      }
    } catch {}
  }

  console.log(`   ✅ Comunidades GitHub BR: ${jobs.length} vagas coletadas.`);
  return jobs;
}

/**
 * 4. Coleta Greenhouse & Lever Multi-Boards (Brasil - Remoto, Híbrido e Presencial)
 */
async function scrapeGreenhouseAndLever() {
  console.log('🔎 [4/5] Varrendo Boards Greenhouse & Lever no Brasil...');
  const jobs = [];

  for (const company of GREENHOUSE_BOARDS) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`);
      if (!res.ok) continue;
      const data = await res.json();

      for (const raw of (data.jobs || [])) {
        const loc = raw.location?.name || '';
        const locLower = loc.toLowerCase();

        const isForeign = ['argentina', 'mexico', 'colombia', 'chile', 'peru', 'portugal', 'spain', 'usa', 'united states', 'germany', 'uk'].some(
          f => locLower.includes(f) && !locLower.includes('brazil') && !locLower.includes('brasil')
        );
        if (isForeign) continue;

        const daysOpen = calculateDaysOpen(raw.updated_at);
        if (daysOpen > 30) continue;

        const combined = `${raw.title} ${loc}`.toLowerCase();
        const workplace = 
          combined.includes('remote') || combined.includes('remoto') ? 'remoto' :
          combined.includes('hybrid') || combined.includes('híbrido') || combined.includes('hibrido') ? 'hibrido' : 'presencial';

        const cleanDesc = stripHtml(raw.content || '');
        const stacks = extractStacks(`${raw.title} ${cleanDesc}`);
        const categories = detectCategories(raw.title, cleanDesc);
        const affirmative = detectAffirmative(raw.title, cleanDesc);

        jobs.push({
          id: `gh_${company.slug}_${raw.id}`,
          title: raw.title,
          company: company.name,
          platform: 'greenhouse',
          canonicalUrl: raw.absolute_url,
          publishedAt: raw.updated_at,
          daysOpen,
          workplaceType: workplace,
          location: loc || 'Brasil',
          seniority: detectSeniority(raw.title, cleanDesc),
          stacks: stacks.length > 0 ? stacks : ['Tecnologia'],
          description: cleanDesc.slice(0, 450) || `Vaga na ${company.name} via Greenhouse.`,
          requirements: stacks.map(s => `Experiência com ${s}`),
          isActive: true,
          isAffirmative: affirmative.isAffirmative,
          affirmativeReason: affirmative.reason,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: calculateDistanceToMuzambinho(loc),
          isInternational: false,
        });
      }
    } catch {}
  }

  for (const company of LEVER_BOARDS) {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${company.slug}?mode=json`);
      if (!res.ok) continue;
      const list = await res.json();

      for (const raw of list) {
        const loc = raw.categories?.location || '';
        const pubIso = new Date(raw.createdAt).toISOString();
        const daysOpen = calculateDaysOpen(pubIso);
        if (daysOpen > 30) continue;

        const combined = `${raw.text} ${loc} ${raw.categories?.workplaceType || ''}`.toLowerCase();
        const workplace = 
          combined.includes('remote') || combined.includes('remoto') ? 'remoto' :
          combined.includes('hybrid') || combined.includes('híbrido') ? 'hibrido' : 'presencial';

        const cleanDesc = stripHtml(raw.descriptionPlain || '');
        const stacks = extractStacks(`${raw.text} ${cleanDesc}`);
        const categories = detectCategories(raw.text, cleanDesc);
        const affirmative = detectAffirmative(raw.text, cleanDesc);

        jobs.push({
          id: `lever_${company.slug}_${raw.id}`,
          title: raw.text,
          company: company.name,
          platform: 'lever',
          canonicalUrl: raw.hostedUrl,
          publishedAt: pubIso,
          daysOpen,
          workplaceType: workplace,
          location: loc || 'Brasil',
          seniority: detectSeniority(raw.text, cleanDesc),
          stacks: stacks.length > 0 ? stacks : ['Tecnologia'],
          description: cleanDesc.slice(0, 450) || `Vaga na ${company.name} via Lever.`,
          requirements: stacks.map(s => `Conhecimento em ${s}`),
          isActive: true,
          isAffirmative: affirmative.isAffirmative,
          affirmativeReason: affirmative.reason,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: calculateDistanceToMuzambinho(loc),
          isInternational: false,
        });
      }
    } catch {}
  }

  console.log(`   ✅ Greenhouse & Lever: ${jobs.length} vagas coletadas.`);
  return jobs;
}

/**
 * 5. Coleta Vagas Internacionais 100% Remotas (Remotive, Jobicy, Arbeitnow)
 */
async function scrapeInternationalRemote() {
  console.log('🔎 [5/5] Varrendo Vagas Internacionais 100% Remotas (Remotive, Jobicy & Arbeitnow)...');
  const jobs = [];

  // 5A. Remotive API
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=80', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const data = await res.json();
      for (const raw of (data.jobs || [])) {
        const daysOpen = calculateDaysOpen(raw.publication_date);
        if (daysOpen > 30) continue;

        const cleanDesc = stripHtml(raw.description || '');
        const stacks = extractStacks(`${raw.title} ${raw.category || ''} ${(raw.tags || []).join(' ')} ${cleanDesc}`);
        const categories = detectCategories(raw.title, `${raw.category || ''} ${cleanDesc}`);

        jobs.push({
          id: `remotive_${raw.id}`,
          title: raw.title,
          company: raw.company_name || 'Global Remote Company',
          companyLogo: raw.company_logo,
          platform: 'remotive_intl',
          canonicalUrl: raw.url,
          publishedAt: new Date(raw.publication_date).toISOString(),
          daysOpen,
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${raw.candidate_required_location || 'Worldwide / LATAM'})`,
          seniority: detectSeniority(raw.title, cleanDesc),
          stacks: stacks.length > 0 ? stacks : ['Remote', 'English'],
          salary: raw.salary || undefined,
          description: cleanDesc.slice(0, 480),
          requirements: stacks.map(s => `Experience with ${s}`),
          isActive: true,
          isAffirmative: false,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: 0,
          isInternational: true,
        });
      }
    }
  } catch {}

  // 5B. Jobicy API (100% Remote)
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=50', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const data = await res.json();
      for (const raw of (data.jobs || [])) {
        const title = raw.jobTitle || raw.title || '';
        if (!title) continue;

        const daysOpen = calculateDaysOpen(raw.pubDate);
        if (daysOpen > 30) continue;

        const cleanDesc = stripHtml(raw.jobDescription || raw.jobExcerpt || '');
        const stacks = extractStacks(`${title} ${cleanDesc}`);
        const categories = detectCategories(title, cleanDesc);

        jobs.push({
          id: `jobicy_${raw.id}`,
          title: stripHtml(title),
          company: raw.companyName || 'Global Remote',
          companyLogo: raw.companyLogo,
          platform: 'remotive_intl',
          canonicalUrl: raw.url,
          publishedAt: new Date(raw.pubDate).toISOString(),
          daysOpen,
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${raw.jobGeo || 'Global'})`,
          seniority: detectSeniority(title, cleanDesc),
          stacks: stacks.length > 0 ? stacks : ['Remote', 'Global'],
          salary: raw.annualSalaryMin ? `USD ${raw.annualSalaryMin} - ${raw.annualSalaryMax}/ano` : undefined,
          description: cleanDesc.slice(0, 480),
          requirements: stacks.map(s => `Experience with ${s}`),
          isActive: true,
          isAffirmative: false,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: 0,
          isInternational: true,
        });
      }
    }
  } catch {}

  // 5C. Arbeitnow Remote API (apenas vagas com remote === true)
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const data = await res.json();
      for (const raw of (data.data || [])) {
        if (!raw.remote) continue;
        const pubIso = raw.created_at ? new Date(raw.created_at * 1000).toISOString() : new Date().toISOString();
        const daysOpen = calculateDaysOpen(pubIso);
        if (daysOpen > 30) continue;

        const cleanDesc = stripHtml(raw.description || '');
        const stacks = extractStacks(`${raw.title} ${(raw.tags || []).join(' ')} ${cleanDesc}`);
        const categories = detectCategories(raw.title, cleanDesc);

        jobs.push({
          id: `arbeit_${raw.slug?.slice(0, 28) || Math.random()}`,
          title: raw.title,
          company: raw.company_name || 'Global Remote',
          platform: 'remotive_intl',
          canonicalUrl: raw.url,
          publishedAt: pubIso,
          daysOpen,
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${raw.location || 'Global / Remote'})`,
          seniority: detectSeniority(raw.title, cleanDesc),
          stacks: stacks.length > 0 ? stacks : ['Remote', 'International'],
          description: cleanDesc.slice(0, 480),
          requirements: stacks.map(s => `Experience with ${s}`),
          isActive: true,
          isAffirmative: false,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: 0,
          isInternational: true,
        });
      }
    }
  } catch {}

  console.log(`   ✅ Internacionais 100% Remotas: ${jobs.length} vagas coletadas.`);
  return jobs;
}

async function main() {
  console.log('================================================================');
  console.log('📡 RADAR VAGAS TI - MOTOR DE BUSCA GENERALIZADO MULTIFONTES');
  console.log('🌐 Fontes: Gupy Global, InHire, EmpregosTec, GitHub BR, Greenhouse, Lever & Internacional Remoto');
  console.log('================================================================\n');

  const [gupyJobs, etJobs, ghIssueJobs, atsJobs, intlJobs] = await Promise.all([
    scrapeGupyGlobal(),
    scrapeEmpregosTec(),
    scrapeGitHubCommunities(),
    scrapeGreenhouseAndLever(),
    scrapeInternationalRemote(),
  ]);

  const allCandidates = [
    ...gupyJobs,
    ...etJobs,
    ...ghIssueJobs,
    ...atsJobs,
    ...intlJobs,
  ];

  const uniqueMap = new Map();
  for (const job of allCandidates) {
    if (!job.canonicalUrl || !job.title) continue;
    const normKey = `${job.company.toLowerCase().trim()}_${job.title.toLowerCase().trim()}_${job.workplaceType}`;
    if (!uniqueMap.has(job.canonicalUrl) && !uniqueMap.has(normKey)) {
      uniqueMap.set(job.canonicalUrl, job);
      uniqueMap.set(normKey, job);
    }
  }

  const deduplicated = Array.from(new Set(uniqueMap.values()));

  const outDir = path.resolve('src/data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'liveJobs.json'), JSON.stringify(deduplicated, null, 2), 'utf-8');

  const byPlatform = {};
  const byWorkplace = {};
  const bySeniority = {};
  deduplicated.forEach(j => {
    byPlatform[j.platform] = (byPlatform[j.platform] || 0) + 1;
    byWorkplace[j.workplaceType] = (byWorkplace[j.workplaceType] || 0) + 1;
    bySeniority[j.seniority] = (bySeniority[j.seniority] || 0) + 1;
  });

  console.log('\n================================================================');
  console.log(`🎉 VARREDURA CONCLUÍDA COM SUCESSO!`);
  console.log(`Total de vagas únicas indexadas: ${deduplicated.length}`);
  console.log(`Por Plataforma:`, byPlatform);
  console.log(`Por Modalidade:`, byWorkplace);
  console.log(`Por Senioridade:`, bySeniority);
  console.log(`Vagas Internacionais (100% Remotas): ${deduplicated.filter(j => j.isInternational).length}`);
  console.log(`Salvo em: src/data/liveJobs.json`);
  console.log('================================================================\n');
}

main();
