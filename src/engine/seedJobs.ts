import { Job } from '../types';
import liveJobsData from '../data/liveJobs.json';
import {
  checkBrazilEligibility,
  isBlacklistedTitle,
  isDisguisedTrap,
  isRelevantCareerTitle,
} from './normalizer';

// VAGAS 100% REAIS, ABERTAS E ELEGÍVEIS PARA QUEM RESIDE NO BRASIL
export const SEED_JOBS: Job[] = (liveJobsData as Job[]).filter(j => {
  if (!j.canonicalUrl || !j.title) return false;
  if (j.isActive === false) return false;

  if (j.expiresAt) {
    const expMs = new Date(j.expiresAt).getTime();
    if (!isNaN(expMs) && expMs < Date.now()) return false;
  }

  if (isBlacklistedTitle(j.title) || !isRelevantCareerTitle(j.title)) return false;
  if (isDisguisedTrap(j.title, j.description || '')) return false;

  const isIntl = Boolean(j.isInternational || j.platform === 'remotive_intl');
  const elig = checkBrazilEligibility(isIntl, j.title, j.location || '', j.description || '');
  return elig.eligible;
});
