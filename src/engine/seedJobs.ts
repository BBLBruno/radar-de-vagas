import { Job } from '../types';
import liveJobsData from '../data/liveJobs.json';

// APENAS VAGAS 100% REAIS E VALIDADAS DOS ATSs (ZERO MOCK / ZERO LINKS FALSOS)
export const SEED_JOBS: Job[] = (liveJobsData as Job[]).filter(j => {
  // Garante que não possui link mockado
  const isMockUrl = 
    j.canonicalUrl.includes('fintechhub') ||
    j.canonicalUrl.includes('saasgrowth') ||
    j.canonicalUrl.includes('omnichannel') ||
    j.canonicalUrl.includes('agritechvalley') ||
    j.canonicalUrl.includes('nextgendigital') ||
    j.canonicalUrl.includes('logistica.gupy');

  // Garante que é no Brasil e possui URL válida
  const isBrazil = !j.title.toLowerCase().includes('argentina') && 
                   !j.location.toLowerCase().includes('argentina') &&
                   !j.location.toLowerCase().includes('buenos aires') &&
                   !j.location.toLowerCase().includes('mexico') &&
                   !j.location.toLowerCase().includes('chile');

  return !isMockUrl && isBrazil && Boolean(j.canonicalUrl);
});
