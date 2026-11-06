export type ATSPlatform = 
  | 'gupy' 
  | 'inhire' 
  | 'greenhouse' 
  | 'lever' 
  | 'solides' 
  | 'empregostec'
  | 'github_vagas'
  | 'remotive_intl';

export type WorkplaceType = 'remoto' | 'hibrido' | 'presencial';

export type SeniorityLevel = 
  | 'estagio' 
  | 'junior' 
  | 'pleno' 
  | 'senior' 
  | 'especialista'
  | 'todos';

export type NicheCategory = 
  | 'implantacao'
  | 'suporte'
  | 'dados_bi'
  | 'crm_revops'
  | 'automacao_ia'
  | 'produto'
  | 'desenvolvimento'
  | 'qa_infra'
  | 'geral';

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
  
  nicheCategories?: NicheCategory[];
  isAffirmative: boolean; // Vagas afirmativas (PCD, gênero, raça/etnia, 50+)
  affirmativeReason?: string;
  hybridDaysPerWeek?: number;
  distanceFromMuzambinhoKm?: number;
  isWithinAllowedRadius?: boolean;
  isInternational?: boolean; // Vagas internacionais (100% remotas)
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  city: string;
  state: string;
  title: string;
  summary: string;
  seniority: SeniorityLevel;
  primaryStacks: string[];
  yearsOfExperience: number;
  preferredWorkplace: 'remoto' | 'hibrido' | 'presencial' | 'todos';
  salaryExpectationClt: string;
  salaryExpectationPj: string;
  
  background: {
    education: string;
    entrepreneurship: string;
    keyMetricCase: string;
    nicheFocus: string[];
  };

  preferences: {
    hideAffirmativeJobs: boolean;
    maxHybridDistanceKm: number;
    maxHybridDaysPerWeek: number;
    referenceCity: string;
    referenceState: string;
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
  scopeFilter: 'todos' | 'nacional' | 'internacional';
  seniority: SeniorityLevel;
  hideExecutiveSenior: boolean; // Trava opcional contra cargos executivos/sênior (Staff, Head, Director, Sr, Especialista, Manager)
  platform: 'todas' | ATSPlatform;
  selectedStacks: string[];
  stateFilter: string;
  hideAffirmative: boolean;
  onlyMuzambinhoRadiusOrRemote: boolean;
  selectedNicheCategory: 'todas' | NicheCategory;
}

export interface GlobalAggregatorStats {
  id: string;
  name: string;
  description: string;
  platformKey: ATSPlatform | 'all';
  scope: 'Brasil (Todas as Empresas)' | 'Internacional (100% Remoto)';
  workplacesSupported: string[];
  jobsCount: number;
  status: 'online' | 'syncing';
}
