import { Job } from '../../types';
import { calculateDaysOpen, detectSeniority, detectWorkplaceType, extractStacks, isBrazilJob } from '../normalizer';

export interface InHireJobRaw {
  id: string;
  title: string;
  companyName: string;
  companySlug: string;
  location: string;
  workModel?: string; // REMOTE, HYBRID, ONSITE
  publishedAt: string;
  description?: string;
  salary?: string;
}

export function parseInHireJob(raw: InHireJobRaw): Job | null {
  const workplace = raw.workModel?.toLowerCase() === 'remote' 
    ? 'remoto' 
    : raw.workModel?.toLowerCase() === 'hybrid' 
    ? 'hibrido' 
    : detectWorkplaceType(raw.title, raw.location);

  if (!isBrazilJob(raw.location, workplace)) {
    return null;
  }

  const daysOpen = calculateDaysOpen(raw.publishedAt);
  const stacks = extractStacks(`${raw.title} ${raw.description || ''}`);
  const seniority = detectSeniority(raw.title, raw.description || '');

  const canonicalUrl = `https://${raw.companySlug}.inhire.app/vagas/${raw.id}`;

  return {
    id: `inhire_${raw.id}`,
    title: raw.title,
    company: raw.companyName,
    platform: 'inhire',
    canonicalUrl,
    publishedAt: raw.publishedAt,
    daysOpen,
    workplaceType: workplace,
    location: raw.location || (workplace === 'remoto' ? 'Remoto - Brasil' : 'Brasil'),
    seniority,
    stacks,
    salary: raw.salary,
    description: raw.description || `Oportunidade para ${raw.title} na ${raw.companyName} via plataforma InHire.`,
    requirements: stacks.map(s => `Conhecimento em ${s}`),
    isActive: true,
    rawPayloadId: raw.id,
  };
}

export async function fetchInHireJobs(companySlug: string, companyName: string): Promise<Job[]> {
  const url = `https://api.inhire.app/job-posts/public/${companySlug}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    const rawJobs: InHireJobRaw[] = Array.isArray(data) ? data : (data.items || []);

    const jobs: Job[] = [];
    for (const raw of rawJobs) {
      const job = parseInHireJob({
        ...raw,
        companySlug,
        companyName,
      });
      if (job) jobs.push(job);
    }

    return jobs;
  } catch (err) {
    console.error(`Erro ao buscar vagas InHire [${companySlug}]:`, err);
    return [];
  }
}
