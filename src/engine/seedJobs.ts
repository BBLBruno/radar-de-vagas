import { Job } from '../types';
import liveJobsData from '../data/liveJobs.json';
import { isBlacklistedTitle } from './normalizer';

// VAGAS 100% REAIS E VALIDADAS (ZERO MOCK / ZERO RUÍDO DE SUPORTE TÉCNICO OU DEV)
export const SEED_JOBS: Job[] = (liveJobsData as Job[]).filter(j => {
  if (!j.canonicalUrl || !j.title) return false;

  // Bloqueio estrito contra cargos de TI / Suporte Técnico / Desenvolvimento / Infraestrutura
  if (isBlacklistedTitle(j.title)) return false;

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
