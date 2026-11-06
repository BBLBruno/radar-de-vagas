import { Job } from '../../types';
import { calculateDaysOpen, detectSeniority, detectWorkplaceType, extractStacks, isBrazilJob } from '../normalizer';

export interface GreenhouseJobRaw {
  id: number;
  title: string;
  updated_at: string;
  absolute_url: string; // Link direto
  location: {
    name: string;
  };
  content?: string;
  departments?: Array<{ id: number; name: string }>;
}

export function parseGreenhouseJob(raw: GreenhouseJobRaw, companyName: string): Job | null {
  const locName = raw.location?.name || '';
  const workplace = detectWorkplaceType(raw.title, locName);

  // Filtro Brasil
  if (!isBrazilJob(locName, workplace)) {
    return null;
  }

  const daysOpen = calculateDaysOpen(raw.updated_at);
  const stacks = extractStacks(`${raw.title} ${raw.content || ''}`);
  const seniority = detectSeniority(raw.title, raw.content || '');

  return {
    id: `greenhouse_${raw.id}`,
    title: raw.title,
    company: companyName,
    platform: 'greenhouse',
    canonicalUrl: raw.absolute_url,
    publishedAt: raw.updated_at,
    daysOpen,
    workplaceType: workplace,
    location: locName || (workplace === 'remoto' ? 'Remoto - Brasil' : 'Brasil'),
    seniority,
    stacks,
    description: `Vaga de ${raw.title} na ${companyName}. Processo seletivo direto via Greenhouse.`,
    requirements: stacks.map(s => `Requisito: ${s}`),
    isActive: true,
    rawPayloadId: String(raw.id),
  };
}

export async function fetchGreenhouseJobs(companySlug: string, displayName?: string): Promise<Job[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Greenhouse fetch status ${response.status} for ${companySlug}`);
      return [];
    }

    const data = await response.json();
    const rawJobs: GreenhouseJobRaw[] = data.jobs || [];
    const company = displayName || companySlug.charAt(0).toUpperCase() + companySlug.slice(1);

    const jobs: Job[] = [];
    for (const raw of rawJobs) {
      const job = parseGreenhouseJob(raw, company);
      if (job) jobs.push(job);
    }

    return jobs;
  } catch (err) {
    console.error(`Erro ao buscar vagas Greenhouse [${companySlug}]:`, err);
    return [];
  }
}
