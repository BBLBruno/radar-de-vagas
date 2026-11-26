import { CandidateProfile, Job } from '../types';
import { isExecutiveOrSeniorTitle, normalizeGeoText } from './normalizer';

export interface MatchResult {
  score: number; // 0 to 100
  matchedKeywords: string[];
  missingKeywords: string[];
  seniorityMatch: boolean;
  workplaceMatch: boolean;
  isNicheFit: boolean;
}

const DEFAULT_CORE_STACKS = [
  'Operações / BizOps',
  'Processos / BPMN',
  'Onboarding / CS',
  'Inteligência Comercial',
  'CRM',
  'Chatwoot / Mensageria',
  'N8N',
  'Automação / IA',
  'APIs / Webhooks',
  'SQL',
  'Indicadores / KPIs',
  'E-commerce / Ads',
  'Python',
  'Excel / Sheets',
];

export function calculateJobMatch(job: Job, profile: CandidateProfile | null): MatchResult {
  const effectiveUserStacks =
    profile && profile.primaryStacks.length > 0 ? profile.primaryStacks : DEFAULT_CORE_STACKS;

  let totalScore = 38;
  const userStacksLower = effectiveUserStacks.map(s => normalizeGeoText(s));

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  job.stacks.forEach(stack => {
    const normStack = normalizeGeoText(stack);
    if (userStacksLower.some(u => u === normStack || u.includes(normStack) || normStack.includes(u))) {
      matchedKeywords.push(stack);
    } else {
      missingKeywords.push(stack);
    }
  });

  if (job.stacks.length > 0) {
    const stackRatio = matchedKeywords.length / job.stacks.length;
    totalScore += Math.min(36, Math.round(stackRatio * 28) + matchedKeywords.length * 6);
  } else {
    totalScore += 12;
  }

  // Bônus para trilhas de altíssima conversão real (Implantação/Onboarding, CRM Técnico, Automação/IA e BizOps)
  const normTitle = normalizeGeoText(job.title);
  if (/\b(implantacao|implementation|onboarding|chatwoot|n8n|automacao|bizops|business\s+operations|crm|sales\s+ops)\b/i.test(normTitle)) {
    totalScore += 10;
  }

  const cats = job.nicheCategories || [];
  const isStrategicCategory = cats.length > 0;
  if (isStrategicCategory) {
    totalScore += 8;
  }

  let seniorityMatch = false;
  const isExec = isExecutiveOrSeniorTitle(job.title);
  const targetSeniority = profile?.seniority || 'junior';

  if (targetSeniority === job.seniority) {
    seniorityMatch = true;
    totalScore += 14;
  } else if ((job.seniority === 'junior' || job.seniority === 'pleno') && !isExec) {
    totalScore += 10;
  } else if (job.seniority === 'senior' || isExec) {
    totalScore -= 18;
  }

  let workplaceMatch = false;
  if (job.workplaceType === 'remoto') {
    workplaceMatch = true;
    totalScore += 10;
  } else if (job.workplaceType === 'hibrido') {
    workplaceMatch = profile?.preferredWorkplace !== 'remoto';
    totalScore += job.isWithinAllowedRadius ? 8 : -5;
  } else {
    workplaceMatch = profile?.preferredWorkplace === 'presencial' || profile?.preferredWorkplace === 'qualquer';
    totalScore -= 5;
  }

  // Penalidades por barreiras reais identificadas na auditoria
  if (job.requiresSpanish) {
    totalScore -= 18;
  }

  if (job.hasHiddenOnsiteWarning && (profile?.preferredWorkplace === 'remoto' || !profile?.preferredWorkplace)) {
    totalScore -= 10;
  }

  const normDesc = normalizeGeoText(job.description || '');
  if (/\b(pentaho|alteryx|pyspark|informatica\s+powercenter|oracle\s+pl\/sql|abap|cobol|produtos\s+financeiros|iqvia)\b/i.test(normDesc)) {
    totalScore -= 20;
  }

  if (job.isAffirmative && (profile?.preferences?.hideAffirmativeJobs ?? true)) {
    totalScore -= 25;
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
