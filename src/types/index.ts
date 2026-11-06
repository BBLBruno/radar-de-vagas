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
  title: string; // ex: Desenvolvedor Full Stack
  summary: string;
  seniority: SeniorityLevel;
  primaryStacks: string[];
  yearsOfExperience: number;
  preferredWorkplace: 'remoto' | 'hibrido' | 'ambos';
  salaryExpectationClt: string;
  salaryExpectationPj: string;
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
  minMatchScore?: number;
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
