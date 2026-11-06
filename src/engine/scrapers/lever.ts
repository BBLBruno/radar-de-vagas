import { Job } from '../../types';
import { calculateDaysOpen, detectSeniority, detectWorkplaceType, extractStacks, isBrazilJob } from '../normalizer';

export interface LeverJobRaw {
  id: string;
  text: string;
  createdAt: number;
  descriptionPlain?: string;
  hostedUrl: string; // URL direta de inscrição
  applyUrl?: string;
  categories: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
    workplaceType?: string;
  };
  country?: string;
}

export function parseLeverJob(raw: LeverJobRaw, companyName: string): Job | null {
  const locRaw = raw.categories?.location || '';
  const workplace = detectWorkplaceType(raw.text, locRaw, raw.categories?.workplaceType);

  // Filtro de Brasil
  if (!isBrazilJob(locRaw, workplace)) {
    return null;
  }

  const publishedIso = new Date(raw.createdAt).toISOString();
  const daysOpen = calculateDaysOpen(publishedIso);
  const stacks = extractStacks(`${raw.text} ${raw.descriptionPlain || ''}`);
  const seniority = detectSeniority(raw.text, raw.descriptionPlain || '');

  return {
    id: `lever_${raw.id}`,
    title: raw.text,
    company: companyName,
    platform: 'lever',
    canonicalUrl: raw.hostedUrl,
    publishedAt: publishedIso,
    daysOpen,
    workplaceType: workplace,
    location: locRaw || (workplace === 'remoto' ? 'Remoto - Brasil' : 'Brasil'),
    seniority,
    stacks,
    description: raw.descriptionPlain?.slice(0, 400) || `Oportunidade para ${raw.text} na ${companyName}. Inscrição direta via Lever.`,
    requirements: stacks.map(s => `Conhecimento em ${s}`),
    isActive: true,
    rawPayloadId: raw.id,
  };
}

export async function fetchLeverJobs(companySlug: string, displayName?: string): Promise<Job[]> {
  const url = `https://api.lever.co/v0/postings/${companySlug}?mode=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Lever fetch status ${response.status} for ${companySlug}`);
      return [];
    }

    const data: LeverJobRaw[] = await response.json();
    const company = displayName || companySlug.charAt(0).toUpperCase() + companySlug.slice(1);

    const jobs: Job[] = [];
    for (const raw of data) {
      const job = parseLeverJob(raw, company);
      if (job) jobs.push(job);
    }

    return jobs;
  } catch (err) {
    console.error(`Erro ao buscar vagas Lever [${companySlug}]:`, err);
    return [];
  }
}
