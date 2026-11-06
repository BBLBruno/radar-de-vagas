import { CandidateProfile, Job } from '../types';

export interface MatchResult {
  score: number; // 0 to 100
  matchedKeywords: string[];
  missingKeywords: string[];
  seniorityMatch: boolean;
  workplaceMatch: boolean;
}

export function calculateJobMatch(job: Job, profile: CandidateProfile | null): MatchResult {
  if (!profile) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: job.stacks,
      seniorityMatch: false,
      workplaceMatch: false,
    };
  }

  let totalScore = 0;
  const userStacksLower = profile.primaryStacks.map(s => s.toLowerCase());
  const jobStacksLower = job.stacks.map(s => s.toLowerCase());

  // 1. Stack Match (Peso 50%)
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
  totalScore += stackRatio * 50;

  // 2. Seniority Match (Peso 25%)
  let seniorityMatch = false;
  if (profile.seniority === job.seniority) {
    seniorityMatch = true;
    totalScore += 25;
  } else if (
    (profile.seniority === 'senior' && (job.seniority === 'pleno' || job.seniority === 'especialista')) ||
    (profile.seniority === 'pleno' && (job.seniority === 'junior' || job.seniority === 'senior'))
  ) {
    totalScore += 15; // Adjacente
  }

  // 3. Workplace Match (Peso 15%)
  let workplaceMatch = false;
  if (profile.preferredWorkplace === 'ambos') {
    workplaceMatch = true;
    totalScore += 15;
  } else if (profile.preferredWorkplace === job.workplaceType) {
    workplaceMatch = true;
    totalScore += 15;
  } else if (job.workplaceType === 'remoto') {
    workplaceMatch = true;
    totalScore += 15;
  }

  // 4. Localidade ou Experiência (Peso 10%)
  if (job.workplaceType === 'remoto' || (profile.state && job.location.includes(profile.state))) {
    totalScore += 10;
  } else {
    totalScore += 4;
  }

  return {
    score: Math.min(100, Math.round(totalScore)),
    matchedKeywords,
    missingKeywords,
    seniorityMatch,
    workplaceMatch,
  };
}
