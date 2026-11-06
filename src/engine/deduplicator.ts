import { Job } from '../types';

/**
 * Remove acentuação e caracteres especiais para comparação
 */
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
 * Gera uma assinatura canônica para a vaga
 */
export function generateJobSignature(job: Partial<Job>): string {
  const company = cleanString(job.company || '');
  const title = cleanString(job.title || '')
    .replace(/\b(vaga|oportunidade|pessoa|desenvolvedor|developer|dev)\b/g, '')
    .trim();
  const workplace = job.workplaceType || 'remoto';

  return `${company}_${title}_${workplace}`;
}

/**
 * Deduplica uma lista de vagas baseado na assinatura e similaridade
 */
export function deduplicateJobs(jobs: Job[]): Job[] {
  const seenSignatures = new Map<string, Job>();

  for (const job of jobs) {
    const signature = generateJobSignature(job);

    if (!seenSignatures.has(signature)) {
      seenSignatures.set(signature, job);
    } else {
      // Se já existe, mantemos a que tiver link direto com maior riqueza de dados ou mais recente
      const existing = seenSignatures.get(signature)!;
      if (new Date(job.publishedAt).getTime() > new Date(existing.publishedAt).getTime()) {
        seenSignatures.set(signature, job);
      }
    }
  }

  return Array.from(seenSignatures.values());
}
