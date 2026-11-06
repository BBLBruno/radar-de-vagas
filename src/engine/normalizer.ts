import { NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

export const MUZAMBINHO_COORDS = {
  lat: -21.3708,
  lng: -46.5269,
  city: 'Muzambinho',
  state: 'MG',
  maxRadiusKm: 150,
};

// Dicionário de distâncias aproximadas de cidades para Muzambinho (em KM)
const DISTANCES_TO_MUZAMBINHO: Record<string, number> = {
  'muzambinho': 0,
  'guaxupé': 18,
  'guaxupe': 18,
  'monte belo': 25,
  'juruaia': 30,
  'cabo verde': 32,
  'mococa': 45,
  'nova resende': 46,
  'poços de caldas': 55,
  'pocos de caldas': 55,
  'são josé do rio pardo': 60,
  'sao jose do rio pardo': 60,
  'alfenas': 65,
  'casa branca': 75,
  'passos': 85,
  'são joão da boa vista': 85,
  'sao joao da boa vista': 85,
  'varginha': 115,
  'pouso alegre': 120,
  'ribeirão preto': 135,
  'ribeirao preto': 135,
  'araras': 140,
  'leme': 130,
  'pirassununga': 115,
  'rio claro': 150,
  // Cidades fora do raio de 150km:
  'limeira': 168,
  'campinas': 195,
  'jundiaí': 230,
  'jundiai': 230,
  'são paulo': 285,
  'sao paulo': 285,
  'sp': 285, // Default capital
  'santos': 340,
  'belo horizonte': 380,
  'rio de janeiro': 450,
  'curitiba': 540,
};

// Stacks especializadas no nicho: AI Ops, RevOps, Automação & Produto
export const NICHE_TECH_STACKS = [
  'N8N', 'Make', 'Zapier', 'OpenAI API', 'Claude API', 'LangChain', 'AI Agents',
  'HubSpot', 'Salesforce', 'Pipedrive', 'RD Station', 'ActiveCampaign',
  'CRM', 'Webhooks', 'REST APIs', 'Postman', 'Typeform', 'WhatsApp API',
  'Jira', 'Confluence', 'Figma', 'Miro', 'Notion', 'Product Discovery',
  'SQL', 'PostgreSQL', 'Python', 'Node.js', 'TypeScript', 'Metabase',
  'Mixpanel', 'Google Analytics', 'Amplitude', 'BPMN', 'RPA', 'Prompt Engineering'
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Filtro Rigoroso de Nicho:
 * Reter apenas se contiver: N8N, Automação, AI Ops, RevOps, Sales Ops, CRM,
 * Product Owner, Analista de Requisitos ou Analista de Produto.
 * Descarta desenvolvedores puros (backend puro, frontend puro).
 */
export function isNicheJob(title: string, description: string = ''): { isMatch: boolean; categories: NicheCategory[] } {
  const combined = `${title} ${description}`.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Descarte explícito de desenvolvedores puros (a menos que a vaga seja explicitamente de Automação/AI Ops)
  const isPureDevTitle = 
    (titleLower.includes('desenvolvedor backend') || 
     titleLower.includes('backend developer') ||
     titleLower.includes('desenvolvedor front-end') ||
     titleLower.includes('frontend developer') ||
     titleLower.includes('dev backend') ||
     titleLower.includes('dev frontend') ||
     titleLower.includes('desenvolvedor react') ||
     titleLower.includes('desenvolvedor angular') ||
     titleLower.includes('desenvolvedor flutter') ||
     titleLower.includes('desenvolvedor ios') ||
     titleLower.includes('desenvolvedor android') ||
     titleLower.includes('desenvolvedor java') ||
     titleLower.includes('desenvolvedor golang') ||
     titleLower.includes('desenvolvedor php') ||
     titleLower.includes('desenvolvedor c#') ||
     titleLower.includes('desenvolvedor .net'));

  const hasExplicitAutomationFocus = 
    combined.includes('n8n') || 
    combined.includes('ai ops') || 
    combined.includes('aiops') || 
    combined.includes('revops') || 
    combined.includes('automação de processos') ||
    combined.includes('automacao de processos');

  if (isPureDevTitle && !hasExplicitAutomationFocus) {
    return { isMatch: false, categories: [] };
  }

  // 2. Termos obrigatórios do nicho
  const categories: NicheCategory[] = [];

  const aiOpsTerms = ['ai ops', 'aiops', 'ia ops', 'ai operations', 'inteligência artificial aplicada', 'prompt engineering', 'ai agents', 'agentes de ia'];
  const revOpsTerms = ['revops', 'revenue operations', 'sales ops', 'sales operations', 'marketing ops', 'crm', 'hubspot', 'salesforce', 'operações de vendas'];
  const automacaoTerms = ['n8n', 'make.com', 'zapier', 'automação', 'automacao', 'automation', 'rpa', 'automatização', 'process automation', 'bpm', 'bpmn'];
  const produtoTerms = ['product owner', ' po ', 'analista de produto', 'analista de requisitos', 'product manager', ' pm ', 'gestão de produto', 'gestor de produto'];

  if (aiOpsTerms.some(term => combined.includes(term))) categories.push('ai_ops');
  if (revOpsTerms.some(term => combined.includes(term))) categories.push('revops');
  if (automacaoTerms.some(term => combined.includes(term))) categories.push('automacao');
  if (produtoTerms.some(term => combined.includes(term))) categories.push('produto');

  const isMatch = categories.length > 0;
  return { isMatch, categories };
}

/**
 * Identifica se a vaga é afirmativa (PCD, gênero, raça/etnia, 50+, etc.)
 */
export function detectAffirmative(title: string, description: string = ''): { isAffirmative: boolean; reason?: string } {
  const combined = `${title} ${description}`.toLowerCase();

  const patterns = [
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(pcd|pcds|defici[êe]ncia)\b/i, reason: 'Afirmativa PcD' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(mulher|mulheres|feminina)\b/i, reason: 'Afirmativa Mulheres' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(negr[ao]s?|pret[ao]s?|pard[ao]s?)\b/i, reason: 'Afirmativa Pessoas Negras/Pretas' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(lgbt|lgbtqia\+|trans|transg[êe]nero)\b/i, reason: 'Afirmativa LGBTQIA+' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(50\+|60\+|s[êe]nioridade et[áa]ria)\b/i, reason: 'Afirmativa 50+' },
    { regex: /\bvaga\s+afirmativa\b|\bprograma\s+afirmativo\b|\bbanco\s+afirmativo\b/i, reason: 'Programa Afirmativo Geral' }
  ];

  for (const p of patterns) {
    if (p.regex.test(combined)) {
      return { isAffirmative: true, reason: p.reason };
    }
  }

  return { isAffirmative: false };
}

/**
 * Calcula a distância até Muzambinho - MG e valida raio geográfico
 */
export function calculateDistanceToMuzambinho(location: string): number | null {
  if (!location) return null;
  const locLower = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [cityKey, distance] of Object.entries(DISTANCES_TO_MUZAMBINHO)) {
    const cleanKey = cityKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (locLower.includes(cleanKey)) {
      return distance;
    }
  }

  // Se for explicitamente São Paulo capital / Rio / BH / Curitiba
  if (locLower.includes('sao paulo') || locLower.includes('capital') || locLower.includes('sp - brasil')) {
    return 285;
  }

  return null; // Localidade não mapeada diretamente
}

/**
 * Extrai frequência presencial em vagas híbridas (ex: "1x na semana", "2 dias", etc.)
 */
export function extractHybridFrequency(text: string): number {
  const t = text.toLowerCase();
  if (t.includes('1x') || t.includes('1 vez') || t.includes('1 dia') || t.includes('um dia')) return 1;
  if (t.includes('2x') || t.includes('2 vezes') || t.includes('2 dias') || t.includes('dois dias')) return 2;
  if (t.includes('3x') || t.includes('3 vezes') || t.includes('3 dias') || t.includes('três dias')) return 3;
  if (t.includes('4x') || t.includes('4 vezes') || t.includes('4 dias')) return 4;
  return 2; // Default seguro para híbrido
}

/**
 * Validação de Localidade / Modelo solicitada pelo usuário:
 * "Vagas somente remota ou híbrida (2 ou menos dias e num raio de 150km de Muzambinho)"
 */
export function validateWorkplaceAndRadius(
  workplaceType: WorkplaceType, 
  location: string, 
  title: string, 
  description: string = '', 
  maxRadiusKm: number = 150
): { isValid: boolean; distanceKm?: number; hybridDays?: number; rejectionReason?: string } {
  
  // 1. Presencial é descartado
  if (workplaceType === 'presencial') {
    return { isValid: false, rejectionReason: 'Vaga 100% presencial descartada' };
  }

  // 2. Remoto é sempre aceito
  if (workplaceType === 'remoto') {
    return { isValid: true, distanceKm: 0, hybridDays: 0 };
  }

  // 3. Híbrido: Deve ter <= 2 dias presenciais E estar dentro do raio de 150km de Muzambinho
  if (workplaceType === 'hibrido') {
    const hybridDays = extractHybridFrequency(`${title} ${description}`);
    if (hybridDays > 2) {
      return { isValid: false, hybridDays, rejectionReason: `Híbrido exige mais de 2 dias (${hybridDays} dias)` };
    }

    const distance = calculateDistanceToMuzambinho(location);
    if (distance !== null && distance > maxRadiusKm) {
      return { isValid: false, distanceKm: distance, hybridDays, rejectionReason: `Distância de ${distance}km excede o limite de ${maxRadiusKm}km de Muzambinho` };
    }

    return { isValid: true, distanceKm: distance ?? undefined, hybridDays };
  }

  return { isValid: false, rejectionReason: 'Modelo incompatível' };
}

export function calculateDaysOpen(publishedAtIso: string): number {
  const publishedDate = new Date(publishedAtIso);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isBrazilJob(location: string, workplaceType: WorkplaceType): boolean {
  if (!location) return workplaceType === 'remoto';
  const normalized = location.toLowerCase();

  const foreignExclusions = [
    'portugal', 'lisboa', 'porto', 'united states', 'usa', 'estados unidos', 
    'españa', 'spain', 'germany', 'uk', 'argentina', 'colombia', 'mexico'
  ];

  for (const foreign of foreignExclusions) {
    if (normalized.includes(foreign) && !normalized.includes('brasil') && !normalized.includes('brazil')) {
      return false;
    }
  }

  if (
    normalized.includes('brasil') ||
    normalized.includes('brazil') ||
    normalized.includes('remoto') ||
    normalized.includes('remote') ||
    normalized.includes('home office')
  ) {
    return true;
  }

  for (const uf of BRAZIL_STATES) {
    const regex = new RegExp(`\\b${uf}\\b`, 'i');
    if (regex.test(location)) return true;
  }

  return true;
}

export function detectSeniority(title: string, description: string = ''): SeniorityLevel {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('estágio') || text.includes('estagio') || text.includes('intern')) return 'estagio';
  if (text.includes('especialista') || text.includes('staff') || text.includes('principal') || text.includes('lead') || text.includes('coordenador') || text.includes('head')) return 'especialista';
  if (text.includes('sênior') || text.includes('senior') || text.includes('sr.') || text.includes('sr ')) return 'senior';
  if (text.includes('pleno') || text.includes('pl.') || text.includes('pl ') || text.includes('mid')) return 'pleno';
  if (text.includes('júnior') || text.includes('junior') || text.includes('jr.') || text.includes('jr ')) return 'junior';
  return 'pleno';
}

export function detectWorkplaceType(title: string, location: string = '', workplaceRaw: string = ''): WorkplaceType {
  const combined = `${title} ${location} ${workplaceRaw}`.toLowerCase();
  if (combined.includes('híbrido') || combined.includes('hibrido') || combined.includes('hybrid')) return 'hibrido';
  if (combined.includes('remoto') || combined.includes('remote') || combined.includes('home office') || combined.includes('teletrabalho')) return 'remoto';
  if (combined.includes('presencial') || combined.includes('on-site') || combined.includes('onsite')) return 'presencial';
  return 'remoto';
}

export function extractStacks(text: string): string[] {
  const found: string[] = [];
  const normalized = text.toLowerCase();

  for (const stack of NICHE_TECH_STACKS) {
    const stackLower = stack.toLowerCase();
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escapeRegExp(stackLower)}([^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(normalized)) {
      found.push(stack);
    }
  }

  return Array.from(new Set(found));
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
