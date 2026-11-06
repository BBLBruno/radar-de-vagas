import { CandidateProfile } from '../types';

export const DEFAULT_PROFILE: CandidateProfile = {
  fullName: 'Bruno',
  email: 'bruno@example.com',
  phone: '(35) 99876-5432',
  linkedinUrl: 'https://linkedin.com/in/bruno-automacoes',
  githubUrl: 'https://github.com/BBLBruno',
  portfolioUrl: 'https://radar-concursos-ti.vercel.app',
  city: 'Muzambinho',
  state: 'MG',
  title: 'Analista de Operações (BizOps), Processos, Inteligência Comercial, Dados & Automação (N8N)',
  summary:
    'Bacharel em Ciência da Computação e ex-cofundador de operação de e-commerce que faturou R$ 2.5M. Forte vivência prática em Operações de Negócios (BizOps), mapeamento e otimização de processos, Inteligência de Mercado/Comercial, estruturação de CRM/RevOps, Onboarding, análise de dados (SQL/Power BI/KPIs) e automação de fluxos via N8N e IA (case de redução de 60% na demanda operacional do SAC).',
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
  salaryExpectationClt: 'A combinar',
  salaryExpectationPj: 'A combinar',
  background: {
    education: 'Bacharel em Ciência da Computação',
    entrepreneurship: 'Ex-cofundador de e-commerce de R$ 2.5M',
    keyMetricCase: 'Case comprovado de redução de 60% no volume de SAC via N8N e IA',
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
    availability: 'Disponibilidade imediata para atuação remota, híbrida ou presencial.',
    englishLevel: 'Intermediário/Avançado para leitura técnica, ferramentas globais e comunicação assíncrona.',
    pcd: 'nao',
    willingToRelocate: true,
    leadershipExperience:
      'Experiência como cofundador estruturando operações comerciais, indicadores (KPIs), implantação de ferramentas de CRM e automação de processos de ponta a ponta.',
    customBio:
      'Profissional com formação analítica em Ciência da Computação e vivência real de dono de negócio, focado em alavancar eficiência operacional, receita e inteligência de dados.',
  },
};

const PROFILE_STORAGE_KEY = 'radar_vagas_candidate_profile_v4';

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
