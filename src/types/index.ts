export type ATSPlatform = 
  | 'gupy' 
  | 'lever' 
  | 'greenhouse' 
  | 'inhire' 
  | 'solides' 
  | 'linkedin_index';

export type WorkplaceType = 'remoto' | 'hibrido' | 'presencial';

export type SeniorityLevel = 
  | 'estagio' 
  | 'junior' 
  | 'pleno' 
  | 'senior' 
  | 'especialista'
  | 'todos';

export type NicheCategory = 'ai_ops' | 'revops' | 'automacao' | 'produto' | 'geral';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  platform: ATSPlatform;
  canonicalUrl: string; // Link direto para a página de inscrição oficial
  publishedAt: string; // ISO date UTC
  daysOpen: number; // Dias em aberto (calculado contra data atual)
  workplaceType: WorkplaceType;
  location: string;
  city?: string;
  state?: string;
  seniority: SeniorityLevel;
  stacks: string[];
  salary?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  isActive: boolean;
  rawPayloadId?: string;
  fitScore?: number; // 0 - 100 calculado dinamicamente com o perfil
  matchedKeywords?: string[];
  missingKeywords?: string[];
  
  // Novos campos de nicho e filtros avançados
  nicheCategories?: NicheCategory[];
  isAffirmative: boolean; // Vagas afirmativas (PCD, gênero, raça/etnia, 50+)
  affirmativeReason?: string;
  hybridDaysPerWeek?: number; // Ex: 1 ou 2 dias na semana
  distanceFromMuzambinhoKm?: number; // Distância calculada em KM
  isWithinAllowedRadius?: boolean;
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  city: string; // Padrão: Muzambinho
  state: string; // Padrão: MG
  title: string; // ex: Especialista em AI Ops, RevOps & Automações
  summary: string;
  seniority: SeniorityLevel;
  primaryStacks: string[];
  yearsOfExperience: number;
  preferredWorkplace: 'remoto' | 'hibrido' | 'ambos';
  salaryExpectationClt: string;
  salaryExpectationPj: string;
  
  // Background profissional fixo de alto impacto
  background: {
    education: string; // Bacharel em Ciência da Computação
    entrepreneurship: string; // Ex-cofundador de e-commerce de R$ 2.5M
    keyMetricCase: string; // Redução de 60% do SAC com N8N e fluxos inteligentes com IA
    nicheFocus: string[]; // ['N8N', 'AI Ops', 'RevOps', 'Sales Ops', 'CRM', 'Product Owner']
  };

  preferences: {
    hideAffirmativeJobs: boolean; // Ocultar vagas afirmativas
    maxHybridDistanceKm: number; // 150 km
    maxHybridDaysPerWeek: number; // 2 dias
    referenceCity: string; // Muzambinho
    referenceState: string; // MG
  };

  screeningAnswers: {
    availability: string;
    englishLevel: string;
    pcd: 'nao' | 'sim';
    willingToRelocate: boolean;
    leadershipExperience: string;
    customBio: string;
  };
}

export interface FilterState {
  searchQuery: string;
  maxDays: number; // 1, 3, 7, 14, 30
  workplaceType: 'todos' | WorkplaceType;
  seniority: SeniorityLevel;
  platform: 'todas' | ATSPlatform;
  selectedStacks: string[];
  stateFilter: string;
  hideAffirmative: boolean; // Oculta vagas afirmativas
  onlyMuzambinhoRadiusOrRemote: boolean; // Remoto ou Híbrido <= 150km de Muzambinho com <= 2 dias
  selectedNicheCategory: 'todas' | NicheCategory;
}

export interface ScraperSourceConfig {
  id: string;
  name: string;
  platform: ATSPlatform;
  endpoint: string;
  companySlug: string;
  enabled: boolean;
  lastScrapedAt?: string;
  jobsFound?: number;
}
