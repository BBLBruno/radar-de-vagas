import { CandidateProfile } from '../types';

// Todos os campos iniciam vazios para exibir apenas os placeholders na tela de Perfil
export const DEFAULT_PROFILE: CandidateProfile = {
  fullName: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  resumeExternalUrl: '',
  resumePdfName: '',
  resumePdfDataUrl: '',
  city: '',
  state: '',
  title: '',
  summary: '',
  seniority: 'pleno',
  primaryStacks: [],
  yearsOfExperience: 0,
  preferredWorkplace: 'qualquer',
  salaryExpectationClt: '',
  salaryExpectationPj: '',
  background: {
    education: '',
    entrepreneurship: '',
    keyMetricCase: '',
    operationalPillars: '',
    nicheFocus: [],
  },
  preferences: {
    hideAffirmativeJobs: true,
    maxHybridDistanceKm: 150,
    maxHybridDaysPerWeek: 2,
    referenceCity: '',
    referenceState: '',
  },
  screeningAnswers: {
    availability: '',
    englishLevel: '',
    pcd: 'nao',
    willingToRelocate: true,
    leadershipExperience: '',
    customBio: '',
  },
  applicationTrackers: [],
};

const PROFILE_STORAGE_KEY = 'radar_vagas_candidate_profile_v8';

export function isValidSavedUrl(rawUrl: string): boolean {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    const parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const parts = parsed.hostname.toLowerCase().split('.');
    const tld = parts[parts.length - 1] || '';
    const domain = parts.length >= 2 ? parts[parts.length - 2] : '';
    return parts.length >= 2 && domain.length >= 2 && /^[a-z]{2,15}$/.test(tld);
  } catch {
    return false;
  }
}

export function loadStoredProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validTrackers = Array.isArray(parsed.applicationTrackers)
        ? parsed.applicationTrackers.filter(
            (t: any) => t && typeof t.name === 'string' && t.name.trim() && isValidSavedUrl(t.url)
          )
        : [];
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        background: { ...DEFAULT_PROFILE.background, ...parsed.background },
        preferences: { ...DEFAULT_PROFILE.preferences, ...parsed.preferences },
        applicationTrackers: validTrackers,
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
