import { CandidateProfile } from '../types';

export const DEFAULT_PROFILE: CandidateProfile = {
  fullName: 'Bruno',
  email: 'bruno@example.com',
  phone: '(35) 99876-5432',
  linkedinUrl: 'https://linkedin.com/in/bruno-automacoes',
  githubUrl: 'https://github.com/BBLBruno',
  portfolioUrl: 'https://radar-concursos-ti.vercel.app',
  resumeExternalUrl: '',
  resumePdfName: '',
  resumePdfDataUrl: '',
  city: 'Muzambinho',
  state: 'MG',
  title: 'Analista de Operações (BizOps), Processos, Inteligência Comercial & Dados',
  summary:
    'Bacharel em Ciência da Computação e ex-cofundador de operação digital que faturou R$ 2.5M. Atuo na interseção entre Operações de Negócios (BizOps), Inteligência Comercial, Dados/BI e Automação de Processos. Experiência prática no diagnóstico de gargalos operacionais (As-Is / To-Be), acompanhamento de KPIs (CAC, LTV, Conversão, SLA), estruturação de CRM/Onboarding e implementação de fluxos automatizados via N8N, SQL e IA (case real de redução de 60% na demanda operacional de atendimento).',
  seniority: 'pleno',
  primaryStacks: [
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
  ],
  yearsOfExperience: 3,
  preferredWorkplace: 'qualquer',
  salaryExpectationClt: 'R$ 5.500,00 - R$ 8.500,00 (A combinar)',
  salaryExpectationPj: 'R$ 7.000,00 - R$ 11.000,00 (A combinar)',
  background: {
    education:
      'Bacharel em Ciência da Computação — base analítica sólida em bancos de dados (SQL), lógica de sistemas, integração de APIs e modelagem de processos (BPMN).',
    entrepreneurship:
      'Ex-cofundador de operação de e-commerce (faturamento de R$ 2.5M) — visão executiva de dono sobre P&L, eficiência operacional, funil de vendas, retenção e margem.',
    keyMetricCase:
      'Case de Eficiência Operacional: Redução de 60% no volume de chamados manuais do SAC através do redesenho de processos, automações em N8N e triagem inteligente com IA.',
    operationalPillars:
      'Mapeamento e otimização de processos (Lean / BPMN), análise de dados e construção de dashboards (SQL, Power BI, Excel Avançado), gestão de funil em CRM (HubSpot / Salesforce) e implantação/onboarding técnico de clientes.',
    nicheFocus: [
      'Operações / BizOps',
      'Processos / BPMN',
      'Inteligência de Mercado',
      'Inteligência Comercial',
      'CRM, RevOps & Onboarding',
      'Dados & BI (SQL / Power BI)',
      'Automação & IA (N8N)',
    ],
  },
  preferences: {
    hideAffirmativeJobs: true,
    maxHybridDistanceKm: 150,
    maxHybridDaysPerWeek: 2,
    referenceCity: 'Muzambinho',
    referenceState: 'MG',
  },
  screeningAnswers: {
    availability: 'Disponibilidade imediata para início em modelo 100% remoto ou híbrido.',
    englishLevel: 'Intermediário a Avançado (leitura técnica fluente, ferramentas globais e comunicação escrita).',
    pcd: 'nao',
    willingToRelocate: true,
    leadershipExperience:
      'Vivência prática como cofundador liderando operações ponta a ponta, alinhamento entre áreas comercial, atendimento e tecnologia, e acompanhamento de metas e indicadores (KPIs/OKRs).',
    customBio:
      'Profissional analítico com formação em Ciência da Computação e mentalidade orientada a negócios, focado em transformar processos manuais em operações escaláveis e orientadas por dados.',
  },
  applicationTrackers: [
    {
      id: 'trk_gupy',
      name: 'Gupy — Painel do Candidato',
      platformLabel: 'GUPY',
      url: 'https://portal.gupy.io/candidates/applications',
      notes: 'Acompanhar andamento das inscrições e testes nas empresas da Gupy',
    },
    {
      id: 'trk_inhire',
      name: 'InHire — Minhas Candidaturas',
      platformLabel: 'INHIRE',
      url: 'https://app.inhire.com.br/',
      notes: 'Vagas de consultorias, startups e scale-ups brasileiras',
    },
    {
      id: 'trk_greenhouse',
      name: 'Greenhouse — My Applications',
      platformLabel: 'GREENHOUSE',
      url: 'https://my.greenhouse.io/',
      notes: 'Histórico de aplicações em empresas nacionais e globais no Greenhouse',
    },
    {
      id: 'trk_solides',
      name: 'Sólides Vagas — Área do Candidato',
      platformLabel: 'SÓLIDES',
      url: 'https://vagas.solides.com.br/',
      notes: 'Acompanhamento de processos seletivos via Sólides',
    },
    {
      id: 'trk_linkedin',
      name: 'LinkedIn — Vagas Aplicadas & Salvas',
      platformLabel: 'LINKEDIN',
      url: 'https://www.linkedin.com/my-items/saved-jobs/',
      notes: 'Controle externo de networking e recrutadores abordados',
    },
  ],
};

const PROFILE_STORAGE_KEY = 'radar_vagas_candidate_profile_v5';

export function loadStoredProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        background: { ...DEFAULT_PROFILE.background, ...parsed.background },
        preferences: { ...DEFAULT_PROFILE.preferences, ...parsed.preferences },
        applicationTrackers:
          parsed.applicationTrackers && parsed.applicationTrackers.length > 0
            ? parsed.applicationTrackers
            : DEFAULT_PROFILE.applicationTrackers,
      };
    }
  } catch (err) {
    console.error('Erro ao ler perfil do localStorage:', err);
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: CandidateProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Erro ao salvar perfil no localStorage:', err);
  }
}
