import { Job } from '../../types';
import { calculateDaysOpen, detectSeniority, detectWorkplaceType, extractStacks, isBrazilJob } from '../normalizer';

export interface GupyJobRaw {
  id: number | string;
  name: string;
  description?: string;
  careerPageName?: string;
  careerPageUrl?: string;
  careerPageLogo?: string;
  type?: string;
  publishedDate: string;
  applicationDeadline?: string;
  isRemoteWork?: boolean;
  city?: string;
  state?: string;
  country?: string;
  jobUrl?: string;
  badges?: {
    friendlyBadge?: boolean;
    disabilities?: boolean;
  };
}

export function parseGupyJob(raw: GupyJobRaw, companySlugFallback: string = 'empresa'): Job | null {
  const workplace = raw.isRemoteWork 
    ? 'remoto' 
    : detectWorkplaceType(raw.name, `${raw.city || ''} ${raw.state || ''}`);

  const locationStr = raw.isRemoteWork 
    ? 'Remoto - Brasil' 
    : `${raw.city ? raw.city + ', ' : ''}${raw.state || 'Brasil'}`;

  // Filtro Brasil
  if (!isBrazilJob(locationStr, workplace)) {
    return null;
  }

  const daysOpen = calculateDaysOpen(raw.publishedDate);
  const stacks = extractStacks(`${raw.name} ${raw.description || ''}`);
  const seniority = detectSeniority(raw.name, raw.description || '');

  // Canonical Direct URL
  const canonicalUrl = raw.jobUrl || 
    (raw.careerPageUrl ? `${raw.careerPageUrl}/job/${raw.id}` : `https://portal.gupy.io/job/${raw.id}`);

  return {
    id: `gupy_${raw.id}`,
    title: raw.name,
    company: raw.careerPageName || companySlugFallback,
    companyLogo: raw.careerPageLogo,
    platform: 'gupy',
    canonicalUrl,
    publishedAt: raw.publishedDate,
    daysOpen,
    workplaceType: workplace,
    location: locationStr,
    city: raw.city,
    state: raw.state,
    seniority,
    stacks,
    description: raw.description || `Oportunidade para ${raw.name} na ${raw.careerPageName || 'empresa parceira'}. Vaga publicada diretamente no portal Gupy.`,
    requirements: stacks.map(s => `Experiência com ${s}`),
    isActive: true,
    rawPayloadId: String(raw.id),
  };
}

/**
 * Busca vagas na API pública de carreiras da Gupy
 */
export async function fetchGupyJobs(companySlug?: string, searchQuery: string = 'desenvolvedor'): Promise<Job[]> {
  const url = companySlug
    ? `https://${companySlug}.gupy.io/api/v1/jobs`
    : `https://portal.gupy.io/api/v1/jobs?jobName=${encodeURIComponent(searchQuery)}&limit=30`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.warn(`Gupy fetch returned status ${response.status} for ${url}`);
      return [];
    }

    const data = await response.json();
    const rawJobs: GupyJobRaw[] = Array.isArray(data) ? data : (data.data || []);

    const parsed: Job[] = [];
    for (const raw of rawJobs) {
      const job = parseGupyJob(raw, companySlug || 'Gupy Recrutamento');
      if (job) parsed.push(job);
    }

    return parsed;
  } catch (err) {
    console.error(`Erro ao buscar vagas Gupy [${url}]:`, err);
    return [];
  }
}
