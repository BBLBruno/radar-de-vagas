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
  title: 'Analista de Sistemas, Automação (N8N/IA), Dados & Operações (RevOps/Implantação)',
  summary: 'Bacharel em Ciência da Computação e ex-cofundador de operação de e-commerce que faturou R$ 2.5M. Experiência prática na otimização de processos, automações via N8N e IA (case real de redução de 60% do SAC), integrações via API/Webhooks, SQL, BI e estruturação de operações de CRM, Suporte Técnico e Implantação.',
  seniority: 'pleno',
  primaryStacks: [
    'SQL', 'Python', 'Power BI', 'N8N', 'Automação', 'IA / AI',
    'CRM', 'HubSpot', 'Salesforce', 'API REST', 'Implantação',
    'Onboarding', 'Customer Success', 'Suporte Técnico', 'Scrum / Agile',
    'JavaScript', 'TypeScript', 'Node.js', 'Git'
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
      'Implantação', 'Onboarding', 'Suporte Técnico', 'Dados & BI', 'SQL',
      'CRM', 'RevOps', 'Sales Ops', 'N8N', 'Automação', 'Produto', 'Desenvolvimento'
    ]
  },
  preferences: {
    hideAffirmativeJobs: false,
    maxHybridDistanceKm: 150,
    maxHybridDaysPerWeek: 2,
    referenceCity: 'Muzambinho',
    referenceState: 'MG',
  },
  screeningAnswers: {
    availability: 'Disponibilidade imediata para atuação remota, híbrida ou presencial.',
    englishLevel: 'Intermediário/Avançado para leitura técnica, documentação e comunicação.',
    pcd: 'nao',
    willingToRelocate: true,
    leadershipExperience: 'Experiência como cofundador estruturando atendimento, implantação de ferramentas, análise de dados e automação de processos de ponta a ponta.',
    customBio: 'Profissional com base sólida em Ciência da Computação e vivência real de negócio, focado em resolver gargalos operacionais com tecnologia, dados, integrações e automação.',
  }
};

const PROFILE_STORAGE_KEY = 'radar_vagas_candidate_profile_v3';

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
