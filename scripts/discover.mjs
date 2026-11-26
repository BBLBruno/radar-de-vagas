/**
 * Motor Multi-ATS de Descoberta, Hidratação e Validação de Vagas
 * Foco estrito: Operações de Negócios (BizOps), Processos, Inteligência Comercial/Mercado,
 * CRM (Técnico & Marketing), Implantação/Onboarding/CS, Dados/BI e Automação/IA (N8N/APIs).
 *
 * Garantias de Qualidade (Auditoria v2):
 * 1. Hidratação real via __NEXT_DATA__ da Gupy: valida `status === 'published'`, descarta vagas
 *    encerradas/expiradas/internas/Jovem Aprendiz e extrai descrição completa (`responsibilities` + `prerequisites`).
 * 2. Integração pública direta com InHire API (`api.inhire.app` - 20 scale-ups BR) com hidratação de detalhes.
 * 3. Integração pública direta com Ashby API (`api.ashbyhq.com` - Nubank, n8n, Zapier, Notion, Supabase, etc.).
 * 4. Validação estrita de elegibilidade geográfica para residentes no Brasil (`br_nacional`, `latam_br`, `global_remoto`),
 *    eliminando falsos remotos globais restritos aos EUA, Europa, Reino Unido, Canadá, Austrália ou Argentina/México exclusivos.
 * 5. Blacklist rigorosa (~100 padrões) + exigência de título aderente (`isRelevantCareerTitle`) em 100% das fontes.
 * 6. Detecção de alertas: Espanhol obrigatório, falso remoto (presencial/viagem no texto), modalidade contratual (CLT/PJ/Temp) e trilha de CRM.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

function makeUniqueId(prefix, url, title, company) {
  const hash = crypto
    .createHash('md5')
    .update(`${url}_${title}_${company}`)
    .digest('hex')
    .slice(0, 12);
  return `${prefix}_${hash}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function mapConcurrent(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) break;
      try {
        results[index] = await worker(items[index], index);
      } catch {
        results[index] = null;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, Math.max(1, items.length)) }, () => runner());
  await Promise.all(workers);
  return results.filter(Boolean);
}

function normalizeGeoText(text = '') {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decodifica entidades HTML ANTES de remover as tags para nunca vazar `<div class="content-intro">`
 */
export function stripHtml(raw = '') {
  if (!raw) return '';
  return String(raw)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&#8217;/gi, "'")
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 31 ? String.fromCharCode(code) : ' ';
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) && code > 31 ? String.fromCharCode(code) : ' ';
    })
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

function cleanJobTitle(rawTitle = '') {
  return stripHtml(rawTitle)
    .replace(/^\s*(?:\[?\d{4,}\]?\s*[-–|:]\s*)/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractGupyJobId(url = '') {
  const match = String(url).match(/gupy\.io\/jobs?\/([A-Za-z0-9+/=_-]+)/i);
  if (!match) return null;
  const token = match[1];
  if (/^\d+$/.test(token)) return token;
  try {
    const normalizedB64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(normalizedB64, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed && (typeof parsed.jobId === 'number' || typeof parsed.jobId === 'string')) {
      return String(parsed.jobId);
    }
  } catch {
    // mantem fallback
  }
  return token;
}

// ============================================================================
// LISTAS DE FONTES E CONSULTAS (FASES 1 & 2)
// ============================================================================

const GUPY_SEARCH_TERMS = [
  // Trilhas de maior fit imediato (Júnior / Pleno)
  'Analista de Operações Júnior',
  'Analista de Processos Júnior',
  'Inteligência de Mercado Júnior',
  'Inteligência Comercial Júnior',
  'Analista de Negócios Júnior',
  'Analista de CRM Júnior',
  'Analista de Implantação Júnior',
  'Analista de Onboarding',
  'Implantação de Sistemas',
  'Consultor de Implantação',
  'Sucesso do Cliente Júnior',
  'Customer Success Operações',
  'CS Ops',
  'Sales Ops',
  'RevOps',
  'Operações Comerciais',
  'BizOps',
  'Analista de Operações',
  'Analista de Processos',
  'Melhoria Contínua',
  'Inteligência Comercial',
  'Inteligência de Mercado',
  'Planejamento Comercial',
  'Analista de CRM',
  'CRM HubSpot',
  'CRM Salesforce',
  'RD Station',
  'Pipedrive',
  'Chatwoot',
  'Zendesk',
  'N8N',
  'Automação de Processos',
  'Automação IA',
  'Analista de Integrações',
  'Analista de E-commerce',
  'Operações de E-commerce',
  'Shopify',
  'Analista de Dados Júnior',
  'Analista de Dados',
  'Analista de BI',
  'Power BI',
  'Indicadores KPI',
  'Analista de Negócios',
  'Analista de Requisitos',
  'Product Operations',
  'Product Owner Júnior',
  // Cobertura Regional Direta (Sul de MG e Interior de SP)
  'Poços de Caldas',
  'Pouso Alegre',
  'Varginha',
  'Alfenas',
  'Guaxupé',
  'Passos MG',
  'São Sebastião do Paraíso',
  'Itajubá',
  'Santa Rita do Sapucaí',
  'São João da Boa Vista',
  'Mogi Guaçu',
  'Mogi Mirim',
  'Itapira',
  'Mococa',
  'São José do Rio Pardo',
  'Franca SP',
  'Ribeirão Preto Operações',
  'Ribeirão Preto Processos',
  'Ribeirão Preto Dados',
  'Ribeirão Preto CRM',
  'Campinas Operações',
  'Campinas Processos',
  'Campinas Implantação',
  'Campinas CRM',
  'Campinas Dados',
  'Limeira Analista',
  'Piracicaba Analista',
  'São Carlos Analista',
  'Araraquara Analista',
];

const INHIRE_TENANTS = [
  { slug: 'cora', name: 'Cora' },
  { slug: 'contabilizei', name: 'Contabilizei' },
  { slug: 'olist', name: 'Olist' },
  { slug: 'contaazul', name: 'Conta Azul' },
  { slug: 'sympla', name: 'Sympla' },
  { slug: 'loggi', name: 'Loggi' },
  { slug: 'dock', name: 'Dock' },
  { slug: 'frete', name: 'Frete.com' },
  { slug: 'cobli', name: 'Cobli' },
  { slug: 'qive', name: 'Qive (Arquivei)' },
  { slug: 'alice', name: 'Alice Saúde' },
  { slug: 'pier', name: 'Pier Seguradora' },
  { slug: 'involves', name: 'Involves' },
  { slug: 'neoway', name: 'Neoway' },
  { slug: 'enjoei', name: 'Enjoei' },
  { slug: 'meliuz', name: 'Méliuz' },
  { slug: 'unico', name: 'Unico IDTech' },
  { slug: 'caf', name: 'Caf' },
  { slug: 'mevo', name: 'Mevo' },
  { slug: 'kpmg', name: 'KPMG Brasil' },
];

const ASHBY_BOARDS = [
  { slug: 'nubank', name: 'Nubank' },
  { slug: 'belvo', name: 'Belvo' },
  { slug: 'n8n', name: 'n8n' },
  { slug: 'zapier', name: 'Zapier' },
  { slug: 'notion', name: 'Notion' },
  { slug: 'supabase', name: 'Supabase' },
  { slug: 'twenty', name: 'Twenty CRM' },
  { slug: 'attio', name: 'Attio CRM' },
  { slug: 'linear', name: 'Linear' },
  { slug: 'pylon', name: 'Pylon' },
  { slug: 'airbyte', name: 'Airbyte' },
  { slug: 'resend', name: 'Resend' },
  { slug: 'posthog', name: 'PostHog' },
  { slug: 'plain', name: 'Plain' },
  { slug: 'ramp', name: 'Ramp' },
];

const BRAZIL_GREENHOUSE_BOARDS = [
  { slug: 'quintoandar', name: 'QuintoAndar' },
  { slug: 'vtex', name: 'VTEX' },
  { slug: 'gympass', name: 'Wellhub (Gympass)' },
  { slug: 'stone', name: 'Stone' },
  { slug: 'ebanx', name: 'EBANX' },
  { slug: 'wildlifestudios', name: 'Wildlife Studios' },
  { slug: 'brex', name: 'Brex' },
  { slug: 'rdstation', name: 'RD Station' },
  { slug: 'pipefy', name: 'Pipefy' },
  { slug: 'nuvemshop', name: 'Nuvemshop' },
  { slug: 'hotmart', name: 'Hotmart' },
  { slug: 'creditas', name: 'Creditas' },
  { slug: 'takeblip', name: 'Take Blip' },
];

const BRAZIL_LEVER_BOARDS = [
  { slug: 'neon', name: 'Banco Neon' },
  { slug: 'dasa', name: 'Dasa' },
  { slug: 'buser', name: 'Buser' },
  { slug: 'kovi', name: 'Kovi' },
  { slug: 'husky', name: 'Husky' },
];

const GLOBAL_REMOTE_GREENHOUSE_BOARDS = [
  { slug: 'gitlab', name: 'GitLab' },
  { slug: 'remotecom', name: 'Remote.com' },
  { slug: 'hubspot', name: 'HubSpot' },
  { slug: 'pipedrive', name: 'Pipedrive' },
  { slug: 'airtable', name: 'Airtable' },
  { slug: 'clickup', name: 'ClickUp' },
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
];

// ============================================================================
// MOTOR DE CLASSIFICAÇÃO, BLACKLIST E ELEGIBILIDADE GEOGRÁFICA
// ============================================================================

export function isBlacklistedTitle(title = '') {
  if (!title) return true;
  const normalized = normalizeGeoText(title);

  const blacklistPatterns = [
    /\bsuporte\s+tecnico\b/i,
    /\btecnico\s+(de\s+)?suporte\b/i,
    /\banalista\s+de\s+suporte\b/i,
    /\bcustomer\s+support\s+engineer\b/i,
    /\btechnical\s+support\b/i,
    /\bhelp\s*desk\b/i,
    /\bservice\s*desk\b/i,
    /\bsuporte\s+n[123]\b/i,
    /\binfraestrutura\b/i,
    /\binfrastructure\b/i,
    /\bplatform\s+engineer\b/i,
    /\bsite\s+reliability\b/i,
    /\bsre\b/i,
    /\bnoc\b/i,
    /\boperacoes\s+de\s+redes\b/i,
    /\banalista\s+de\s+redes\b/i,
    /\bnetwork\s+(engineer|analyst|administrator|operations)\b/i,
    /\btelecom\b/i,
    /\bsysadmin\b/i,
    /\bsystems?\s+administrator\b/i,
    /\blinux\b/i,
    /\bsecurity\s+(engineer|analyst|operations|specialist)\b/i,
    /\bseguranca\s+da\s+informacao\b/i,
    /\bcybersecurity\b/i,
    /\binfosec\b/i,
    /\banalista\s+soc\b/i,
    /\bsecurity\s+operations\s+center\b/i,
    /\bdesenvolvedor(a)?\b/i,
    /\bdeveloper\b/i,
    /\bfront[\s-]*end\b/i,
    /\bback[\s-]*end\b/i,
    /\bfull[\s-]*stack\b/i,
    /\bdevops\b/i,
    /\bsoftware\s+engineer\b/i,
    /\bengenheiro(a)?\s+de\s+software\b/i,
    /\bmobile\s+engineer\b/i,
    /\bios\s+engineer\b/i,
    /\bandroid\s+engineer\b/i,
    /\bcloud\s+(engineer|architect)\b/i,
    /\bsolutions?\s+architect\b/i,
    /\bqa\b/i,
    /\bquality\s+assurance\b/i,
    /\banalista\s+de\s+testes\b/i,
    /\btest\s+(automation|engineer)\b/i,
    /\bautomation\s+(tester|qa)\b/i,
    /\bsdet\b/i,
    /\bdata\s+engineer\b/i,
    /\bengenheiro(a)?\s+de\s+dados\b/i,
    /\bengenharia\s+de\s+dados\b/i,
    /\banalytics\s+engineer\b/i,
    /\bmachine\s+learning\s+engineer\b/i,
    /\bml\s+engineer\b/i,
    /\bai\s+engineer\b/i,
    /\bdata\s+scientist\b/i,
    /\bcientista\s+de\s+dados\b/i,
    /\bdba\b/i,
    /\bdatabase\s+administrator\b/i,
    /\bscrum\s+master\b/i,
    /\bagile\s+coach\b/i,
    /\bproduct\s+designer\b/i,
    /\b(ux|ui)\s+designer\b/i,
    /\bgraphic\s+designer\b/i,
    /\bprogramador(a)?\b/i,

    // Vendas frias / Outbound / Prospecção pura
    /\baccount\s+executive\b/i,
    /\bexecutivo(a)?\s+de\s+(contas|vendas|negocios)\b/i,
    /\bexecutivo(a)?\s+comercial\b/i,
    /\bbdr\b/i,
    /\bsdr\b/i,
    /\bsales\s+development\b/i,
    /\bbusiness\s+development\s+rep(resentative)?\b/i,
    /\binside\s+sales\b/i,
    /\bvendedor(a)?\b/i,
    /\bconsultor(a)?\s+(comercial|de\s+vendas)\b/i,
    /\brepresentante\s+comercial\b/i,
    /\bcloser\b/i,
    /\bkey\s+account\s+manager\b/i,
    /\bassessor(a)?\s+de\s+investimentos\b/i,

    // RH / DP / Jurídico / Contábil / Fiscal / Backoffice fora de escopo
    /\bjovem\s+aprendiz\b/i,
    /\bmenor\s+aprendiz\b/i,
    /\baprendiz\b/i,
    /\brecruiter\b/i,
    /\brecrutador(a)?\b/i,
    /\btalent\s+acquisition\b/i,
    /\bpeople\s+(ops|operations|partner|analytics)\b/i,
    /\boperacoes\s+de\s+rh\b/i,
    /\bimplantacao\s+em\s+rh\b/i,
    /\brecursos\s+humanos\b/i,
    /\bdepartamento\s+pessoal\b/i,
    /\badmissao\b/i,
    /\bfolha\s+de\s+pagamento\b/i,
    /\bpayroll\b/i,
    /\bgeneral\s+counsel\b/i,
    /\blegal\s+(counsel|operations|analyst)\b/i,
    /\bjuridico\b/i,
    /\badvogad[oa]\b/i,
    /\bparalegal\b/i,
    /\bcontabil\b/i,
    /\bcontador(a)?\b/i,
    /\baccountant\b/i,
    /\baccounting\b/i,
    /\bsec\s+reporting\b/i,
    /\bfiscal\b/i,
    /\btributari[oa]\b/i,
    /\btax\s+(analyst|specialist|manager|operations)\b/i,
    /\bauditor(ia)?\b/i,
    /\btesouraria\b/i,
    /\bcontas\s+a\s+(pagar|receber)\b/i,
    /\blicitac(ao|oes)\b/i,
    /\bpregao\b/i,
    /\bcompras\b/i,
    /\bsuprimentos\b/i,
    /\bprocurement\b/i,
    /\btecnico\s+de\s+cadastro\b/i,
    /\balmoxarifado\b/i,
    /\bmotorista\b/i,
    /\brecepcionista\b/i,
    /\boperador(a)?\s+de\s+(loja|caixa|telemarketing|atendimento)\b/i,
    /\bcall\s*center\b/i,
    /\btelemarketing\b/i,
    /\bouvidoria\b/i,
    /\bannotator\b/i,
    /\brater\b/i,
    /\bai\s+trainer\b/i,
    /\bdata\s+labeling\b/i,
    /\bcopywriter\b/i,
    /\bredator(a)?\b/i,
    /\bsocial\s+media\b/i,
    /\bvideo\s+editor\b/i,
    /\bmilitary\b/i,
    /\bpatient\s+onboarding\b/i,
    /\bpropagandista\b/i,
    /\boperacoes\s+(agricolas|florestais|industriais|hospitalares|de\s+loja|portuarias|de\s+usina|de\s+aterro|leves|pesadas|aeroportuarias|de\s+patio)\b/i,
    /\bprocessos\s+(quimicos|industriais|produtivos|fabris|metalurgicos)\b/i,
    /\bengenhari?a\s+(civil|ambiental|mecanic[oa]|eletric[oa]|quimic[oa]|de\s+seguranca|agronomica|florestal|de\s+minas)\b/i,
    /\bengenheiro(a)?\s+(civil|mecanic[oa]|eletricista|quimic[oa]|ambiental|de\s+seguranca|agronom[oa]|de\s+producao|de\s+alimentos|florestal)\b/i,
    /\bmanutencao\b/i,
    /\bmineracao\b/i,
    /\baux\.?\s+de\s+operacoes\b/i,
    /\b(farmaceutic[oa]|enfermeir[oa]|medic[oa]|psicolog[oa]|nutricionista|fisioterapeuta|biomedic[oa]|veterinari[oa])\b/i,
    /\btecnico(a)?\s+(em?\s+)?(enfermagem|seguranca\s+do\s+trabalho|manutencao|eletronica|eletrotecnica|mecanica|quimica|edificacoes|agropecuaria|agricola|laboratorio)\b/i,
    /\bauxiliar\s+de\s+(limpeza|servicos\s+gerais|producao|cozinha|estoque|expedicao|almoxarifado|carga)\b/i,
  ];

  return blacklistPatterns.some(regex => regex.test(normalized));
}

export function isRelevantCareerTitle(title = '') {
  if (!title || isBlacklistedTitle(title)) return false;
  const norm = normalizeGeoText(title);

  return /\b(operacoes|operations|bizops|business\s+operations|strategy\s*&\s*operations|estrategia\s+e\s+operacoes|excelencia\s+operacional|operational\s+excellence|processos|process\s+(analyst|improvement|specialist|excellence)|business\s+process|melhoria\s+continua|bpm|bpmn|analista\s+de\s+negocios|business\s+analyst|analista\s+de\s+requisitos|analista\s+de\s+solucoes|product\s+operations|product\s+owner|inteligencia\s+(de\s+mercado|comercial)|market\s+intelligence|sales\s+intelligence|commercial\s+intelligence|competitive\s+intelligence|planejamento\s+comercial|efetividade\s+comercial|pricing|precificacao|sales\s+ops|sales\s+operations|operacoes\s+comerciais|revops|revenue\s+operations|marketing\s+ops|marketing\s+operations|martech|growth\s+operations|gtm\s+operations|go-to-market|crm|hubspot|salesforce|pipedrive|lifecycle|retencao|implantacao|implementation|onboarding|technical\s+onboarding|customer\s+success|sucesso\s+do\s+cliente|cs\s+ops|analista\s+de\s+integracoes|integration\s+specialist|zendesk|chatwoot|analista\s+de\s+dados|data\s+analyst|data\s+product\s+analyst|analista\s+de\s+analytics|analytics\s+analyst|web\s+analytics|digital\s+analytics|business\s+intelligence|analista\s+de\s+bi|bi\s+analyst|power\s+bi|indicadores|business\s+analytics|e-?commerce\s+(analyst|operations|specialist)|(analista|assistente|consultor(a)?|especialista)\s+(de\s+)?e-?commerce|operacoes\s+de\s+e-?commerce|automacao|automation\s+(analyst|specialist|consultant)|process\s+automation|workflow\s+automation|ai\s+operations|n8n|low-code|no-code)\b/i.test(
    norm
  );
}

function isDisguisedTrap(title = '', description = '') {
  const normDesc = normalizeGeoText(description);
  const normAll = normalizeGeoText(`${title} ${description}`);

  if (/\baiops\b/i.test(normAll) && /\b(datadog|dynatrace|splunk|new\s+relic|kubernetes|prometheus|nagios|zabbix)\b/i.test(normAll)) {
    return true;
  }

  if (
    /\b(french|frances|german|alemao|mandarin|mandarim|korean|coreano|japanese|japones|italian|italiano)\s+(bilingual|fluent|fluency|fluente|required|mandatory|obrigatorio)\b/i.test(
      normAll
    ) ||
    /\b(bilingual|bilingue)\s*[\(\-:]?\s*(french|frances|german|alemao|mandarin|korean|japanese)\b/i.test(normAll)
  ) {
    return true;
  }

  if (
    /\b(cold\s+call|cold\s+calling|ligacoes\s+frias|prospeccao\s+ativa\s+por\s+telefone|meta\s+diaria\s+de\s+ligacoes)\b/i.test(
      normDesc
    ) &&
    !/\b(sales\s+ops|revops|analista\s+de\s+crm|sql|power\s+bi)\b/i.test(normAll)
  ) {
    return true;
  }

  return false;
}

function checkBrazilEligibility(isInternational, title = '', location = '', description = '') {
  const normLoc = normalizeGeoText(location);
  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(String(description).slice(0, 1800));
  const combinedHeader = `${normTitle} ${normLoc}`;

  const mentionsBrazil = /\b(brazil|brasil)\b/i.test(`${combinedHeader} ${normDesc}`);
  const mentionsLatam = /\b(latam|latin\s+america|america\s+latina|south\s+america|americas)\b/i.test(
    `${combinedHeader} ${normDesc}`
  );

  if (!isInternational) {
    const foreignNationalLeak =
      /\b(miami|florida|new\s+york|manhattan|san\s+francisco|california|texas|bucharest|romania|london|united\s+kingdom|madrid|lisbon|portugal|berlin|germany|mexico\s+city|bogota|buenos\s+aires|santiago|warsaw|poland|us\s*\(|usa\b|united\s+states)\b/i.test(
        normLoc
      ) && !/\b(brazil|brasil)\b/i.test(normLoc);

    return { eligible: !foreignNationalLeak, tier: 'br_nacional' };
  }

  const foreignLocLock =
    /\b(usa|u\.s\.|u\.s\.a\.|united\s+states|us\s+only|north\s+america|canada|uk|united\s+kingdom|europe|eu\s+only|eea|emea|dach|germany|austria|switzerland|france|spain|portugal|italy|netherlands|ireland|poland|romania|serbia|ukraine|bulgaria|nordics|sweden|denmark|norway|finland|australia|new\s+zealand|apac|asia|india|philippines|singapore|japan|korea|israel|uae|dubai|abu\s+dhabi|hong\s+kong|south\s+africa|washington\s+d\.?c\.?|california|new\s+york|texas|boston|chicago|seattle|atlanta|denver|london|berlin|toronto|vancouver|sydney|melbourne)\b/i.test(
      combinedHeader
    );

  if (foreignLocLock && !mentionsBrazil && !/\b(latam|latin\s+america|south\s+america)\b/i.test(combinedHeader)) {
    return { eligible: false, tier: 'global_remoto' };
  }

  const singleLatamCountryLoc =
    /\b(argentina|mexico|colombia|chile|peru|uruguay|costa\s+rica)\b/i.test(normLoc) &&
    !/\b(brazil|brasil|latam|latin\s+america)\b/i.test(normLoc);
  const singleLatamCountryBody =
    /\b(based\s+in|reside\s+in|located\s+in|living\s+in|residents\s+of|only\s+in)\s+(argentina|mexico|colombia|chile|peru|uruguay|costa\s+rica|the\s+us|the\s+united\s+states|united\s+states|usa|canada|uk|the\s+uk|europe|germany|australia|india|spain|serbia)\b/i.test(
      normDesc
    ) ||
    /\bheadquarters:\s*(remote\s*[-–,;]\s*)?(argentina|mexico|usa|united\s+states|washington|uk|europe|germany|australia|canada|abu\s+dhabi|singapore|india)\b/i.test(
      normDesc
    ) ||
    /\b(u\.?s\.?\s+citizenship|us\s+work\s+authorization|authorized\s+to\s+work\s+in\s+the\s+(us|united\s+states|uk|eu|canada|australia)|must\s+be\s+located\s+in\s+(the\s+)?(us|usa|uk|canada|eu|europe))\b/i.test(
      normDesc
    );

  if ((singleLatamCountryLoc || singleLatamCountryBody) && !/\b(brazil|brasil)\b/i.test(normLoc)) {
    return { eligible: false, tier: 'global_remoto' };
  }

  if (mentionsBrazil || mentionsLatam) {
    return { eligible: true, tier: 'latam_br' };
  }

  if (/\b(worldwide|anywhere\s+in\s+the\s+world|work\s+from\s+anywhere|global\s+remote|remote\s*-\s*global)\b/i.test(combinedHeader)) {
    return { eligible: true, tier: 'global_remoto' };
  }

  return { eligible: false, tier: 'global_remoto' };
}

function calculateDaysOpen(isoDate) {
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return 1;
  const diffTime = Math.max(0, Date.now() - parsed.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function detectSeniority(title = '', desc = '') {
  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(desc);

  if (/\b(estagio|estagiari[oa]|intern|internship|trainee)\b/i.test(normTitle)) return 'estagio';

  if (
    /\b(staff|principal|director|diretor|diretora|head|lead|lider|senior|sr\.?|especialista|specialist|manager|gerente|coordenador|coordenadora|coordinator|supervisor|supervisora|vp|vice\s+president|chief|architect|arquiteto|iii)\b/i.test(
      normTitle
    )
  ) {
    if (
      /\b(senior|sr\.?|iii|nivel\s+3|n3)\b/i.test(normTitle) &&
      !/\b(staff|principal|director|diretor|diretora|head|lead|lider|especialista|specialist|manager|gerente|coordenador|coordenadora|supervisor|supervisora|vp|chief)\b/i.test(
        normTitle
      )
    ) {
      return 'senior';
    }
    return 'especialista';
  }

  if (
    /\b(junior|jr\.?|assistente|auxiliar|entry[\s-]*level|associate|nivel\s+1|\bn1\b)\b/i.test(normTitle) ||
    /\b(analista|analyst|consultor)\s+i\b/i.test(normTitle)
  ) {
    return 'junior';
  }

  if (/\b(pleno|pl\.?|mid[\s-]*level|\bii\b|nivel\s+2|\bn2\b)\b/i.test(normTitle)) {
    return 'pleno';
  }

  if (
    /\b([5-9]|1\d)\+?\s*(anos|years)\s+(de\s+)?(experiencia|experience|vivencia)\b/i.test(normDesc) ||
    /\bexperiencia\s+senior\b/i.test(normDesc)
  ) {
    return 'senior';
  }

  if (/\b(junior|entry\s+level|ate\s+2\s+anos|1\s+a\s+2\s+anos)\b/i.test(normDesc)) {
    return 'junior';
  }

  return 'pleno';
}

function detectCategories(title = '', desc = '') {
  const combined = `${title} ${desc}`.toLowerCase();
  const cats = [];

  if (
    /\b(opera[çc][õo]es|operations|bizops|business\s+operations|processos|process|bpm|bpmn|melhoria\s+cont[íi]nua|analista\s+de\s+neg[óo]cios|business\s+analyst|requisitos|product\s+operations|produto|product\s+owner|planejamento)\b/i.test(
      combined
    )
  ) {
    cats.push('bizops_processos');
  }
  if (
    /\b(intelig[êe]ncia\s+de\s+mercado|market\s+intelligence|intelig[êe]ncia\s+comercial|sales\s+intelligence|competitive\s+intelligence|go-to-market|gtm|pesquisa\s+de\s+mercado|pricing|planejamento\s+comercial|estrategia\s+comercial)\b/i.test(
      combined
    )
  ) {
    cats.push('inteligencia_mercado');
  }
  if (
    /\b(crm|revops|revenue\s+operations|sales\s+ops|sales\s+operations|opera[çc][õo]es\s+comerciais|hubspot|salesforce|pipedrive|rd\s+station|implanta[çc][ãa]o|onboarding|implementation|customer\s+success|sucesso\s+do\s+cliente|cs\s+ops|ativac[ãa]o|chatwoot|zendesk)\b/i.test(
      combined
    )
  ) {
    cats.push('crm_revops_onboarding');
  }
  if (
    /\b(dados|data|bi\b|business\s+intelligence|power\s+bi|looker|metabase|tableau|analytics|sql|etl|indicadores|kpis?|dashboard|ga4|tag\s+manager)\b/i.test(
      combined
    )
  ) {
    cats.push('dados_bi');
  }
  if (
    /\b(n8n|zapier|make\.com|integromat|automa[çc][ãa]o|automation|rpa|agentes\s+de\s+ia|ai\s+agents|ai\s+operations|llm|openai|gemini|prompt|webhooks)\b/i.test(
      combined
    )
  ) {
    cats.push('automacao_ia');
  }

  if (cats.length === 0) cats.push('bizops_processos');
  return cats;
}

function detectAffirmative(title = '', desc = '') {
  const t = title.toLowerCase();
  const combined = `${title} ${desc}`.toLowerCase();

  if (
    /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(pcd|pcds|defici[êe]ncia)\b/i.test(combined) ||
    /\bvaga\s+exclusiva\s+para\s+pcd/i.test(combined) ||
    /\(pcd\)/i.test(t)
  ) {
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

function detectSpanishRequirement(title = '', description = '') {
  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(description);

  if (/\b(bilingue\s+espanhol|spanish\s+bilingual|bilingual\s*\(?spanish|espanhol\s+obrigatorio)\b/i.test(`${normTitle} ${normDesc}`)) {
    return true;
  }

  const sentences = normDesc.split(/[.\n;•]+/);
  for (const s of sentences) {
    if (!/\b(espanhol|spanish|espanol)\b/i.test(s)) continue;
    if (/\b(desejavel|diferencial|nice\s+to\s+have|plus|bonus|sera\s+um\s+diferencial|opcional)\b/i.test(s)) {
      continue;
    }
    if (/\b(avancado|fluente|fluent|fluency|advanced|obrigatorio|mandatory|required|necessario|indispensavel|c1|c2|b2)\b/i.test(s)) {
      return true;
    }
  }
  return false;
}

function detectHiddenOnsiteWarning(workplaceType, title = '', description = '') {
  if (workplaceType !== 'remoto') return { hasWarning: false };
  const norm = normalizeGeoText(`${title} ${description}`);

  if (
    /\b(encontros\s+presenciais|ida[s]?\s+presencia(l|is)|ida[s]?\s+ao\s+escritorio|[1-5]\s*x\s*(por|na)\s*semana\s*(presencial|no\s+escritorio)|regime\s+hibrido|modelo\s+hibrido|atuar\s+presencialmente|residir\s+(obrigatoriamente\s+)?em\s+[a-z]+)\b/i.test(
      norm
    )
  ) {
    return { hasWarning: true, reason: 'Presencial/Híbrido citado no texto' };
  }
  if (/\b(disponibilidade\s+para\s+viagens|viagens\s+(pontuais|frequentes|esporadicas|nacionais)|eventos\s+presenciais)\b/i.test(norm)) {
    return { hasWarning: true, reason: 'Viagens / eventos pontuais' };
  }
  return { hasWarning: false };
}

function detectContractType(title = '', description = '', rawJobType = '') {
  const jt = normalizeGeoText(rawJobType);
  if (jt.includes('autonomous') || jt.includes('legal_entity') || jt === 'pj' || jt === 'contractor') return 'pj';
  if (jt.includes('temporary')) return 'temporario';
  if (jt.includes('intern') || jt.includes('trainee')) return 'estagio';
  if (jt.includes('effective') || jt === 'clt') return 'clt';

  const normTitle = normalizeGeoText(title);
  const normDesc = normalizeGeoText(String(description).slice(0, 1200));
  if (/\b(temporari[oa]|cobertura\s+de\s+licenca|contrato\s+determinado)\b/i.test(normTitle)) return 'temporario';
  if (/\b(estagio|estagiari[oa]|internship)\b/i.test(normTitle)) return 'estagio';
  if (/\b(modelo\s+pj|contratacao\s+pj|contrato\s+pj|\bpj\b|pessoa\s+juridica|autonomo)\b/i.test(`${normTitle} ${normDesc}`)) {
    return 'pj';
  }
  if (/\b(\bclt\b|efetivo)\b/i.test(`${normTitle} ${normDesc}`)) {
    return 'clt';
  }
  return undefined;
}

function detectCrmTrack(title = '', description = '') {
  const norm = normalizeGeoText(`${title} ${description}`);
  if (!/\b(crm|hubspot|salesforce|pipedrive|rd\s+station|klaviyo|braze|chatwoot)\b/i.test(norm)) {
    return undefined;
  }
  if (
    /\b(reguas?\s+de\s+relacionamento|email\s+marketing|push|sms|rfm|lifecycle|braze|klaviyo|sfmc|marketing\s+cloud|campanhas\s+de\s+retencao)\b/i.test(
      norm
    ) &&
    !/\b(webhooks?|n8n|sales\s+ops|revops|integrac(ao|oes)\s+via\s+api)\b/i.test(norm)
  ) {
    return 'crm_marketing';
  }
  return 'crm_tecnico';
}

const SKILL_DICTIONARY = [
  { label: 'Operações / BizOps', regex: /\b(opera[çc][õo]es|business\s+operations|bizops|strategy\s*&\s*operations|efici[êe]ncia\s+operacional)\b/i },
  { label: 'Processos / BPMN', regex: /\b(bpmn|bizagi|mapeamento\s+de\s+processos|melhoria\s+cont[íi]nua|process\s+improvement|lean|pops?|playbooks?)\b/i },
  { label: 'Onboarding / CS', regex: /\b(implanta[çc][ãa]o|onboarding|implementation|customer\s+success|sucesso\s+do\s+cliente|cs\s+ops)\b/i },
  { label: 'Inteligência Comercial', regex: /\b(intelig[êe]ncia\s+comercial|sales\s+intelligence|planejamento\s+comercial|efetividade\s+comercial)\b/i },
  { label: 'Inteligência de Mercado', regex: /\b(intelig[êe]ncia\s+de\s+mercado|market\s+intelligence|pesquisa\s+de\s+mercado|competitive\s+intelligence|pricing)\b/i },
  { label: 'CRM', regex: /\bcrm\b/i },
  { label: 'HubSpot', regex: /\bhubspot\b/i },
  { label: 'Salesforce', regex: /\bsalesforce\b/i },
  { label: 'RD Station / Pipedrive', regex: /\b(rd\s+station|pipedrive|moskit|kommo|bitrix24|zoho\s+crm)\b/i },
  { label: 'Chatwoot / Mensageria', regex: /\b(chatwoot|zendesk|intercom|manychat|respond\.io|take\s*blip|whatsapp\s+api|evolution\s+api|z-api|mensageria|omnichannel)\b/i },
  { label: 'Sales Ops', regex: /\b(sales\s+ops|sales\s+operations|opera[çc][õo]es\s+comerciais)\b/i },
  { label: 'RevOps', regex: /\b(revops|revenue\s+operations)\b/i },
  { label: 'Análise de Dados', regex: /\b(an[áa]lise\s+de\s+dados|data\s+analysis|data\s+analytics|business\s+analytics|analytics)\b/i },
  { label: 'Indicadores / KPIs', regex: /\b(indicadores|kpis?|okrs?|dashboards?|m[ée]tricas|sla)\b/i },
  { label: 'SQL', regex: /\b(sql|bigquery|snowflake|postgres|postgresql|mysql)\b/i },
  { label: 'Power BI', regex: /\b(power\s*bi|tableau|looker|metabase|dax)\b/i },
  { label: 'N8N', regex: /\bn8n\b/i },
  { label: 'Make / Zapier', regex: /\b(make\.com|integromat|zapier)\b/i },
  { label: 'Automação / IA', regex: /\b(automa[çc][ãa]o|automation|rpa|openai|gemini|claude|llm|intelig[êe]ncia\s+artificial|ai\s+agents|agentes\s+de\s+ia|ai\s+operations)\b/i },
  { label: 'APIs / Webhooks', regex: /\b(webhooks?|apis?\s+rest|rest\s+api|integra[çc][õo]es|postman|json)\b/i },
  { label: 'E-commerce / Ads', regex: /\b(shopify|yampi|nuvemshop|vtex|woocommerce|e-?commerce|meta\s+ads|google\s+ads|ga4|tag\s+manager|trafego\s+pago)\b/i },
  { label: 'Python', regex: /\bpython\b/i },
  { label: 'Excel / Sheets', regex: /\b(excel|google\s+sheets|planilhas|vba|procx|procv)\b/i },
];

function extractSkills(text = '') {
  const found = [];
  for (const item of SKILL_DICTIONARY) {
    if (item.regex.test(text)) {
      found.push(item.label);
    }
  }
  return found.length > 0 ? found : ['Operações / BizOps', 'Indicadores / KPIs'];
}

function extractRequirementBullets(rawPrerequisites = '', fallbackStacks = [], isIntl = false) {
  const cleaned = stripHtml(rawPrerequisites);
  if (cleaned.length >= 30) {
    const lines = cleaned
      .split(/\n+|•|·|\s+-\s+/)
      .map(s => s.replace(/^[-*•·\d.)\s]+/, '').trim())
      .filter(s => s.length >= 14 && s.length <= 200);
    if (lines.length >= 2) {
      return lines.slice(0, 6);
    }
  }
  return fallbackStacks.map(s => (isIntl ? `Experience with ${s}` : `Vivência ou conhecimento em ${s}`));
}

function finalizeJobRecord(base) {
  const cleanTitle = cleanJobTitle(base.title);
  if (!cleanTitle || !isRelevantCareerTitle(cleanTitle)) return null;

  const cleanDesc = stripHtml(base.description || '').slice(0, 3200);
  if (isDisguisedTrap(cleanTitle, cleanDesc)) return null;

  const elig = checkBrazilEligibility(Boolean(base.isInternational), cleanTitle, base.location || '', cleanDesc);
  if (!elig.eligible) return null;

  const daysOpen = calculateDaysOpen(base.publishedAt);
  if (daysOpen > 45) return null;

  if (base.expiresAt) {
    const expTime = new Date(base.expiresAt).getTime();
    if (!isNaN(expTime) && expTime < Date.now()) return null;
  }

  const stacks = extractSkills(`${cleanTitle} ${base.extraSkillContext || ''} ${cleanDesc}`);
  const categories = detectCategories(cleanTitle, cleanDesc);
  const affirmative = base.isInternational ? { isAffirmative: false } : detectAffirmative(cleanTitle, cleanDesc);
  const seniority = detectSeniority(cleanTitle, cleanDesc);
  const contractType = detectContractType(cleanTitle, cleanDesc, base.rawJobType || '');
  const crmTrack = detectCrmTrack(cleanTitle, cleanDesc);
  const requiresSpanish = detectSpanishRequirement(cleanTitle, cleanDesc);
  const onsiteWarn = base.isInternational
    ? { hasWarning: false }
    : detectHiddenOnsiteWarning(base.workplaceType, cleanTitle, cleanDesc);

  return {
    id: base.id,
    title: cleanTitle,
    company: (base.company || 'Empresa Verificada').trim(),
    companyLogo: base.companyLogo || undefined,
    platform: base.platform,
    canonicalUrl: base.canonicalUrl,
    publishedAt: base.publishedAt,
    expiresAt: base.expiresAt || undefined,
    daysOpen,
    workplaceType: base.isInternational ? 'remoto' : base.workplaceType,
    location: base.location,
    city: base.city || undefined,
    state: base.state || undefined,
    seniority,
    contractType,
    geoEligibility: elig.tier,
    crmTrack,
    requiresSpanish,
    hasHiddenOnsiteWarning: onsiteWarn.hasWarning,
    hiddenOnsiteReason: onsiteWarn.reason,
    stacks,
    salary: base.salary || undefined,
    description: cleanDesc || `Oportunidade para ${cleanTitle} na ${base.company}.`,
    requirements:
      base.requirements && base.requirements.length > 0
        ? base.requirements
        : extractRequirementBullets('', stacks, Boolean(base.isInternational)),
    isActive: true,
    isAffirmative: affirmative.isAffirmative,
    affirmativeReason: affirmative.reason,
    nicheCategories: categories,
    isInternational: Boolean(base.isInternational),
  };
}

// ============================================================================
// 1. GUPY GLOBAL + REGIONAL + EMPREGOSTEC COM HIDRATAÇÃO REAL (__NEXT_DATA__)
// ============================================================================

async function hydrateGupyJob(candidate) {
  try {
    const res = await fetchWithTimeout(candidate.canonicalUrl, {}, 7500);
    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) {
      if (/candidaturas?\s+encerradas?|vaga\s+encerrada/i.test(html)) return null;
      return finalizeJobRecord(candidate);
    }

    const nextData = JSON.parse(match[1]);
    const job = nextData.props?.pageProps?.job;
    if (!job) return null;

    if (job.status && job.status !== 'published') return null;
    if (job.isInternalMobility === true) return null;

    const rawJobType = String(job.jobType || job.type || '');
    if (/apprentice/i.test(rawJobType)) return null;

    const expiresAt = job.expiresAt || job.registerEndDate || undefined;
    if (expiresAt) {
      const expMs = new Date(expiresAt).getTime();
      if (!isNaN(expMs) && expMs < Date.now()) return null;
    }

    const wpRaw = String(job.workplaceType || candidate.rawWorkplace || '').toLowerCase();
    const workplaceType =
      wpRaw === 'remote' ? 'remoto' : wpRaw === 'hybrid' ? 'hibrido' : candidate.workplaceType || 'presencial';

    const city = job.addressCity || candidate.city || '';
    const state = job.addressStateShortName || job.addressState || candidate.state || '';
    const country = job.addressCountry || 'Brasil';
    if (country && !/brasil|brazil/i.test(country)) return null;

    const location =
      workplaceType === 'remoto'
        ? city
          ? `Remoto (${city}${state ? ` - ${state}` : ''})`
          : 'Remoto - Brasil'
        : `${city ? `${city}, ` : ''}${state || 'Brasil'}`;

    const responsibilities = stripHtml(job.responsibilities || '');
    const prerequisites = stripHtml(job.prerequisites || '');
    const aboutJob = stripHtml(job.description || '');
    const additionalInfo = stripHtml(job.additionalInformation || '');

    const descSections = [];
    if (responsibilities) descSections.push(`Responsabilidades e Atribuições:\n${responsibilities}`);
    if (prerequisites) descSections.push(`Requisitos e Qualificações:\n${prerequisites}`);
    if (additionalInfo) descSections.push(`Informações Adicionais:\n${additionalInfo}`);
    if (descSections.length === 0 && aboutJob) descSections.push(aboutJob);

    const fullDesc = descSections.join('\n\n') || candidate.description || '';
    const title = cleanJobTitle(job.name || candidate.title);
    const company = job.careerPage?.name || candidate.company || 'Empresa na Gupy';
    const stacks = extractSkills(`${title} ${fullDesc}`);

    return finalizeJobRecord({
      id: `gupy_${job.id || candidate.numericId || makeUniqueId('gp', candidate.canonicalUrl, title, company)}`,
      title,
      company,
      companyLogo: job.careerPage?.urlLogo || candidate.companyLogo,
      platform: 'gupy',
      canonicalUrl: candidate.canonicalUrl.split('?')[0],
      publishedAt: job.publishedAt || candidate.publishedAt,
      expiresAt,
      workplaceType,
      location,
      city,
      state,
      rawJobType,
      description: fullDesc,
      requirements: extractRequirementBullets(job.prerequisites || '', stacks, false),
      isInternational: false,
    });
  } catch {
    return null;
  }
}

async function scrapeGupyAndAggregators() {
  console.log('🔎 [1/5] Varrendo Gupy Global + Polos Regionais + EmpregosTec com hidratação de status...');
  const gupyCandidatesById = new Map();
  const nonGupyAggregatorJobs = [];

  await mapConcurrent(GUPY_SEARCH_TERMS, 8, async term => {
    const url = `https://portal.gupy.io/job-search/term=${encodeURIComponent(term)}`;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) return;

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) return;

    const nextData = JSON.parse(match[1]);
    const list = nextData.props?.pageProps?.initialJobList?.data || [];

    for (const raw of list) {
      const title = cleanJobTitle(raw.name || '');
      if (!title || !isRelevantCareerTitle(title)) continue;
      if (calculateDaysOpen(raw.publishedDate) > 45) continue;

      const numericId = String(raw.id || extractGupyJobId(raw.jobUrl) || raw.jobUrl);
      if (gupyCandidatesById.has(numericId)) continue;

      const workplaceType =
        raw.workplaceType === 'remote' ? 'remoto' : raw.workplaceType === 'hybrid' ? 'hibrido' : 'presencial';

      gupyCandidatesById.set(numericId, {
        numericId,
        title,
        company: raw.careerPageName || 'Empresa na Gupy',
        companyLogo: raw.careerPageLogo,
        canonicalUrl: raw.jobUrl,
        publishedAt: raw.publishedDate,
        workplaceType,
        rawWorkplace: raw.workplaceType,
        city: raw.city || '',
        state: raw.state || '',
        description: stripHtml(raw.description || ''),
      });
    }
  });

  // EmpregosTec RSS: hidrata links Gupy na mesma fila e valida links diretos InHire/Sólides/etc.
  try {
    const res = await fetchWithTimeout('https://www.empregostec.com.br/feed/', {}, 8000);
    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

      for (const itemXml of items) {
        const rawTitle = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
        const pubDateStr = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
        const contentEncoded = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || '';
        const descCdata = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || '';

        const title = cleanJobTitle(rawTitle)
          .replace(/^Vaga Home Office:\s*/i, '')
          .replace(/\s+na empresa\s+.+$/i, '')
          .trim();

        if (!title || !isRelevantCareerTitle(title)) continue;

        const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
        const publishedAt = isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString();
        if (calculateDaysOpen(publishedAt) > 45) continue;

        const applyMatch = contentEncoded.match(/<a href=["']([^"']+)["'][^>]*>Candidatar-se agora/i);
        const canonicalUrl = (applyMatch ? applyMatch[1] : link).trim();
        if (!canonicalUrl) continue;

        const companyMatch =
          contentEncoded.match(/<strong>Empresa:<\/strong>\s*([^<]+)/i) || rawTitle.match(/na empresa\s+(.+)$/i);
        const company = companyMatch ? stripHtml(companyMatch[1]).trim() : 'Empresa Verificada';
        const urlLower = canonicalUrl.toLowerCase();

        if (urlLower.includes('gupy.io')) {
          const numericId = extractGupyJobId(canonicalUrl) || canonicalUrl;
          if (!gupyCandidatesById.has(numericId)) {
            gupyCandidatesById.set(numericId, {
              numericId,
              title,
              company,
              canonicalUrl,
              publishedAt,
              workplaceType: 'remoto',
              city: '',
              state: '',
              description: stripHtml(contentEncoded || descCdata),
            });
          }
          continue;
        }

        // InHire links serão cobertos diretamente pela API InHire (ou validados abaixo)
        let platform = 'empregostec';
        if (urlLower.includes('inhire.app')) platform = 'inhire';
        else if (urlLower.includes('solides')) platform = 'solides';
        else if (urlLower.includes('greenhouse.io')) platform = 'greenhouse';
        else if (urlLower.includes('lever.co')) platform = 'lever';

        nonGupyAggregatorJobs.push({
          id: makeUniqueId('et', canonicalUrl, title, company),
          title,
          company,
          platform,
          canonicalUrl,
          publishedAt,
          workplaceType: 'remoto',
          location: 'Remoto - Brasil',
          description: stripHtml(contentEncoded || descCdata),
          isInternational: false,
        });
      }
    }
  } catch (err) {
    console.warn('   ⚠️ Aviso no feed complementar EmpregosTec:', err.message);
  }

  const gupyCandidates = Array.from(gupyCandidatesById.values());
  console.log(`   🔄 Hidratando ${gupyCandidates.length} URLs únicas da Gupy para validar vagas abertas e requisitos...`);
  const hydratedGupy = await mapConcurrent(gupyCandidates, 12, hydrateGupyJob);

  const verifiedNonGupy = await mapConcurrent(nonGupyAggregatorJobs, 6, async item => {
    const inhireMatch = item.canonicalUrl.match(/https?:\/\/([a-z0-9-]+)\.inhire\.app\/vagas\/([a-f0-9-]+)/i);
    if (inhireMatch) {
      const [, slug, jobId] = inhireMatch;
      const res = await fetchWithTimeout(
        `https://api.inhire.app/job-posts/public/pages/${jobId}`,
        { headers: { 'X-Tenant': slug, Accept: 'application/json' } },
        7000
      );
      if (!res.ok) return null;
      const detail = await res.json();
      if (detail.status && detail.status !== 'published' && detail.status !== 'open') return null;
      return finalizeJobRecord({
        ...item,
        platform: 'inhire',
        title: detail.displayName || detail.title || item.title,
        description: detail.description || item.description,
        rawJobType: detail.contractType || detail.employmentType || '',
      });
    }

    const res = await fetchWithTimeout(item.canonicalUrl, {}, 6500);
    if (!res.ok) return null;
    const html = await res.text();
    if (/candidaturas?\s+encerradas?|vaga\s+encerrada|no\s+longer\s+available/i.test(html)) return null;
    return finalizeJobRecord(item);
  });

  const combined = [...hydratedGupy, ...verifiedNonGupy];
  console.log(
    `   ✅ Gupy Hidratada + Canais BR: ${combined.length} vagas confirmadas abertas (de ${gupyCandidates.length} candidatas Gupy).`
  );
  return combined;
}

// ============================================================================
// 2. INHIRE DIRECT PUBLIC API (20 SCALE-UPS E EMPRESAS TECH NO BRASIL)
// ============================================================================

async function scrapeInHireDirect() {
  console.log(`🔎 [2/5] Consultando API pública direta InHire (${INHIRE_TENANTS.length} empresas BR)...`);
  const rawPostings = [];

  await mapConcurrent(INHIRE_TENANTS, 8, async tenant => {
    const res = await fetchWithTimeout(
      'https://api.inhire.app/job-posts/public/pages',
      { headers: { 'X-Tenant': tenant.slug, Accept: 'application/json' } },
      8000
    );
    if (!res.ok) return;
    const data = await res.json();
    const list = Array.isArray(data.jobsPage) ? data.jobsPage : [];
    const tenantDisplay = data.tenantName || tenant.name;

    for (const item of list) {
      if (item.status && item.status !== 'published' && item.status !== 'open') continue;
      const title = cleanJobTitle(item.displayName || item.title || '');
      if (!title || !isRelevantCareerTitle(title)) continue;
      if (!item.jobId) continue;

      rawPostings.push({
        slug: tenant.slug,
        company: tenant.name || tenantDisplay,
        jobId: item.jobId,
        title,
        workplaceRaw: item.workplaceType || '',
        locationRaw: item.location || '',
      });
    }
  });

  const hydrated = await mapConcurrent(rawPostings, 8, async post => {
    const res = await fetchWithTimeout(
      `https://api.inhire.app/job-posts/public/pages/${post.jobId}`,
      { headers: { 'X-Tenant': post.slug, Accept: 'application/json' } },
      7500
    );
    if (!res.ok) return null;
    const detail = await res.json();
    if (detail.status && detail.status !== 'published' && detail.status !== 'open') return null;

    const wpNorm = normalizeGeoText(detail.workplaceType || post.workplaceRaw || '');
    const workplaceType =
      wpNorm.includes('remote') || wpNorm.includes('remoto')
        ? 'remoto'
        : wpNorm.includes('hybrid') || wpNorm.includes('hibrido')
        ? 'hibrido'
        : 'presencial';

    const locObj = detail.location || post.locationRaw;
    let locStr = '';
    let city = '';
    let state = '';
    if (typeof locObj === 'string') {
      locStr = locObj.trim();
    } else if (locObj && typeof locObj === 'object') {
      city = locObj.city || '';
      state = locObj.state || locObj.stateShortName || '';
      locStr = [city, state, locObj.country].filter(Boolean).join(', ');
    }

    const location =
      workplaceType === 'remoto'
        ? locStr && !/^remoto$/i.test(locStr)
          ? `Remoto (${locStr})`
          : 'Remoto - Brasil'
        : locStr || 'Brasil';

    const publishedAt = detail.publishedAt || detail.createdAt || detail.updatedAt || new Date().toISOString();
    const rawDesc =
      typeof detail.description === 'string'
        ? detail.description
        : [detail.about, detail.responsibilities, detail.requirements, detail.benefits].filter(Boolean).join('\n\n');

    const canonicalUrl = `https://${post.slug}.inhire.app/vagas/${post.jobId}`;
    const stacks = extractSkills(`${detail.displayName || post.title} ${stripHtml(rawDesc)}`);

    return finalizeJobRecord({
      id: `inhire_${post.slug}_${String(post.jobId).slice(0, 12)}`,
      title: detail.displayName || post.title,
      company: post.company,
      platform: 'inhire',
      canonicalUrl,
      publishedAt,
      workplaceType,
      location,
      city,
      state,
      rawJobType: detail.contractType || detail.employmentType || '',
      description: rawDesc,
      requirements: extractRequirementBullets(detail.requirements || '', stacks, false),
      isInternational: false,
    });
  });

  console.log(`   ✅ InHire Direto: ${hydrated.length} vagas hidratadas e validadas.`);
  return hydrated;
}

// ============================================================================
// 3. ASHBY PUBLIC API (NUBANK BRASIL + STARTUPS GLOBAIS N8N, ZAPIER, NOTION, ETC.)
// ============================================================================

async function scrapeAshbyBoards() {
  console.log(`🔎 [3/5] Consultando API pública Ashby (${ASHBY_BOARDS.length} empresas Tech/SaaS)...`);
  const allAshby = [];

  await mapConcurrent(ASHBY_BOARDS, 6, async board => {
    const res = await fetchWithTimeout(`https://api.ashbyhq.com/posting-api/job-board/${board.slug}`, {}, 8000);
    if (!res.ok) return;
    const data = await res.json();

    for (const raw of data.jobs || []) {
      if (raw.isListed === false) continue;
      const title = cleanJobTitle(raw.title || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const secondaryLocs = Array.isArray(raw.secondaryLocations)
        ? raw.secondaryLocations.map(s => s?.location || '').filter(Boolean)
        : [];
      const locCombined = [raw.location || '', ...secondaryLocs].filter(Boolean).join('; ');
      const normLoc = normalizeGeoText(locCombined);

      const isBrazilOfficeOrRemote = /\b(brazil|brasil|sao\s+paulo|rio\s+de\s+janeiro|belo\s+horizonte|campinas|curitiba|porto\s+alegre|florianopolis)\b/i.test(
        normLoc
      );

      const isInternational = !isBrazilOfficeOrRemote;
      if (isInternational && !raw.isRemote && !/\b(remote|anywhere|worldwide|latam|latin\s+america|global)\b/i.test(normLoc)) {
        continue;
      }

      const workplaceType = isInternational
        ? 'remoto'
        : raw.isRemote || /\b(remote|remoto)\b/i.test(normLoc)
        ? 'remoto'
        : /\b(hybrid|hibrido)\b/i.test(`${normLoc} ${normalizeGeoText(raw.workplaceType || '')}`)
        ? 'hibrido'
        : 'presencial';

      const location = isInternational
        ? `🌎 Remoto Internacional (${locCombined || 'Global Remote'})`
        : locCombined || 'Brasil';

      const rawDesc = raw.descriptionPlain || raw.descriptionHtml || '';
      const jobRecord = finalizeJobRecord({
        id: `ashby_${board.slug}_${String(raw.id).slice(0, 12)}`,
        title,
        company: board.name,
        platform: 'ashby',
        canonicalUrl: raw.jobUrl || `https://jobs.ashbyhq.com/${board.slug}/${raw.id}`,
        publishedAt: raw.publishedAt || new Date().toISOString(),
        workplaceType,
        location,
        rawJobType: raw.employmentType || '',
        extraSkillContext: `${raw.department || ''} ${raw.team || ''}`,
        description: rawDesc,
        isInternational,
      });

      if (jobRecord) allAshby.push(jobRecord);
    }
  });

  console.log(`   ✅ Ashby Direto: ${allAshby.length} vagas coletadas (Brasil + Global elegível).`);
  return allAshby;
}

// ============================================================================
// 4. GREENHOUSE & LEVER BRASIL
// ============================================================================

async function scrapeBrazilGreenhouseAndLever() {
  console.log('🔎 [4/5] Varrendo Boards Greenhouse & Lever no Brasil...');
  const jobs = [];

  await mapConcurrent(BRAZIL_GREENHOUSE_BOARDS, 6, async company => {
    const res = await fetchWithTimeout(
      `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`,
      {},
      8500
    );
    if (!res.ok) return;
    const data = await res.json();

    for (const raw of data.jobs || []) {
      const title = cleanJobTitle(raw.title || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const loc = (raw.location?.name || '').trim();
      const normLoc = normalizeGeoText(loc);

      // Se for uma empresa global (ex: Brex, VTEX, Wellhub) com vaga remota LATAM sem citar Brasil direto, trata como LATAM
      const isLatamWithoutCity =
        /\b(latam|latin\s+america)\b/i.test(normLoc) && !/\b(brazil|brasil)\b/i.test(normLoc);

      const combined = `${title} ${loc}`.toLowerCase();
      const workplaceType =
        combined.includes('remote') || combined.includes('remoto')
          ? 'remoto'
          : combined.includes('hybrid') || combined.includes('híbrido') || combined.includes('hibrido')
          ? 'hibrido'
          : 'presencial';

      const jobRecord = finalizeJobRecord({
        id: `gh_${company.slug}_${raw.id}`,
        title,
        company: company.name,
        platform: 'greenhouse',
        canonicalUrl: raw.absolute_url,
        publishedAt: raw.updated_at,
        workplaceType,
        location: isLatamWithoutCity ? `🌎 Remoto Internacional (${loc})` : loc || 'Brasil',
        description: raw.content || '',
        isInternational: isLatamWithoutCity,
      });

      if (jobRecord) jobs.push(jobRecord);
    }
  });

  await mapConcurrent(BRAZIL_LEVER_BOARDS, 5, async company => {
    const res = await fetchWithTimeout(`https://api.lever.co/v0/postings/${company.slug}?mode=json`, {}, 8000);
    if (!res.ok) return;
    const list = await res.json();
    if (!Array.isArray(list)) return;

    for (const raw of list) {
      const title = cleanJobTitle(raw.text || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const loc = raw.categories?.location || 'Brasil';
      const combined = `${title} ${loc} ${raw.categories?.workplaceType || ''}`.toLowerCase();
      const workplaceType =
        combined.includes('remote') || combined.includes('remoto')
          ? 'remoto'
          : combined.includes('hybrid') || combined.includes('híbrido') || combined.includes('hibrido')
          ? 'hibrido'
          : 'presencial';

      const jobRecord = finalizeJobRecord({
        id: `lever_${company.slug}_${String(raw.id).slice(0, 12)}`,
        title,
        company: company.name,
        platform: 'lever',
        canonicalUrl: raw.hostedUrl,
        publishedAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        workplaceType,
        location: loc,
        rawJobType: raw.categories?.commitment || '',
        description: raw.descriptionPlain || raw.description || '',
        isInternational: false,
      });

      if (jobRecord) jobs.push(jobRecord);
    }
  });

  console.log(`   ✅ Greenhouse & Lever Brasil: ${jobs.length} vagas validadas.`);
  return jobs;
}

// ============================================================================
// 5. FONTES INTERNACIONAIS 100% REMOTAS COM VALIDAÇÃO GEOGRÁFICA REAL PARA O BRASIL
// ============================================================================

async function scrapeInternationalRemote() {
  console.log('🔎 [5/5] Varrendo 7 Motores Globais (com filtro estrito de elegibilidade para residentes no Brasil)...');
  const jobs = [];

  // 5A. The Muse Public API (Respeita raw.locations reais para bloquear vagas US-Only)
  const museCategories = [
    'Business Operations',
    'Data and Analytics',
    'Project Management',
    'Account Management',
    'Customer Service',
    'Marketing',
    'Product Management',
  ];

  const museQueries = [];
  for (const cat of museCategories) {
    for (let page = 1; page <= 2; page++) {
      museQueries.push({ cat, page });
    }
  }

  await mapConcurrent(museQueries, 6, async ({ cat, page }) => {
    const url = `https://www.themuse.com/api/public/jobs?location=Flexible%20%2F%20Remote&category=${encodeURIComponent(
      cat
    )}&page=${page}`;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) return;
    const data = await res.json();

    for (const raw of data.results || []) {
      const title = cleanJobTitle(raw.name || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const realLocs = (raw.locations || [])
        .map(l => l?.name || '')
        .filter(n => n && !/^flexible\s*\/\s*remote$/i.test(n));
      const locDisplay = realLocs.length > 0 ? realLocs.join('; ') : 'Global / Flexible';

      const jobRecord = finalizeJobRecord({
        id: `muse_${raw.id}`,
        title,
        company: raw.company?.name || 'Global Remote Company',
        platform: 'remotive_intl',
        canonicalUrl: raw.refs?.landing_page || `https://www.themuse.com/jobs/${raw.id}`,
        publishedAt: raw.publication_date ? new Date(raw.publication_date).toISOString() : new Date().toISOString(),
        workplaceType: 'remoto',
        location: `🌎 Remoto Internacional (${locDisplay})`,
        description: raw.contents || '',
        isInternational: true,
      });
      if (jobRecord) jobs.push(jobRecord);
    }
  });

  // 5B. Remotive API
  const remotiveCategories = [
    'business',
    'data',
    'marketing',
    'sales',
    'product',
    'project-management',
    'customer-support',
    'all-others',
  ];

  await mapConcurrent(remotiveCategories, 4, async cat => {
    const res = await fetchWithTimeout(`https://remotive.com/api/remote-jobs?category=${cat}&limit=100`, {}, 8500);
    if (!res.ok) return;
    const data = await res.json();

    for (const raw of data.jobs || []) {
      const title = cleanJobTitle(raw.title || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const reqLoc = (raw.candidate_required_location || 'Worldwide').trim();
      const jobRecord = finalizeJobRecord({
        id: `remotive_${raw.id}`,
        title,
        company: raw.company_name || 'Global Remote Company',
        companyLogo: raw.company_logo,
        platform: 'remotive_intl',
        canonicalUrl: raw.url,
        publishedAt: new Date(raw.publication_date).toISOString(),
        workplaceType: 'remoto',
        location: `🌎 Remoto Internacional (${reqLoc})`,
        rawJobType: raw.job_type || '',
        salary: raw.salary || undefined,
        extraSkillContext: `${raw.category || ''} ${(raw.tags || []).join(' ')}`,
        description: raw.description || '',
        isInternational: true,
      });
      if (jobRecord) jobs.push(jobRecord);
    }
  });

  // 5C. Jobicy API (Agora com filtro obrigatório isRelevantCareerTitle + checkBrazilEligibility)
  const jobicyUrls = [
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=business',
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=data-science',
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=management',
    'https://jobicy.com/api/v2/remote-jobs?count=50&industry=marketing',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=operations',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=analytics',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=crm',
    'https://jobicy.com/api/v2/remote-jobs?count=50&tag=onboarding',
    'https://jobicy.com/api/v2/remote-jobs?count=50&geo=latam',
    'https://jobicy.com/api/v2/remote-jobs?count=50&geo=brazil',
  ];

  await mapConcurrent(jobicyUrls, 5, async jUrl => {
    const res = await fetchWithTimeout(jUrl, {}, 8000);
    if (!res.ok) return;
    const data = await res.json();

    for (const raw of data.jobs || []) {
      const title = cleanJobTitle(raw.jobTitle || raw.title || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const geo = (raw.jobGeo || 'Worldwide').trim();
      const jobRecord = finalizeJobRecord({
        id: `jobicy_${raw.id}`,
        title,
        company: raw.companyName || 'Global Remote',
        companyLogo: raw.companyLogo,
        platform: 'remotive_intl',
        canonicalUrl: raw.url,
        publishedAt: new Date(raw.pubDate).toISOString(),
        workplaceType: 'remoto',
        location: `🌎 Remoto Internacional (${geo})`,
        rawJobType: Array.isArray(raw.jobType) ? raw.jobType.join(' ') : raw.jobType || '',
        salary: raw.annualSalaryMin ? `USD ${raw.annualSalaryMin} - ${raw.annualSalaryMax}/ano` : undefined,
        description: raw.jobDescription || raw.jobExcerpt || '',
        isInternational: true,
      });
      if (jobRecord) jobs.push(jobRecord);
    }
  });

  // 5D. Himalayas Global Remote API
  await mapConcurrent([0, 100], 2, async offset => {
    const res = await fetchWithTimeout(`https://himalayas.app/jobs/api?limit=100&offset=${offset}`, {}, 8500);
    if (!res.ok) return;
    const data = await res.json();

    for (const raw of data.jobs || []) {
      const title = cleanJobTitle(raw.title || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const locRestr = (raw.locationRestrictions || []).join(', ') || 'Worldwide';
      const pubIso = raw.pubDate ? new Date(raw.pubDate * 1000).toISOString() : new Date().toISOString();

      const jobRecord = finalizeJobRecord({
        id: `himalayas_${makeUniqueId('hm', raw.applicationLink || raw.guid || title, title, raw.companyName || '')}`,
        title,
        company: raw.companyName || 'Global Remote',
        companyLogo: raw.companyLogo,
        platform: 'remotive_intl',
        canonicalUrl: raw.applicationLink || raw.guid,
        publishedAt: pubIso,
        workplaceType: 'remoto',
        location: `🌎 Remoto Internacional (${locRestr})`,
        rawJobType: raw.employmentType || '',
        extraSkillContext: (raw.categories || []).join(' '),
        description: raw.description || raw.excerpt || '',
        isInternational: true,
      });
      if (jobRecord) jobs.push(jobRecord);
    }
  });

  // 5E. Working Nomads API
  try {
    const res = await fetchWithTimeout('https://www.workingnomads.com/api/exposed_jobs/', {}, 8500);
    if (res.ok) {
      const list = await res.json();
      for (const raw of list || []) {
        const title = cleanJobTitle(raw.title || '');
        if (!title || !isRelevantCareerTitle(title)) continue;

        const loc = (raw.location || 'Anywhere in the World').trim();
        const jobRecord = finalizeJobRecord({
          id: makeUniqueId('wn', raw.url || title, title, raw.company_name || ''),
          title,
          company: raw.company_name || 'Global Remote',
          platform: 'remotive_intl',
          canonicalUrl: raw.url,
          publishedAt: raw.pub_date ? new Date(raw.pub_date).toISOString() : new Date().toISOString(),
          workplaceType: 'remoto',
          location: `🌎 Remoto Internacional (${loc})`,
          extraSkillContext: `${raw.category_name || ''} ${raw.tags || ''}`,
          description: raw.description || '',
          isInternational: true,
        });
        if (jobRecord) jobs.push(jobRecord);
      }
    }
  } catch {}

  // 5F. WeWorkRemotely RSS Feeds
  const wwrFeeds = [
    'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss',
    'https://weworkremotely.com/categories/remote-product-jobs.rss',
    'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss',
    'https://weworkremotely.com/categories/all-other-remote-jobs.rss',
  ];

  await mapConcurrent(wwrFeeds, 4, async feedUrl => {
    const res = await fetchWithTimeout(feedUrl, {}, 8000);
    if (!res.ok) return;
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

    for (const itemXml of items) {
      const rawTitle = stripHtml(itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
      const pubDateStr = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
      const region = stripHtml(itemXml.match(/<region>([\s\S]*?)<\/region>/)?.[1] || 'Anywhere in the World');
      const rawDesc = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';

      if (!rawTitle || !link) continue;
      const parts = rawTitle.split(':');
      const company = parts.length > 1 ? parts[0].trim() : 'Global Remote';
      const title = cleanJobTitle(parts.length > 1 ? parts.slice(1).join(':') : rawTitle);

      if (!isRelevantCareerTitle(title)) continue;
      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
      const pubIso = isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString();

      const jobRecord = finalizeJobRecord({
        id: makeUniqueId('wwr', link, title, company),
        title,
        company,
        platform: 'remotive_intl',
        canonicalUrl: link,
        publishedAt: pubIso,
        workplaceType: 'remoto',
        location: `🌎 Remoto Internacional (${region})`,
        description: rawDesc,
        isInternational: true,
      });
      if (jobRecord) jobs.push(jobRecord);
    }
  });

  // 5G. Global Remote-First Companies via Greenhouse API (Sem bypass cego de país!)
  await mapConcurrent(GLOBAL_REMOTE_GREENHOUSE_BOARDS, 6, async board => {
    const res = await fetchWithTimeout(
      `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`,
      {},
      8500
    );
    if (!res.ok) return;
    const data = await res.json();

    for (const raw of data.jobs || []) {
      const title = cleanJobTitle(raw.title || '');
      if (!title || !isRelevantCareerTitle(title)) continue;

      const loc = (raw.location?.name || '').trim();
      const normLoc = normalizeGeoText(loc);

      // Se for uma vaga explicitamente do escritório/remoto Brasil dentro do board global, classifica como nacional!
      if (/\b(brazil|brasil|sao\s+paulo)\b/i.test(normLoc) && !/\b(argentina|mexico|colombia|usa)\b/i.test(normLoc)) {
        const brJob = finalizeJobRecord({
          id: `gh_br_${board.slug}_${raw.id}`,
          title,
          company: board.name,
          platform: 'greenhouse',
          canonicalUrl: raw.absolute_url,
          publishedAt: raw.updated_at,
          workplaceType: /\b(remote|remoto)\b/i.test(normLoc)
            ? 'remoto'
            : /\b(hybrid|hibrido)\b/i.test(normLoc)
            ? 'hibrido'
            : 'presencial',
          location: loc,
          description: raw.content || '',
          isInternational: false,
        });
        if (brJob) jobs.push(brJob);
        continue;
      }

      const isExplicitRemoteOrLatam = /\b(remote|latam|latin\s+america|south\s+america|americas|worldwide|anywhere|global)\b/i.test(
        normLoc
      );
      if (!isExplicitRemoteOrLatam) continue;

      const jobRecord = finalizeJobRecord({
        id: `gh_intl_${board.slug}_${raw.id}`,
        title,
        company: board.name,
        platform: 'remotive_intl',
        canonicalUrl: raw.absolute_url,
        publishedAt: raw.updated_at,
        workplaceType: 'remoto',
        location: `🌎 Remoto Internacional (${loc || 'Global Remote'})`,
        description: raw.content || '',
        isInternational: true,
      });
      if (jobRecord) jobs.push(jobRecord);
    }
  });

  console.log(`   ✅ Internacionais Elegíveis para o Brasil: ${jobs.length} vagas filtradas.`);
  return jobs;
}

// ============================================================================
// DEDUPLICAÇÃO INTELIGENTE POR RIQUEZA DE CONTEÚDO E PERSISTÊNCIA
// ============================================================================

function scoreRichness(job) {
  let score = (job.description || '').length;
  if (job.platform !== 'empregostec') score += 400;
  if (job.city) score += 150;
  if (job.expiresAt) score += 100;
  return score;
}

function deduplicateFinalJobs(candidates) {
  const byKey = new Map();
  const keyAliases = new Map();

  for (const job of candidates) {
    if (!job || !job.canonicalUrl || !job.title) continue;
    const cleanUrl = job.canonicalUrl.split('?')[0].replace(/\/+$/, '').toLowerCase();
    const gupyId = extractGupyJobId(cleanUrl);
    const urlKey = gupyId ? `gupy_id:${gupyId}` : `url:${cleanUrl}`;
    const semanticKey = `sem:${normalizeGeoText(job.company)}|${normalizeGeoText(job.title)}|${job.workplaceType}|${normalizeGeoText(
      job.city || job.location || ''
    )}`;

    const existingPrimaryKey = keyAliases.get(urlKey) || keyAliases.get(semanticKey);
    if (!existingPrimaryKey) {
      byKey.set(urlKey, job);
      keyAliases.set(urlKey, urlKey);
      keyAliases.set(semanticKey, urlKey);
    } else {
      const currentBest = byKey.get(existingPrimaryKey);
      if (currentBest && scoreRichness(job) > scoreRichness(currentBest)) {
        byKey.set(existingPrimaryKey, job);
      }
      keyAliases.set(urlKey, existingPrimaryKey);
      keyAliases.set(semanticKey, existingPrimaryKey);
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.daysOpen - b.daysOpen);
}

async function main() {
  console.log('======================================================================');
  console.log('📡 RADAR DE VAGAS v2 - MOTOR MULTI-ATS COM HIDRATAÇÃO E VALIDAÇÃO BR');
  console.log('🎯 Foco: BizOps, Processos, Inteligência Comercial, CRM, Onboarding, BI & IA');
  console.log('======================================================================\n');

  const [gupyJobs, inhireJobs, ashbyJobs, brGreenhouseLeverJobs, intlJobs] = await Promise.all([
    scrapeGupyAndAggregators(),
    scrapeInHireDirect(),
    scrapeAshbyBoards(),
    scrapeBrazilGreenhouseAndLever(),
    scrapeInternationalRemote(),
  ]);

  const allCandidates = [
    ...gupyJobs,
    ...inhireJobs,
    ...ashbyJobs,
    ...brGreenhouseLeverJobs,
    ...intlJobs,
  ];

  const deduplicated = deduplicateFinalJobs(allCandidates);

  if (deduplicated.length < 50) {
    console.error(
      `⚠️ ATENÇÃO: Apenas ${deduplicated.length} vagas coletadas. Possível falha temporária de rede. Abortando gravação para preservar a base anterior.`
    );
    process.exit(1);
  }

  const outDir = path.resolve('src/data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'liveJobs.json'), JSON.stringify(deduplicated, null, 2), 'utf-8');

  const byPlatform = {};
  const byWorkplace = {};
  const bySeniority = {};
  const byGeoTier = {};
  let spanishCount = 0;
  let onsiteWarnCount = 0;

  for (const j of deduplicated) {
    byPlatform[j.platform] = (byPlatform[j.platform] || 0) + 1;
    byWorkplace[j.workplaceType] = (byWorkplace[j.workplaceType] || 0) + 1;
    bySeniority[j.seniority] = (bySeniority[j.seniority] || 0) + 1;
    byGeoTier[j.geoEligibility || 'unknown'] = (byGeoTier[j.geoEligibility || 'unknown'] || 0) + 1;
    if (j.requiresSpanish) spanishCount++;
    if (j.hasHiddenOnsiteWarning) onsiteWarnCount++;
  }

  console.log('\n======================================================================');
  console.log('🎉 VARREDURA E AUDITORIA DE VAGAS CONCLUÍDA COM SUCESSO!');
  console.log(`Total de vagas únicas abertas e elegíveis: ${deduplicated.length}`);
  console.log('Por Plataforma:', byPlatform);
  console.log('Por Modalidade:', byWorkplace);
  console.log('Por Senioridade:', bySeniority);
  console.log('Por Elegibilidade Geográfica:', byGeoTier);
  console.log(`Alertas mapeados: ${spanishCount} Espanhol obrigatório | ${onsiteWarnCount} Presencial/Viagem no texto`);
  console.log(`Vagas Nacionais (Brasil): ${deduplicated.filter(j => !j.isInternational).length}`);
  console.log(`Vagas Internacionais Elegíveis: ${deduplicated.filter(j => j.isInternational).length}`);
  console.log('Salvo em: src/data/liveJobs.json');
  console.log('======================================================================\n');
}

main();
