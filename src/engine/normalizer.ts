import { NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

export const MUZAMBINHO_COORDS = {
  lat: -21.3708,
  lng: -46.5269,
  city: 'Muzambinho',
  state: 'MG',
  maxRadiusKm: 150,
};

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
  'limeira': 168,
  'campinas': 195,
  'jundiaí': 230,
  'jundiai': 230,
  'são paulo': 285,
  'sao paulo': 285,
  'santos': 340,
  'belo horizonte': 380,
  'rio de janeiro': 450,
  'curitiba': 540,
  'porto alegre': 950,
};

export const POPULAR_FILTER_STACKS = [
  'Implantação', 'Suporte N2', 'SQL', 'Power BI', 'CRM', 'HubSpot',
  'Sales Ops', 'RevOps', 'N8N', 'APIs / Webhooks', 'IA / LLMs',
  'BPMN / Processos', 'Excel / Sheets', 'Jira', 'Python', 'React',
  'Node.js', 'TypeScript', 'Java', 'C# / .NET', 'PHP', 'QA / Testes', 'AWS', 'Docker'
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Lista negra de senioridade executiva/alta no título (usada quando o filtro "Foco Entrada/Júnior/Pleno" está ativo)
 */
export function isExecutiveOrSeniorTitle(title: string): boolean {
  return /\b(staff|principal|director|diretor|diretora|head|lead|líder|lider|senior|sênior|sr\.?|especialista|specialist|manager|gerente|coordenador|coordenadora|coordinator|vp|chief|architect|arquiteto|iii)\b/i.test(title);
}

/**
 * Classifica a vaga nas áreas de atuação do mercado
 */
export function classifyJobCategories(title: string, description: string = ''): NicheCategory[] {
  const t = title.toLowerCase();
  const combined = `${title} ${description}`.toLowerCase();
  const categories: NicheCategory[] = [];

  if (/\b(implanta[çc][ãa]o|onboarding|implementation|ativac[ãa]o|customer success|setup)\b/i.test(combined)) {
    categories.push('implantacao');
  }
  if (/\b(suporte|support|service desk|help desk|n1|n2|n3|sustenta[çc][ãa]o|atendimento t[ée]cnico)\b/i.test(combined)) {
    categories.push('suporte');
  }
  if (/\b(dados|data|bi\b|business intelligence|power bi|looker|metabase|analytics|sql|etl)\b/i.test(combined)) {
    categories.push('dados_bi');
  }
  if (/\b(revops|revenue operations|sales ops|sales operations|crm|hubspot|salesforce|pipedrive|rd station|opera[çc][õo]es comerciais)\b/i.test(combined)) {
    categories.push('crm_revops');
  }
  if (/\b(n8n|zapier|make\.com|automa[çc][ãa]o|automation|rpa|ai ops|aiops|agentes de ia|ai agents|processos|bpm|bpmn|prompt)\b/i.test(combined)) {
    categories.push('automacao_ia');
  }
  if (/\b(product owner|\bpo\b|product manager|\bpm\b|analista de produto|analista de requisitos|analista de neg[óo]cios|business analyst|discovery)\b/i.test(combined)) {
    categories.push('produto');
  }
  if (/\b(desenvolvedor|developer|software engineer|engenheiro de software|frontend|front-end|backend|back-end|full stack|fullstack|mobile|react|node|java|python|php|dotnet|\.net|golang)\b/i.test(t)) {
    categories.push('desenvolvimento');
  }
  if (/\b(qa|quality assurance|testes|tester|devops|sre|cloud|infraestrutura|seguran[çc]a|cybersecurity|redes)\b/i.test(t)) {
    categories.push('qa_infra');
  }

  if (categories.length === 0) categories.push('geral');
  return categories;
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
    { regex: /\bvaga\s+afirmativa\b|\bprograma\s+afirmativo\b|\bbanco\s+afirmativo\b/i, reason: 'Programa Afirmativo' }
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
  const locLower = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [cityKey, distance] of Object.entries(DISTANCES_TO_MUZAMBINHO)) {
    const cleanKey = cityKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (locLower.includes(cleanKey)) {
      return distance;
    }
  }

  if (locLower.includes('sao paulo') || locLower.includes('capital')) {
    return 285;
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
    if (/\b(sênior|senior|sr\.?|iii)\b/i.test(t) && !/\b(staff|principal|director|diretor|head|lead|líder|especialista|manager|gerente|coordenador)\b/i.test(t)) {
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
  const combined = `${title} ${location} ${workplaceRaw}`.toLowerCase();
  if (combined.includes('híbrido') || combined.includes('hibrido') || combined.includes('hybrid')) return 'hibrido';
  if (combined.includes('remoto') || combined.includes('remote') || combined.includes('home office') || combined.includes('teletrabalho')) return 'remoto';
  if (combined.includes('presencial') || combined.includes('on-site') || combined.includes('onsite')) return 'presencial';
  return 'remoto';
}
