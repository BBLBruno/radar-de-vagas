import { CandidateProfile, Job } from '../types';
import { isExecutiveOrSeniorTitle } from './normalizer';

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
      score: 60,
      matchedKeywords: [],
      missingKeywords: job.stacks,
      seniorityMatch: false,
      workplaceMatch: false,
      isNicheFit: true,
    };
  }

  let totalScore = 35; // Base score para vagas já filtradas do nicho de Negócios/Operações/Dados
  const userStacksLower = profile.primaryStacks.map(s => s.toLowerCase());

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  job.stacks.forEach(stack => {
    if (userStacksLower.includes(stack.toLowerCase())) {
      matchedKeywords.push(stack);
    } else {
      missingKeywords.push(stack);
    }
  });

  if (job.stacks.length > 0) {
    const stackRatio = matchedKeywords.length / job.stacks.length;
    totalScore += Math.min(35, Math.round(stackRatio * 30) + matchedKeywords.length * 6);
  } else {
    totalScore += 15;
  }

  const cats = job.nicheCategories || [];
  const isStrategicCategory = cats.some(c =>
    [
      'bizops_processos',
      'inteligencia_mercado',
      'crm_revops_onboarding',
      'dados_bi',
      'automacao_ia',
    ].includes(c)
  );

  if (isStrategicCategory) {
    totalScore += 12;
  }

  let seniorityMatch = false;
  const isExec = isExecutiveOrSeniorTitle(job.title);
  if (profile.seniority === job.seniority) {
    seniorityMatch = true;
    totalScore += 15;
  } else if (
    (job.seniority === 'junior' || job.seniority === 'pleno' || job.seniority === 'estagio') &&
    !isExec
  ) {
    totalScore += 12;
  } else if (isExec) {
    totalScore -= 15;
  }

  let workplaceMatch = false;
  if (job.workplaceType === 'remoto') {
    workplaceMatch = true;
    totalScore += 10;
  } else if (job.workplaceType === 'hibrido') {
    workplaceMatch = profile.preferredWorkplace !== 'remoto';
    totalScore += 8;
  } else {
    workplaceMatch = profile.preferredWorkplace === 'presencial' || profile.preferredWorkplace === 'qualquer';
    totalScore += 5;
  }

  if (job.isAffirmative && profile.preferences?.hideAffirmativeJobs) {
    totalScore -= 20;
  }

  const finalScore = Math.min(99, Math.max(20, Math.round(totalScore)));

  return {
    score: finalScore,
    matchedKeywords,
    missingKeywords,
    seniorityMatch,
    workplaceMatch,
    isNicheFit: isStrategicCategory,
  };
}
