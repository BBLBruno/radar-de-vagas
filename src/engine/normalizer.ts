import { NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

export const MUZAMBINHO_COORDS = {
  lat: -21.3708,
  lng: -46.5269,
  city: 'Muzambinho',
  state: 'MG',
  maxRadiusKm: 150,
};

// Distância geográfica em raio (km) a partir de Muzambinho-MG
const DISTANCES_TO_MUZAMBINHO: Record<string, number> = {
  'muzambinho': 0,
  'guaxupé': 18,
  'guaxupe': 18,
  'monte belo': 25,
  'juruaia': 30,
  'cabo verde': 32,
  'caconde': 35,
  'mococa': 45,
  'nova resende': 46,
  'são sebastião do paraíso': 52,
  'sao sebastiao do paraiso': 52,
  'poços de caldas': 55,
  'pocos de caldas': 55,
  'são josé do rio pardo': 60,
  'sao jose do rio pardo': 60,
  'alfenas': 65,
  'casa branca': 75,
  'passos': 85,
  'são joão da boa vista': 85,
  'sao joao da boa vista': 85,
  'espírito santo do pinhal': 92,
  'espirito santo do pinhal': 92,
  'machado': 78,
  'paraguaçu': 82,
  'paraguacu': 82,
  'mogi guaçu': 108,
  'mogi guacu': 108,
  'mogi mirim': 112,
  'itapira': 110,
  'varginha': 115,
  'pirassununga': 115,
  'pouso alegre': 120,
  'santa rita do sapucaí': 125,
  'santa rita do sapucai': 125,
  'itajubá': 148,
  'itajuba': 148,
  'três corações': 132,
  'tres coracoes': 132,
  'três pontas': 105,
  'tres pontas': 105,
  'lavras': 145,
  'franca': 128,
  'leme': 130,
  'ribeirão preto': 135,
  'ribeirao preto': 135,
  'araras': 140,
  'rio claro': 145,
  'são carlos': 148,
  'sao carlos': 148,
  'limeira': 148,
  'paulínia': 149,
  'paulinia': 149,
  'campinas': 150,
  'vinhedo': 165,
  'jundiaí': 210,
  'jundiai': 210,
  'são paulo': 260,
  'sao paulo': 260,
  'santos': 320,
  'belo horizonte': 360,
  'rio de janeiro': 430,
  'curitiba': 520,
  'porto alegre': 940,
};

// Chips de Habilidades de Negócios, Operações, Inteligência, Dados, CRM e Automação (Sem TI/Dev/Suporte)
export const POPULAR_FILTER_STACKS = [
  'Inteligência de Mercado',
  'Inteligência Comercial',
  'Operações / BizOps',
  'Processos / BPMN',
  'Onboarding / CS',
  'Análise de Dados',
  'Indicadores / KPIs',
  'CRM',
  'HubSpot',
  'Salesforce',
  'Sales Ops',
  'RevOps',
  'Power BI',
  'SQL',
  'N8N',
  'Automação / IA',
  'Excel / Sheets',
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

/**
 * BLACKLIST ESTRITA DE TÍTULOS:
 * Descarta qualquer vaga cujo título contenha Suporte Técnico, Técnico de Suporte, Tecnico Suporte,
 * Help Desk, Service Desk, Suporte N1, Suporte N2, Infraestrutura, Desenvolvedor, Developer,
 * Front-end, Back-end, Fullstack, DevOps.
 */
export function isBlacklistedTitle(title: string): boolean {
  if (!title) return true;
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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
    /\bprogramador(a)?\b/i,
  ];

  return blacklistPatterns.some(regex => regex.test(normalized) || regex.test(title));
}

/**
 * Lista negra de senioridade executiva/alta no título
 */
export function isExecutiveOrSeniorTitle(title: string): boolean {
  return /\b(staff|principal|director|diretor|diretora|head|lead|líder|lider|senior|sênior|sr\.?|especialista|specialist|manager|gerente|coordenador|coordenadora|coordinator|supervisor|supervisora|vp|chief|architect|arquiteto|iii)\b/i.test(
    title
  );
}

/**
 * Classifica a vaga nas 5 áreas de atuação de Negócios, Operações, Inteligência, CRM/Onboarding, Dados/BI e Automação
 */
export function classifyJobCategories(title: string, description: string = ''): NicheCategory[] {
  const combined = `${title} ${description}`.toLowerCase();
  const categories: NicheCategory[] = [];

  if (
    /\b(opera[çc][õo]es|operations|bizops|business\s+operations|processos|process|bpm|bpmn|melhoria\s+cont[íi]nua|analista\s+de\s+neg[óo]cios|business\s+analyst|requisitos|product\s+operations|produto|product\s+owner|planejamento)\b/i.test(
      combined
    )
  ) {
    categories.push('bizops_processos');
  }
  if (
    /\b(intelig[êe]ncia\s+de\s+mercado|market\s+intelligence|intelig[êe]ncia\s+comercial|sales\s+intelligence|competitive\s+intelligence|go-to-market|gtm|pesquisa\s+de\s+mercado|pricing|planejamento\s+comercial|estrategia\s+comercial)\b/i.test(
      combined
    )
  ) {
    categories.push('inteligencia_mercado');
  }
  if (
    /\b(crm|revops|revenue\s+operations|sales\s+ops|sales\s+operations|opera[çc][õo]es\s+comerciais|hubspot|salesforce|pipedrive|rd\s+station|implanta[çc][ãa]o|onboarding|implementation|customer\s+success|sucesso\s+do\s+cliente|cs\s+ops|ativac[ãa]o)\b/i.test(
      combined
    )
  ) {
    categories.push('crm_revops_onboarding');
  }
  if (
    /\b(dados|data|bi\b|business\s+intelligence|power\s+bi|looker|metabase|tableau|analytics|sql|etl|indicadores|kpis?|dashboard)\b/i.test(
      combined
    )
  ) {
    categories.push('dados_bi');
  }
  if (
    /\b(n8n|zapier|make\.com|integromat|automa[çc][ãa]o|automation|rpa|ai\s+ops|aiops|agentes\s+de\s+ia|ai\s+agents|llm|openai|prompt|webhooks)\b/i.test(
      combined
    )
  ) {
    categories.push('automacao_ia');
  }

  if (categories.length === 0) {
    categories.push('bizops_processos');
  }
  return categories;
}

/**
 * Identifica se a vaga é afirmativa (PCD, gênero, raça/etnia, 50+, etc.)
 */
export function detectAffirmative(
  title: string,
  description: string = ''
): { isAffirmative: boolean; reason?: string } {
  const combined = `${title} ${description}`.toLowerCase();

  const patterns = [
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(pcd|pcds|defici[êe]ncia)\b/i, reason: 'Afirmativa PcD' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(mulher|mulheres|feminina)\b/i, reason: 'Afirmativa Mulheres' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(negr[ao]s?|pret[ao]s?|pard[ao]s?)\b/i, reason: 'Afirmativa Pessoas Negras/Pretas' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(lgbt|lgbtqia\+|trans|transg[êe]nero)\b/i, reason: 'Afirmativa LGBTQIA+' },
    { regex: /\b(afirmativ[ao]s?|exclusiv[ao]s?)\b.*?\b(50\+|60\+|s[êe]nioridade et[áa]ria)\b/i, reason: 'Afirmativa 50+' },
    { regex: /\bvaga\s+afirmativa\b|\bprograma\s+afirmativo\b|\bbanco\s+afirmativo\b/i, reason: 'Programa Afirmativo' },
  ];

  for (const p of patterns) {
    if (p.regex.test(combined)) {
      return { isAffirmative: true, reason: p.reason };
    }
  }

  return { isAffirmative: false };
}

export function calculateDistanceToMuzambinho(location: string): number | null {
  if (!location) return null;
  const locLower = location
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [cityKey, distance] of Object.entries(DISTANCES_TO_MUZAMBINHO)) {
    const cleanKey = cityKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (locLower.includes(cleanKey)) {
      return distance;
    }
  }

  if (locLower.includes('sao paulo') || locLower.includes('capital')) {
    return 260;
  }

  return null;
}

export function calculateDaysOpen(publishedAtIso: string): number {
  const publishedDate = new Date(publishedAtIso);
  if (isNaN(publishedDate.getTime())) return 1;
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - publishedDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function detectSeniority(title: string, description: string = ''): SeniorityLevel {
  const t = title.toLowerCase();
  const text = `${title} ${description}`.toLowerCase();

  if (isExecutiveOrSeniorTitle(title)) {
    if (
      /\b(sênior|senior|sr\.?|iii)\b/i.test(t) &&
      !/\b(staff|principal|director|diretor|head|lead|líder|especialista|manager|gerente|coordenador)\b/i.test(t)
    ) {
      return 'senior';
    }
    return 'especialista';
  }
  if (/\b(estágio|estagio|estagiário|estagiario|intern|trainee)\b/i.test(t)) return 'estagio';
  if (/\b(júnior|junior|jr\.?|assistente|auxiliar|entry|associate|nível 1|n1)\b/i.test(t)) return 'junior';
  if (/\b(pleno|pl\.?|mid|ii|nível 2|n2)\b/i.test(t)) return 'pleno';

  if (text.includes('júnior') || text.includes('junior')) return 'junior';
  if (text.includes('sênior') || text.includes('senior')) return 'senior';
  return 'pleno';
}

export function detectWorkplaceType(title: string, location: string = '', workplaceRaw: string = ''): WorkplaceType {
  const locTrim = (location || '').trim().toLowerCase();
  const combined = `${title} ${location} ${workplaceRaw}`.toLowerCase();
  if (combined.includes('híbrido') || combined.includes('hibrido') || combined.includes('hybrid')) return 'hibrido';
  if (
    combined.includes('remoto') ||
    combined.includes('remote') ||
    combined.includes('home office') ||
    combined.includes('teletrabalho') ||
    locTrim === 'brasil' ||
    locTrim === 'brazil'
  ) {
    return 'remoto';
  }
  if (combined.includes('presencial') || combined.includes('on-site') || combined.includes('onsite')) return 'presencial';
  return 'remoto';
}
