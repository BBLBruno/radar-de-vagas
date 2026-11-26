export type ATSPlatform =
  | 'gupy'
  | 'inhire'
  | 'ashby'
  | 'empregostec'
  | 'greenhouse'
  | 'lever'
  | 'solides'
  | 'github_vagas'
  | 'remotive_intl';

export type WorkplaceType = 'remoto' | 'hibrido' | 'presencial';

export type SeniorityLevel = 'estagio' | 'junior' | 'pleno' | 'senior' | 'especialista';

export type ContractType = 'clt' | 'pj' | 'temporario' | 'estagio';

export type GeoEligibility = 'br_nacional' | 'latam_br' | 'global_remoto';

export type CrmTrack = 'crm_tecnico' | 'crm_marketing';

export type NicheCategory =
  | 'bizops_processos'
  | 'inteligencia_mercado'
  | 'crm_revops_onboarding'
  | 'dados_bi'
  | 'automacao_ia';

export interface GeoCoords {
  lat: number;
  lng: number;
}

export interface UserGeoLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
  source: 'gps' | 'profile';
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  platform: ATSPlatform;
  canonicalUrl: string;
  publishedAt: string; // ISO UTC date
  expiresAt?: string;
  daysOpen: number;
  workplaceType: WorkplaceType;
  location: string;
  city?: string;
  state?: string;
  seniority: SeniorityLevel;
  contractType?: ContractType;
  geoEligibility?: GeoEligibility;
  crmTrack?: CrmTrack;
  requiresSpanish?: boolean;
  hasHiddenOnsiteWarning?: boolean;
  hiddenOnsiteReason?: string;
  stacks: string[];
  salary?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  isActive: boolean;
  isAffirmative?: boolean;
  affirmativeReason?: string;
  distanceFromUserKm?: number;
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
  hideSpanishRequired?: boolean;
  platform: 'todas' | ATSPlatform;
  selectedStacks: string[];
  hideAffirmative: boolean;
  onlyWithinRadiusOrRemote: boolean;
  selectedNicheCategory: 'todas' | NicheCategory;
}
