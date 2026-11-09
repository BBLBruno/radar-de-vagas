export type ATSPlatform =
  | 'gupy'
  | 'inhire'
  | 'empregostec'
  | 'greenhouse'
  | 'lever'
  | 'solides'
  | 'github_vagas'
  | 'remotive_intl';

export type WorkplaceType = 'remoto' | 'hibrido' | 'presencial';

export type SeniorityLevel = 'estagio' | 'junior' | 'pleno' | 'senior' | 'especialista';

export type NicheCategory =
  | 'bizops_processos'
  | 'inteligencia_mercado'
  | 'crm_revops_onboarding'
  | 'dados_bi'
  | 'automacao_ia';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  platform: ATSPlatform;
  canonicalUrl: string;
  publishedAt: string; // ISO UTC date
  daysOpen: number;
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
  isAffirmative?: boolean;
  affirmativeReason?: string;
  distanceFromMuzambinhoKm?: number;
  hybridDaysPerWeek?: number;
  isWithinAllowedRadius?: boolean;
  nicheCategories?: NicheCategory[];
  isInternational?: boolean;
  fitScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

export interface ApplicationPortalLink {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface AppliedJobInfo {
  jobId: string;
  appliedAt: string;
  trackingUrl?: string;
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  resumeExternalUrl?: string;
  resumePdfName?: string;
  resumePdfDataUrl?: string;
  city: string;
  state: string;
  title: string;
  summary: string;
  seniority: SeniorityLevel;
  primaryStacks: string[];
  yearsOfExperience: number;
  preferredWorkplace: WorkplaceType | 'qualquer';
  salaryExpectationClt: string;
  salaryExpectationPj: string;
  background: {
    education: string;
    entrepreneurship: string;
    keyMetricCase: string;
    operationalPillars?: string;
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
    pcd: 'sim' | 'nao';
    willingToRelocate: boolean;
    leadershipExperience: string;
    customBio: string;
  };
  applicationTrackers?: ApplicationPortalLink[];
}

export interface FilterState {
  searchQuery: string;
  maxDays: number;
  workplaceType: 'todos' | WorkplaceType;
  selectedWorkplaces: WorkplaceType[];
  scopeFilter: 'todas' | 'nacional' | 'internacional';
  seniority: 'todos' | SeniorityLevel;
  selectedSeniorities: SeniorityLevel[];
  hideExecutiveSenior: boolean;
  hideSavedJobs?: boolean;
  platform: 'todas' | ATSPlatform;
  selectedStacks: string[];
  stateFilter: string;
  hideAffirmative: boolean;
  onlyMuzambinhoRadiusOrRemote: boolean;
  selectedNicheCategory: 'todas' | NicheCategory;
}
