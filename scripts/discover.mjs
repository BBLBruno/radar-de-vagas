/**
 * Motor de Descoberta de Vagas - Foco 100% em Operações de Negócios (BizOps),
 * Processos, Inteligência de Mercado/Comercial, Dados/BI, CRM/RevOps,
 * Automação (N8N/IA) e Implantação/Onboarding.
 *
 * Fontes Nacionais (Brasil - Remoto, Híbrido e Presencial):
 * - Gupy Global Search (Qualquer empresa no Brasil)
 * - EmpregosTec + InHire + Sólides
 * - Greenhouse & Lever Brasil
 *
 * Fontes Internacionais (100% Remoto Global / LATAM / Worldwide):
 * - The Muse Remote API (Business Operations, Data & Analytics, Project Management, Account Management)
 * - Remotive API (Business, Data, Sales, Marketing, Product, Project Management)
 * - Jobicy API (Business, Data Science, Management, Marketing, Admin, Operations)
 * - Himalayas Global Remote API
 * - Working Nomads API (Operations, Management, Data, Marketing, Sales, Consulting)
 * - WeWorkRemotely RSS Feeds (Management, Product, Sales & Marketing, All Other)
 * - Greenhouse & Lever Global Remote Boards (HubSpot, Zapier, Deel, Remote, Pipedrive, ClickUp, Airtable, Notion, Miro, Klaviyo, Apollo, etc.)
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// Termos de busca no Brasil (incluindo explicitamente os termos Júnior solicitados)
const GUPY_SEARCH_TERMS = [
  // Termos Júnior explícitos solicitados
  'Analista de Operações Júnior',
  'Analista de Processos Júnior',
  'Inteligência de Mercado Júnior',
  'Inteligência Comercial Júnior',
  'Analista de Negócios Júnior',
  'Analista de CRM Júnior',
  'Analista de Implantação Júnior',
  // Termos complementares da carreira
  'analista de operacoes',
  'analista de processos',
  'inteligencia de mercado',
  'inteligencia comercial',
  'analista de negocios',
  'analista de crm',
  'analista de implantacao',
  'onboarding',
  'customer success',
  'sucesso do cliente',
  'revops',
  'sales ops',
  'operacoes comerciais',
  'bizops',
  'analista de dados junior',
  'analista de dados',
  'analista de bi',
  'power bi',
  'indicadores kpi',
  'hubspot',
  'salesforce',
  'n8n',
  'automacao de processos',
  'melhoria continua',
  'analista de requisitos',
  'analista de produto',
  'product owner'
];

const BRAZIL_GREENHOUSE_BOARDS = [
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
  { slug: 'dock', name: 'Dock' },
  { slug: 'stone', name: 'Stone' },
  { slug: 'loggi', name: 'Loggi' },
  { slug: 'Cora', name: 'Cora' },
  { slug: 'omint', name: 'Omint' }
];

const BRAZIL_LEVER_BOARDS = [
  { slug: 'neon', name: 'Banco Neon' },
  { slug: 'dasa', name: 'Dasa' },
  { slug: 'olist', name: 'Olist' },
  { slug: 'buser', name: 'Buser' },
  { slug: 'kovi', name: 'Kovi' },
  { slug: 'husky', name: 'Husky' }
];

// Empresas Globais Remote-First (Greenhouse) para vagas Internacionais 100% Remotas
const GLOBAL_REMOTE_GREENHOUSE_BOARDS = [
  { slug: 'gitlab', name: 'GitLab (Global)' },
  { slug: 'remotecom', name: 'Remote.com' },
  { slug: 'hubspot', name: 'HubSpot (Global)' },
  { slug: 'pipedrive', name: 'Pipedrive' },
  { slug: 'airtable', name: 'Airtable' },
  { slug: 'clickup', name: 'ClickUp' },
  { slug: 'notion', name: 'Notion' },
  { slug: 'miro', name: 'Miro' },
  { slug: 'asana', name: 'Asana' },
  { slug: 'intercom', name: 'Intercom' },
  { slug: 'zendesk', name: 'Zendesk' },
  { slug: 'typeform', name: 'Typeform' },
  { slug: 'calendly', name: 'Calendly' },
  { slug: 'stripe', name: 'Stripe' },
  { slug: 'twilio', name: 'Twilio' },
  { slug: 'braze', name: 'Braze' },
  { slug: 'amplitude', name: 'Amplitude' },
  { slug: 'webflow', name: 'Webflow' },
  { slug: 'apolloio', name: 'Apollo.io' },
  { slug: 'klaviyo', name: 'Klaviyo' },
  { slug: 'gusto', name: 'Gusto' },
  { slug: 'celonis', name: 'Celonis' },
  { slug: 'contentful', name: 'Contentful' },
  { slug: 'doist', name: 'Doist' },
  { slug: 'automattic', name: 'Automattic' },
  { slug: 'zapier', name: 'Zapier' }
];

/**
 * BLACKLIST ESTRITA DE TÍTULOS (Remove ruído de TI / Suporte / Desenvolvimento / Infra)
 */
export function isBlacklistedTitle(title = '') {
  if (!title) return true;
  const t = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const blacklistPatterns = [
    /\bsuporte\s+tecnico\b/i,
    /\btecnico\s+(de\s+)?suporte\b/i,
    /\banalista\s+de\s+suporte\b/i,
    /\bhelp\s*desk\b/i,
    /\bservice\s*desk\b/i,
    /\bsuporte\s+n[123]\b/i,
    /\binfraestrutura\b/i,
    /\bdesenvolvedor(a)?\b/i,
    /\bdeveloper\b/i,
    /\bfront[\s-]*end\b/i,
    /\bback[\s-]*end\b/i,
    /\bfull[\s-]*stack\b/i,
    /\bdevops\b/i,
    /\bsoftware\s+engineer\b/i,
    /\bengenheiro(a)?\s+de\s+software\b/i,
    /\bsre\b/i,
    /\bqa\s+engineer\b/i,
    /\banalista\s+de\s+testes\b/i,
    /\btest\s+engineer\b/i,
    /\bmobile\s+engineer\b/i,
    /\bios\s+engineer\b/i,
    /\bandroid\s+engineer\b/i,
    /\bsysadmin\b/i,
    /\bcloud\s+engineer\b/i,
    /\bnetwork\s+engineer\b/i,
    /\bsecurity\s+engineer\b/i,
    /\bprogramador(a)?\b/i
  ];

  return blacklistPatterns.some(regex => regex.test(t) || regex.test(title));
}

/**
 * Para fontes internacionais genéricas, garante que a vaga tem aderência às áreas de
 * Operações (BizOps), Processos, Inteligência de Mercado/Comercial, Dados/BI, CRM/RevOps, Automação ou Onboarding
 */
function isRelevantCareerJob(title = '', desc = '') {
  if (isBlacklistedTitle(title)) return false;
  const t = title.toLowerCase();
  const combined = `${title} ${desc}`.toLowerCase();

  const relevantTitleRegex = /\b(operations|opera[çc][õo]es|bizops|process|processos|business\s+analyst|analista\s+de\s+neg[óo]cios|market\s+intelligence|intelig[êe]ncia\s+de\s+mercado|sales\s+intelligence|intelig[êe]ncia\s+comercial|revops|revenue\s+operations|sales\s+ops|sales\s+operations|crm|hubspot|salesforce|onboarding|implementation|implanta[çc][ãa]o|customer\s+success|sucesso\s+do\s+cliente|data\s+analyst|analista\s+de\s+dados|business\s+intelligence|\bbi\b|analytics|power\s+bi|automation|automa[çc][ãa]o|n8n|ai\s+ops|product\s+operations|product\s+owner|product\s+analyst|analista\s+de\s+produto|project\s+coordinator|project\s+analyst|strategy\s+&\s+operations|go-to-market|gtm|enablement|commercial\s+analyst|planejamento\s+comercial)\b/i;

  return relevantTitleRegex.test(t) || (relevantTitleRegex.test(combined) && /\b(analyst|analista|specialist|associate|coordinator|ops|operations|onboarding|crm|data|bi|automation|intelligence)\b/i.test(t));
}

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

  if (
    /\b(staff|principal|director|diretor|diretora|head|lead|líder|lider|especialista|specialist|manager|gerente|coordenador|coordenadora|coordinator|vp|chief)\b/i.test(t)
  ) {
    return 'especialista';
  }
  if (/\b(estágio|estagio|estagiário|estagiario|intern|internship|trainee)\b/i.test(t)) {
    return 'estagio';
  }
  if (/\b(sênior|senior|sr\.?|iii)\b/i.test(t)) {
    return 'senior';
  }
  if (/\b(júnior|junior|jr\.?|assistente|auxiliar|entry|associate| i |nível 1|n1)\b/i.test(t)) {
    return 'junior';
  }
  if (/\b(pleno|pl\.?|mid|ii|nível 2|n2)\b/i.test(t)) {
    return 'pleno';
  }

  if (full.includes('júnior') || full.includes('junior') || full.includes('entry level')) return 'junior';
  if (full.includes('sênior') || full.includes('senior')) return 'senior';
  return 'pleno';
}

/**
 * Classifica estritamente nas 5 categorias solicitadas:
 * 1. bizops_processos: Operações & Processos (BizOps)
 * 2. inteligencia_mercado: Inteligência de Mercado & Comercial
 * 3. crm_revops_onboarding: CRM, RevOps & Onboarding
 * 4. dados_bi: Dados & BI (SQL / Power BI)
 * 5. automacao_ia: Automação & IA (N8N)
 */
function detectCategories(title, desc = '') {
  const combined = `${title} ${desc}`.toLowerCase();
  const cats = [];

  if (/\b(opera[çc][õo]es|operations|bizops|business\s+operations|processos|process|bpm|bpmn|melhoria\s+cont[íi]nua|analista\s+de\s+neg[óo]cios|business\s+analyst|requisitos|product\s+operations|produto|product\s+owner|planejamento)\b/i.test(combined)) {
    cats.push('bizops_processos');
  }
  if (/\b(intelig[êe]ncia\s+de\s+mercado|market\s+intelligence|intelig[êe]ncia\s+comercial|sales\s+intelligence|competitive\s+intelligence|go-to-market|gtm|pesquisa\s+de\s+mercado|pricing|planejamento\s+comercial|estrategia\s+comercial)\b/i.test(combined)) {
    cats.push('inteligencia_mercado');
  }
  if (/\b(crm|revops|revenue\s+operations|sales\s+ops|sales\s+operations|opera[çc][õo]es\s+comerciais|hubspot|salesforce|pipedrive|rd\s+station|implanta[çc][ãa]o|onboarding|implementation|customer\s+success|sucesso\s+do\s+cliente|cs\s+ops|ativac[ãa]o)\b/i.test(combined)) {
    cats.push('crm_revops_onboarding');
  }
  if (/\b(dados|data|bi\b|business\s+intelligence|power\s+bi|looker|metabase|tableau|analytics|sql|etl|indicadores|kpis?|dashboard)\b/i.test(combined)) {
    cats.push('dados_bi');
  }
  if (/\b(n8n|zapier|make\.com|integromat|automa[çc][ãa]o|automation|rpa|ai\s+ops|aiops|agentes\s+de\s+ia|ai\s+agents|llm|openai|prompt|webhooks)\b/i.test(combined)) {
    cats.push('automacao_ia');
  }

  if (cats.length === 0) {
    cats.push('bizops_processos');
  }
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

// Dicionário de Habilidades de Negócios, Operações, Dados, CRM e Automação (Sem stacks de dev puro)
const SKILL_DICTIONARY = [
  { label: 'Inteligência de Mercado', regex: /\b(intelig[êe]ncia\s+de\s+mercado|market\s+intelligence|pesquisa\s+de\s+mercado)\b/i },
  { label: 'Inteligência Comercial', regex: /\b(intelig[êe]ncia\s+comercial|sales\s+intelligence|planejamento\s+comercial)\b/i },
  { label: 'Operações / BizOps', regex: /\b(opera[çc][õo]es|business\s+operations|bizops|strategy\s+&\s+operations)\b/i },
  { label: 'Processos / BPMN', regex: /\b(bpmn|bizagi|mapeamento\s+de\s+processos|melhoria\s+cont[íi]nua|process\s+improvement|lean)\b/i },
  { label: 'Onboarding / CS', regex: /\b(implanta[çc][ãa]o|onboarding|implementation|customer\s+success|sucesso\s+do\s+cliente)\b/i },
  { label: 'Análise de Dados', regex: /\b(an[áa]lise\s+de\s+dados|data\s+analysis|data\s+analytics|analytics)\b/i },
  { label: 'Indicadores / KPIs', regex: /\b(indicadores|kpis?|okrs?|dashboards?|m[ée]tricas)\b/i },
  { label: 'Power BI', regex: /\b(power\s*bi|tableau|looker|metabase)\b/i },
  { label: 'SQL', regex: /\b(sql|bigquery|snowflake|postgres)\b/i },
  { label: 'CRM', regex: /\bcrm\b/i },
  { label: 'HubSpot', regex: /\bhubspot\b/i },
  { label: 'Salesforce', regex: /\bsalesforce\b/i },
  { label: 'RevOps', regex: /\b(revops|revenue\s+operations)\b/i },
  { label: 'Sales Ops', regex: /\b(sales\s+ops|sales\s+operations|opera[çc][õo]es\s+comerciais)\b/i },
  { label: 'N8N', regex: /\bn8n\b/i },
  { label: 'Make / Zapier', regex: /\b(make\.com|integromat|zapier)\b/i },
  { label: 'Automação / IA', regex: /\b(automa[çc][ãa]o|automation|rpa|openai|llm|intelig[êe]ncia\s+artificial|ai\s+agents|agentes\s+de\s+ia)\b/i },
  { label: 'Excel / Sheets', regex: /\b(excel|google\s+sheets|planilhas)\b/i },
  { label: 'APIs / Webhooks', regex: /\b(api|webhooks|integra[çc][õo]es)\b/i },
  { label: 'Python', regex: /\bpython\b/i }
];

function extractSkills(text) {
  const found = [];
  for (const item of SKILL_DICTIONARY) {
    if (item.regex.test(text)) {
      found.push(item.label);
    }
  }
  return found.length > 0 ? found : ['Operações / BizOps', 'Indicadores / KPIs'];
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
 * 1. Coleta Gupy Global Search (Brasil)
 */
async function scrapeGupyGlobal() {
  console.log('🔎 [1/4] Varrendo Gupy Global Search (Operações, Processos, Inteligência, CRM, Dados, Automação e Implantação)...');
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
        const title = (raw.name || '').trim();
        if (!title || isBlacklistedTitle(title)) continue;

        const daysOpen = calculateDaysOpen(raw.publishedDate);
        if (daysOpen > 45) continue;

        const workplace =
          raw.workplaceType === 'remote' ? 'remoto' :
          raw.workplaceType === 'hybrid' ? 'hibrido' : 'presencial';

        const city = raw.city || '';
        const state = raw.state || '';
        const location = workplace === 'remoto'
          ? (city ? `Remoto (${city} - ${state})` : 'Remoto - Brasil')
          : `${city ? city + ', ' : ''}${state || 'Brasil'}`;

        const cleanDesc = stripHtml(raw.description || '');
        const stacks = extractSkills(`${title} ${cleanDesc}`);
        const categories = detectCategories(title, cleanDesc);
        const affirmative = detectAffirmative(title, cleanDesc);

        jobs.push({
          id: `gupy_${raw.id}`,
          title,
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
          seniority: detectSeniority(title, cleanDesc),
          stacks,
          description: cleanDesc.slice(0, 500) || `Vaga para ${title} na empresa ${raw.careerPageName}.`,
          requirements: stacks.map(s => `Domínio ou vivência em ${s}`),
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

  console.log(`   ✅ Gupy Global: ${jobs.length} vagas de Negócios/Operações/Dados coletadas.`);
  return jobs;
}

/**
 * 2. Coleta EmpregosTec + InHire + Sólides (Filtradas sem Dev/Suporte)
 */
async function scrapeEmpregosTec() {
  console.log('🔎 [2/4] Varrendo EmpregosTec & InHire / Sólides (Apenas BizOps, Dados, CRM, Produto e Implantação)...');
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

      const title = stripHtml(rawTitle)
        .replace(/^Vaga Home Office:\s*/i, '')
        .replace(/\s+na empresa\s+.+$/i, '')
        .trim();

      const cleanDesc = stripHtml(descCdata || contentEncoded);
      if (isBlacklistedTitle(title) || !isRelevantCareerJob(title, cleanDesc)) continue;

      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
      const publishedAt = isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString();
      const daysOpen = calculateDaysOpen(publishedAt);
      if (daysOpen > 45) continue;

      const applyMatch = contentEncoded.match(/<a href=["']([^"']+)["'][^>]*>Candidatar-se agora/i);
      const canonicalUrl = applyMatch ? applyMatch[1].trim() : link;
      if (!canonicalUrl) continue;

      const companyMatch = contentEncoded.match(/<strong>Empresa:<\/strong>\s*([^<]+)/i) ||
                           rawTitle.match(/na empresa\s+(.+)$/i);
      const company = companyMatch ? stripHtml(companyMatch[1]).trim() : 'Empresa Verificada';

      let platform = 'empregostec';
      const urlLower = canonicalUrl.toLowerCase();
      if (urlLower.includes('inhire.app')) platform = 'inhire';
      else if (urlLower.includes('gupy.io')) platform = 'gupy';
      else if (urlLower.includes('solides')) platform = 'solides';
      else if (urlLower.includes('greenhouse.io')) platform = 'greenhouse';
      else if (urlLower.includes('lever.co')) platform = 'lever';

      const stacks = extractSkills(`${title} ${cleanDesc}`);
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
        stacks,
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

  console.log(`   ✅ EmpregosTec / InHire: ${jobs.length} vagas filtradas.`);
  return jobs;
}

/**
 * 3. Coleta Greenhouse & Lever Brasil (Filtradas sem Dev/Suporte)
 */
async function scrapeBrazilGreenhouseAndLever() {
  console.log('🔎 [3/4] Varrendo Boards Greenhouse & Lever no Brasil...');
  const jobs = [];

  for (const company of BRAZIL_GREENHOUSE_BOARDS) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`);
      if (!res.ok) continue;
      const data = await res.json();

      for (const raw of (data.jobs || [])) {
        if (isBlacklistedTitle(raw.title)) continue;
        const cleanDesc = stripHtml(raw.content || '');
        if (!isRelevantCareerJob(raw.title, cleanDesc)) continue;

        const loc = raw.location?.name || '';
        const locLower = loc.toLowerCase();

        const isForeign = ['argentina', 'mexico', 'colombia', 'chile', 'peru', 'portugal', 'spain', 'usa', 'united states', 'germany', 'uk'].some(
          f => locLower.includes(f) && !locLower.includes('brazil') && !locLower.includes('brasil')
        );
        if (isForeign) continue;

        const daysOpen = calculateDaysOpen(raw.updated_at);
        if (daysOpen > 45) continue;

        const combined = `${raw.title} ${loc}`.toLowerCase();
        const workplace =
          combined.includes('remote') || combined.includes('remoto') ? 'remoto' :
          combined.includes('hybrid') || combined.includes('híbrido') || combined.includes('hibrido') ? 'hibrido' : 'presencial';

        const stacks = extractSkills(`${raw.title} ${cleanDesc}`);
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
          stacks,
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

  for (const company of BRAZIL_LEVER_BOARDS) {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${company.slug}?mode=json`);
      if (!res.ok) continue;
      const list = await res.json();

      for (const raw of list) {
        if (isBlacklistedTitle(raw.text)) continue;
        const cleanDesc = stripHtml(raw.descriptionPlain || '');
        if (!isRelevantCareerJob(raw.text, cleanDesc)) continue;

        const loc = raw.categories?.location || '';
        const pubIso = new Date(raw.createdAt).toISOString();
        const daysOpen = calculateDaysOpen(pubIso);
        if (daysOpen > 45) continue;

        const combined = `${raw.text} ${loc} ${raw.categories?.workplaceType || ''}`.toLowerCase();
        const workplace =
          combined.includes('remote') || combined.includes('remoto') ? 'remoto' :
          combined.includes('hybrid') || combined.includes('híbrido') ? 'hibrido' : 'presencial';

        const stacks = extractSkills(`${raw.text} ${cleanDesc}`);
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
          stacks,
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

  console.log(`   ✅ Greenhouse & Lever Brasil: ${jobs.length} vagas coletadas.`);
  return jobs;
}

/**
 * 4. Coleta Massiva de Vagas Internacionais 100% Remotas (7 Fontes Globais)
 */
async function scrapeInternationalRemote() {
  console.log('🔎 [4/4] Varrendo 7 Fontes Globais de Vagas Internacionais 100% Remotas...');
  const jobs = [];

  // 4A. The Muse Public API (Remote / Flexible across Business Operations, Data & Analytics, Project Management, Account Management, Customer Service)
  const museCategories = [
    'Business Operations',
    'Data and Analytics',
    'Project Management',
    'Account Management',
    'Customer Service',
    'Marketing',
    'Product Management'
  ];

  for (const cat of museCategories) {
    for (let page = 1; page <= 3; page++) {
      try {
        const url = `https://www.themuse.com/api/public/jobs?location=Flexible%20%2F%20Remote&category=${encodeURIComponent(cat)}&page=${page}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) continue;
        const data = await res.json();

        for (const raw of (data.results || [])) {
          const title = raw.name || '';
          if (!title || isBlacklistedTitle(title)) continue;

          const cleanDesc = stripHtml(raw.contents || '');
          if (!isRelevantCareerJob(title, cleanDesc)) continue;

          const pubIso = raw.publication_date ? new Date(raw.publication_date).toISOString() : new Date().toISOString();
          const daysOpen = calculateDaysOpen(pubIso);
          if (daysOpen > 45) continue;

          const stacks = extractSkills(`${title} ${cleanDesc}`);
          const categories = detectCategories(title, cleanDesc);
          const companyName = raw.company?.name || 'Global Remote Company';

          jobs.push({
            id: `muse_${raw.id}`,
            title,
            company: companyName,
            platform: 'remotive_intl',
            canonicalUrl: raw.refs?.landing_page || `https://www.themuse.com/jobs/${raw.id}`,
            publishedAt: pubIso,
            daysOpen,
            workplaceType: 'remoto',
            location: '🌎 Remoto Internacional (Flexible / Global)',
            seniority: detectSeniority(title, cleanDesc),
            stacks,
            description: cleanDesc.slice(0, 480),
            requirements: stacks.map(s => `Experience with ${s}`),
            isActive: true,
            isAffirmative: false,
            nicheCategories: categories,
            distanceFromMuzambinhoKm: 0,
            isInternational: true,
          });
        }
      } catch {}
    }
  }

  // 4B. Remotive API (Múltiplas categorias de Negócios, Dados, Marketing, Vendas, Produto e Operações)
  const remotiveCategories = ['business', 'data', 'marketing', 'sales', 'product', 'project-management', 'customer-support', 'all-others'];
  for (const cat of remotiveCategories) {
    try {
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=100`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const raw of (data.jobs || [])) {
        if (isBlacklistedTitle(raw.title)) continue;
        const cleanDesc = stripHtml(raw.description || '');
        if (!isRelevantCareerJob(raw.title, `${raw.category || ''} ${cleanDesc}`)) continue;

        const daysOpen = calculateDaysOpen(raw.publication_date);
        if (daysOpen > 45) continue;

        const stacks = extractSkills(`${raw.title} ${raw.category || ''} ${(raw.tags || []).join(' ')} ${cleanDesc}`);
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
          stacks,
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
    } catch {}
  }

  // 4C. Jobicy API (Múltiplas indústrias e tags de Operações, Dados, Negócios e Marketing)
  const jobicyUrls = [
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=business',
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=data-science',
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=management',
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=marketing',
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=admin',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=operations',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=analytics',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=crm',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=onboarding'
  ];

  for (const jUrl of jobicyUrls) {
    try {
      const res = await fetch(jUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const data = await res.json();
      for (const raw of (data.jobs || [])) {
        const title = stripHtml(raw.jobTitle || raw.title || '');
        if (!title || isBlacklistedTitle(title)) continue;

        const cleanDesc = stripHtml(raw.jobDescription || raw.jobExcerpt || '');
        const daysOpen = calculateDaysOpen(raw.pubDate);
        if (daysOpen > 45) continue;

        const stacks = extractSkills(`${title} ${cleanDesc}`);
        const categories = detectCategories(title, cleanDesc);

        jobs.push({
          id: `jobicy_${raw.id}`,
          title,
          company: raw.companyName || 'Global Remote',
          companyLogo: raw.companyLogo,
          platform: 'remotive_intl',
          canonicalUrl: raw.url,
          publishedAt: new Date(raw.pubDate).toISOString(),
          daysOpen,
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${raw.jobGeo || 'Global'})`,
          seniority: detectSeniority(title, cleanDesc),
          stacks,
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
    } catch {}
  }

  // 4D. Himalayas Global Remote API
  for (const offset of [0, 100]) {
    try {
      const res = await fetch(`https://himalayas.app/jobs/api?limit=100&offset=${offset}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (res.ok) {
        const data = await res.json();
        for (const raw of (data.jobs || [])) {
          const title = raw.title || '';
          if (!title || isBlacklistedTitle(title)) continue;
          const cleanDesc = stripHtml(raw.description || raw.excerpt || '');
          if (!isRelevantCareerJob(title, cleanDesc)) continue;

          const pubIso = raw.pubDate ? new Date(raw.pubDate * 1000).toISOString() : new Date().toISOString();
          const daysOpen = calculateDaysOpen(pubIso);
          if (daysOpen > 45) continue;

          const stacks = extractSkills(`${title} ${(raw.categories || []).join(' ')} ${cleanDesc}`);
          const categories = detectCategories(title, cleanDesc);

          jobs.push({
            id: `himalayas_${raw.guid || raw.id || Math.random()}`,
            title,
            company: raw.companyName || 'Global Remote',
            companyLogo: raw.companyLogo,
            platform: 'remotive_intl',
            canonicalUrl: raw.applicationLink || raw.guid,
            publishedAt: pubIso,
            daysOpen,
            workplaceType: 'remoto',
            location: `🌎 Remoto Internacional (${(raw.locationRestrictions || []).join(', ') || 'Worldwide'})`,
            seniority: detectSeniority(title, cleanDesc),
            stacks,
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
  }

  // 4E. Working Nomads API
  try {
    const res = await fetch('https://www.workingnomads.com/api/exposed_jobs/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const list = await res.json();
      for (const raw of (list || [])) {
        const title = raw.title || '';
        if (!title || isBlacklistedTitle(title)) continue;
        const cleanDesc = stripHtml(raw.description || '');
        if (!isRelevantCareerJob(title, `${raw.category_name || ''} ${cleanDesc}`)) continue;

        const pubIso = raw.pub_date ? new Date(raw.pub_date).toISOString() : new Date().toISOString();
        const daysOpen = calculateDaysOpen(pubIso);
        if (daysOpen > 45) continue;

        const stacks = extractSkills(`${title} ${raw.tags || ''} ${cleanDesc}`);
        const categories = detectCategories(title, cleanDesc);

        jobs.push({
          id: `wn_${Buffer.from(raw.url || title).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-22)}`,
          title,
          company: raw.company_name || 'Global Remote',
          platform: 'remotive_intl',
          canonicalUrl: raw.url,
          publishedAt: pubIso,
          daysOpen,
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${raw.location || 'Anywhere'})`,
          seniority: detectSeniority(title, cleanDesc),
          stacks,
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

  // 4F. WeWorkRemotely RSS Feeds (Management/Finance, Product, Sales/Marketing, All Other)
  const wwrFeeds = [
    'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss',
    'https://weworkremotely.com/categories/remote-product-jobs.rss',
    'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss',
    'https://weworkremotely.com/categories/all-other-remote-jobs.rss'
  ];

  for (const feedUrl of wwrFeeds) {
    try {
      const res = await fetch(feedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

      for (const itemXml of items) {
        const rawTitle = stripHtml(itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
        const pubDateStr = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
        const region = stripHtml(itemXml.match(/<region>([\s\S]*?)<\/region>/)?.[1] || 'Anywhere in the World');
        const desc = stripHtml(itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '');

        if (!rawTitle || !link) continue;
        const parts = rawTitle.split(':');
        const company = parts.length > 1 ? parts[0].trim() : 'Global Remote';
        const title = parts.length > 1 ? parts.slice(1).join(':').trim() : rawTitle;

        if (isBlacklistedTitle(title) || !isRelevantCareerJob(title, desc)) continue;

        const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
        const pubIso = isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString();
        const daysOpen = calculateDaysOpen(pubIso);
        if (daysOpen > 45) continue;

        const stacks = extractSkills(`${title} ${desc}`);
        const categories = detectCategories(title, desc);

        jobs.push({
          id: `wwr_${Buffer.from(link).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-22)}`,
          title,
          company,
          platform: 'remotive_intl',
          canonicalUrl: link,
          publishedAt: pubIso,
          daysOpen,
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${region})`,
          seniority: detectSeniority(title, desc),
          stacks,
          description: desc.slice(0, 480),
          requirements: stacks.map(s => `Experience with ${s}`),
          isActive: true,
          isAffirmative: false,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: 0,
          isInternational: true,
        });
      }
    } catch {}
  }

  // 4G. Global Remote-First Companies via Greenhouse API (HubSpot, Zapier, Remote.com, GitLab, ClickUp, Airtable, Notion, Miro, etc.)
  for (const board of GLOBAL_REMOTE_GREENHOUSE_BOARDS) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`);
      if (!res.ok) continue;
      const data = await res.json();

      for (const raw of (data.jobs || [])) {
        if (isBlacklistedTitle(raw.title)) continue;
        const loc = raw.location?.name || '';
        const locLower = loc.toLowerCase();

        // Garante que é uma vaga Remota Global / LATAM / Americas / Worldwide
        const isRemoteGlobal =
          locLower.includes('remote') ||
          locLower.includes('latam') ||
          locLower.includes('latin america') ||
          locLower.includes('brazil') ||
          locLower.includes('americas') ||
          locLower.includes('anywhere') ||
          locLower.includes('global') ||
          board.slug === 'gitlab' ||
          board.slug === 'zapier' ||
          board.slug === 'remotecom' ||
          board.slug === 'doist' ||
          board.slug === 'automattic';

        if (!isRemoteGlobal) continue;

        const cleanDesc = stripHtml(raw.content || '');
        if (!isRelevantCareerJob(raw.title, cleanDesc)) continue;

        const daysOpen = calculateDaysOpen(raw.updated_at);
        if (daysOpen > 45) continue;

        const stacks = extractSkills(`${raw.title} ${cleanDesc}`);
        const categories = detectCategories(raw.title, cleanDesc);

        jobs.push({
          id: `gh_intl_${board.slug}_${raw.id}`,
          title: raw.title,
          company: board.name,
          platform: 'remotive_intl',
          canonicalUrl: raw.absolute_url,
          publishedAt: raw.updated_at,
          daysOpen,
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${loc || 'Global Remote'})`,
          seniority: detectSeniority(raw.title, cleanDesc),
          stacks,
          description: cleanDesc.slice(0, 480),
          requirements: stacks.map(s => `Experience with ${s}`),
          isActive: true,
          isAffirmative: false,
          nicheCategories: categories,
          distanceFromMuzambinhoKm: 0,
          isInternational: true,
        });
      }
    } catch {}
  }

  console.log(`   ✅ Internacionais 100% Remotas: ${jobs.length} vagas coletadas nas áreas de Negócios, Dados, Operações, CRM e Automação.`);
  return jobs;
}

async function main() {
  console.log('================================================================');
  console.log('📡 RADAR DE VAGAS - BIZOPS, PROCESSOS, INTELIGÊNCIA, DADOS, CRM & AUTOMAÇÃO');
  console.log('🚫 Blacklist ativa contra Suporte Técnico, Help Desk, Infra, Dev e DevOps');
  console.log('================================================================\n');

  const [gupyJobs, etJobs, brAtsJobs, intlJobs] = await Promise.all([
    scrapeGupyGlobal(),
    scrapeEmpregosTec(),
    scrapeBrazilGreenhouseAndLever(),
    scrapeInternationalRemote(),
  ]);

  const allCandidates = [
    ...gupyJobs,
    ...etJobs,
    ...brAtsJobs,
    ...intlJobs,
  ];

  const uniqueMap = new Map();
  for (const job of allCandidates) {
    if (!job.canonicalUrl || !job.title) continue;
    if (isBlacklistedTitle(job.title)) continue;

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
  console.log(`Total de vagas únicas (0% ruído de TI/Dev/Suporte): ${deduplicated.length}`);
  console.log(`Por Plataforma:`, byPlatform);
  console.log(`Por Modalidade:`, byWorkplace);
  console.log(`Por Senioridade:`, bySeniority);
  console.log(`Vagas Nacionais (Brasil): ${deduplicated.filter(j => !j.isInternational).length}`);
  console.log(`Vagas Internacionais (100% Remotas): ${deduplicated.filter(j => j.isInternational).length}`);
  console.log(`Salvo em: src/data/liveJobs.json`);
  console.log('================================================================\n');
}

main();
