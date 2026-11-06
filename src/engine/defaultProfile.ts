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
  title: 'Especialista em Automações (N8N), AI Ops & RevOps',
  summary: 'Bacharel em Ciência da Computação e ex-cofundador de operação de e-commerce que faturou R$ 2.5M. Especialista em otimização de fluxos operacionais de alta escala, arquitetura com N8N, integrações com LLMs/IA e orquestração de CRM (HubSpot/Salesforce). Case comprovado de redução de 60% do SAC por meio de agentes inteligentes e automações orientadas a eventos.',
  seniority: 'senior',
  primaryStacks: [
    'N8N', 'Make', 'AI Ops', 'RevOps', 'Sales Ops', 'CRM', 
    'HubSpot', 'Salesforce', 'Webhooks', 'REST APIs', 'OpenAI API', 
    'Product Owner', 'Analista de Produto', 'SQL', 'Python', 'BPMN'
  ],
  yearsOfExperience: 5,
  preferredWorkplace: 'remoto',
  salaryExpectationClt: 'R$ 12.000,00',
  salaryExpectationPj: 'R$ 16.000,00',
  background: {
    education: 'Bacharel em Ciência da Computação',
    entrepreneurship: 'Ex-cofundador de e-commerce de R$ 2.5M',
    keyMetricCase: 'Case comprovado de redução de 60% no volume de SAC via N8N e IA',
    nicheFocus: ['N8N', 'Automação', 'AI Ops', 'RevOps', 'Revenue Operations', 'Sales Ops', 'CRM', 'Product Owner', 'Analista de Produto']
  },
  preferences: {
    hideAffirmativeJobs: true, // Ocultar vagas afirmativas por padrão
    maxHybridDistanceKm: 150, // Até 150km de Muzambinho
    maxHybridDaysPerWeek: 2, // No máximo 2 dias presenciais na semana
    referenceCity: 'Muzambinho',
    referenceState: 'MG',
  },
  screeningAnswers: {
    availability: 'Disponibilidade imediata para atuação 100% remota ou modelo híbrido (até 2 dias/semana) na região.',
    englishLevel: 'Avançado para leitura técnica, documentação e comunicação assíncrona corporativa.',
    pcd: 'nao',
    willingToRelocate: false,
    leadershipExperience: 'Experiência como cofundador liderando operações, alinhamento entre times de vendas, marketing e engenharia, e implementação de esteiras de automação de ponta a ponta.',
    customBio: 'Profissional com visão holística de negócio e profundidade técnica para desenhar e executar automações que geram receita e cortam custos operacionais.',
  }
};

const PROFILE_STORAGE_KEY = 'radar_vagas_candidate_profile_v2';

export function loadStoredProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Garante migração dos novos campos
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
