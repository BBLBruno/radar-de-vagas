import { Job } from '../types';

function cleanString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Extrai o ID numérico interno de URLs canônicas da Gupy (hash Base64 ou ID direto)
 */
export function extractGupyJobId(url: string = ''): string | null {
  if (!url || !url.includes('gupy.io/job/')) return null;
  const slug = url.split('/job/')[1]?.split(/[?#]/)[0] || '';
  if (!slug) return null;
  if (/^\d+$/.test(slug)) return slug;
  try {
    const decoded = atob(slug);
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.jobId) return String(parsed.jobId);
  } catch {
    // ignora caso não seja base64 JSON
  }
  return slug;
}

export function generateJobSignature(job: Partial<Job>): string {
  const gupyId = extractGupyJobId(job.canonicalUrl);
  if (gupyId) {
    return `gupy_id_${gupyId}`;
  }

  const company = cleanString(job.company || '');
  const title = cleanString(job.title || '')
    .replace(/^\d{5,}\s*/, '')
    .replace(/\b(vaga|oportunidade|pessoa|home\s+office|remoto|hibrido)\b/g, '')
    .trim();
  const workplace = job.workplaceType || 'remoto';

  return `${company}_${title}_${workplace}`;
}

function scoreJobRichness(job: Job): number {
  const descLen = (job.description || '').length;
  const isGenericTeaser = /abriu vaga home office|confira requisitos, beneficios/i.test(job.description || '');
  return (isGenericTeaser ? 0 : 1000) + Math.min(descLen, 3000);
}

/**
 * Deduplica vagas priorizando sempre a versão com descrição oficial completa (nunca sobrescrevendo com teaser curto)
 */
export function deduplicateJobs(jobs: Job[]): Job[] {
  const seenSignatures = new Map<string, Job>();

  for (const job of jobs) {
    const signature = generateJobSignature(job);

    if (!seenSignatures.has(signature)) {
      seenSignatures.set(signature, job);
    } else {
      const existing = seenSignatures.get(signature)!;
      const newRichness = scoreJobRichness(job);
      const existingRichness = scoreJobRichness(existing);

      if (
        newRichness > existingRichness + 150 ||
        (Math.abs(newRichness - existingRichness) <= 150 &&
          new Date(job.publishedAt).getTime() > new Date(existing.publishedAt).getTime())
      ) {
        seenSignatures.set(signature, job);
      }
    }
  }

  return Array.from(seenSignatures.values());
}
