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
      score: 50,
      matchedKeywords: [],
      missingKeywords: job.stacks,
      seniorityMatch: false,
      workplaceMatch: false,
      isNicheFit: false,
    };
  }

  let totalScore = 25; // Base score para qualquer vaga real
  const userStacksLower = profile.primaryStacks.map(s => s.toLowerCase());

  // 1. Stack & Keyword Match (Até 40 pontos)
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
    totalScore += Math.min(40, Math.round(stackRatio * 40) + matchedKeywords.length * 6);
  } else {
    totalScore += 15;
  }

  // Bônus por categorias de entrada estratégica e operações (Implantação, Suporte N2, Dados/BI, CRM/RevOps, Automação/IA, Produto)
  const cats = job.nicheCategories || [];
  const isStrategicCategory = cats.some(c =>
    ['implantacao', 'suporte', 'dados_bi', 'crm_revops', 'automacao_ia', 'produto'].includes(c)
  );

  if (isStrategicCategory) {
    totalScore += 12;
  }

  // 2. Senioridade (Até 20 pontos)
  let seniorityMatch = false;
  const isExec = isExecutiveOrSeniorTitle(job.title);
  if (profile.seniority === job.seniority) {
    seniorityMatch = true;
    totalScore += 18;
  } else if (
    (job.seniority === 'junior' || job.seniority === 'pleno' || job.seniority === 'estagio') &&
    !isExec
  ) {
    totalScore += 14;
  } else if (isExec && (profile.seniority === 'junior' || profile.seniority === 'pleno' || profile.seniority === 'estagio')) {
    totalScore -= 15;
  }

  // 3. Modelo de Trabalho (Até 15 pontos)
  let workplaceMatch = false;
  if (job.workplaceType === 'remoto') {
    workplaceMatch = true;
    totalScore += 15;
  } else if (job.workplaceType === 'hibrido') {
    workplaceMatch = profile.preferredWorkplace !== 'remoto';
    totalScore += 10;
  } else {
    workplaceMatch = profile.preferredWorkplace === 'presencial' || profile.preferredWorkplace === 'qualquer';
    totalScore += 6;
  }

  // 4. Afirmativa
  if (job.isAffirmative && profile.preferences?.hideAffirmativeJobs) {
    totalScore -= 20;
  }

  const finalScore = Math.min(99, Math.max(15, Math.round(totalScore)));

  return {
    score: finalScore,
    matchedKeywords,
    missingKeywords,
    seniorityMatch,
    workplaceMatch,
    isNicheFit: isStrategicCategory,
  };
}
