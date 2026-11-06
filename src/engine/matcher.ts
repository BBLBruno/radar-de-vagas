import { CandidateProfile, Job } from '../types';

export interface MatchResult {
  score: number; // 0 to 100
  matchedKeywords: string[];
  missingKeywords: string[];
  seniorityMatch: boolean;
  workplaceMatch: boolean;
  isNicheFit: boolean;
}

export function calculateJobMatch(job: Job, profile: CandidateProfile | null): MatchResult {
  if (!profile) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: job.stacks,
      seniorityMatch: false,
      workplaceMatch: false,
      isNicheFit: false,
    };
  }

  let totalScore = 0;
  const userStacksLower = profile.primaryStacks.map(s => s.toLowerCase());

  // 1. Stack & Niche Match (Peso 50%)
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  job.stacks.forEach(stack => {
    if (userStacksLower.includes(stack.toLowerCase())) {
      matchedKeywords.push(stack);
    } else {
      missingKeywords.push(stack);
    }
  });

  const stackRatio = job.stacks.length > 0 
    ? matchedKeywords.length / job.stacks.length 
    : 0.5;
  totalScore += stackRatio * 40;

  // Bônus especial de nicho (N8N, RevOps, AI Ops, Automação, Produto)
  const titleLower = job.title.toLowerCase();
  const isHighValueNiche = 
    titleLower.includes('n8n') || 
    titleLower.includes('ai ops') || 
    titleLower.includes('revops') || 
    titleLower.includes('automação') ||
    titleLower.includes('product owner') ||
    titleLower.includes('analista de produto');

  if (isHighValueNiche) {
    totalScore += 15;
  }

  // 2. Senioridade (Peso 20%)
  let seniorityMatch = false;
  if (profile.seniority === job.seniority) {
    seniorityMatch = true;
    totalScore += 20;
  } else if (
    (profile.seniority === 'senior' && (job.seniority === 'pleno' || job.seniority === 'especialista')) ||
    (profile.seniority === 'pleno' && (job.seniority === 'junior' || job.seniority === 'senior'))
  ) {
    totalScore += 12;
  }

  // 3. Modelo de Trabalho e Raio de Muzambinho (Peso 20%)
  let workplaceMatch = false;
  if (job.workplaceType === 'remoto') {
    workplaceMatch = true;
    totalScore += 20;
  } else if (job.workplaceType === 'hibrido') {
    const isWithinRadius = (job.distanceFromMuzambinhoKm ?? 0) <= 150;
    const isFewDays = (job.hybridDaysPerWeek ?? 2) <= 2;
    if (isWithinRadius && isFewDays) {
      workplaceMatch = true;
      totalScore += 18;
    } else {
      totalScore -= 10; // Penalidade por estar longe de Muzambinho
    }
  }

  // 4. Afirmativa (Se o perfil optou por ocultar, score zera para priorizar vagas abertas a todos)
  if (job.isAffirmative && profile.preferences?.hideAffirmativeJobs) {
    totalScore -= 25;
  }

  const finalScore = Math.min(100, Math.max(10, Math.round(totalScore)));

  return {
    score: finalScore,
    matchedKeywords,
    missingKeywords,
    seniorityMatch,
    workplaceMatch,
    isNicheFit: isHighValueNiche,
  };
}
