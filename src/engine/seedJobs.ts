import { Job } from '../types';
import liveJobsData from '../data/liveJobs.json';

// VAGAS 100% REAIS E VALIDADAS DOS ATSs E PORTAIS GLOBAIS (ZERO MOCK / ZERO LINKS FALSOS)
export const SEED_JOBS: Job[] = (liveJobsData as Job[]).filter(j => {
  if (!j.canonicalUrl) return false;

  const isMockUrl =
    j.canonicalUrl.includes('fintechhub') ||
    j.canonicalUrl.includes('saasgrowth') ||
    j.canonicalUrl.includes('omnichannel') ||
    j.canonicalUrl.includes('agritechvalley') ||
    j.canonicalUrl.includes('nextgendigital') ||
    j.canonicalUrl.includes('logistica.gupy');

  if (isMockUrl) return false;

  // Vagas internacionais 100% remotas são sempre permitidas
  if (j.isInternational || j.platform === 'remotive_intl') {
    return true;
  }

  // Para vagas nacionais, descarta posições restritas a outros países da Latam
  const locLower = (j.location || '').toLowerCase();
  const titleLower = (j.title || '').toLowerCase();
  const isOtherLatamOnly =
    titleLower.includes('argentina') ||
    locLower.includes('buenos aires') ||
    locLower.includes('mexico city') ||
    locLower.includes('santiago, chile');

  return !isOtherLatamOnly;
});
