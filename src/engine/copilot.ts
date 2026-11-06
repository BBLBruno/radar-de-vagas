import { CandidateProfile, Job } from '../types';

export interface CopilotScreeningAnswer {
  question: string;
  suggestedAnswer: string;
  tip: string;
}

export interface CopilotKit {
  tailoredPitch: string;
  screeningAnswers: CopilotScreeningAnswer[];
  atsKeywordsToHighlight: string[];
  canonicalUrl: string;
  recommendedSalary: string;
}

export function generateCopilotKit(job: Job, profile: CandidateProfile | null): CopilotKit {
  const candidateName = profile?.fullName || 'Candidato';
  const roleTitle = profile?.title || 'Desenvolvedor de Software';
  const matchedStacks = job.matchedKeywords && job.matchedKeywords.length > 0 
    ? job.matchedKeywords.join(', ')
    : job.stacks.slice(0, 4).join(', ');

  // 1. Pitch / Cover Letter sob medida
  const tailoredPitch = `Olá, time de recrutamento da ${job.company}!

Me chamo ${candidateName} e atuo como ${roleTitle}. Fiquei muito entusiasmado com a oportunidade de ${job.title} publicada na ${job.platform.toUpperCase()}.

Acompanhando os desafios da vaga, vejo total sinergia com a minha trajetória, especialmente na aplicação de ${matchedStacks}. Ao longo da minha carreira, foco na construção de soluções escaláveis, limpas e com alto impacto de negócio.

Estou 100% alinhado com o modelo ${job.workplaceType} e pronto para contribuir ativamente com os objetivos da equipe técnica da ${job.company}.

Agradeço a consideração e fico à disposição para as próximas etapas!
Atenciosamente,
${candidateName}
${profile?.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : ''}
${profile?.githubUrl ? `GitHub: ${profile.githubUrl}` : ''}`;

  // 2. Respostas para Perguntas de Triagem do ATS
  const screeningAnswers: CopilotScreeningAnswer[] = [
    {
      question: 'Qual a sua pretensão salarial (CLT e PJ)?',
      suggestedAnswer: profile?.salaryExpectationClt 
        ? `CLT: ${profile.salaryExpectationClt} | PJ: ${profile.salaryExpectationPj || 'A negociar'}`
        : 'A combinar, aberto a proposta de acordo com o plano de carreira da empresa.',
      tip: 'Preencha conforme o padrão solicitado pelo ATS da empresa para evitar descarte automático por faixa indevida.'
    },
    {
      question: 'Qual a sua disponibilidade para início?',
      suggestedAnswer: profile?.screeningAnswers?.availability || 'Imediata ou mediante aviso prévio padrão de 15 a 30 dias.',
      tip: 'Disponibilidade clara transmite segurança ao recrutador.'
    },
    {
      question: 'Qual seu nível de proficiência em Inglês?',
      suggestedAnswer: profile?.screeningAnswers?.englishLevel || 'Intermediário/Avançado para leitura técnica e comunicação assíncrona.',
      tip: 'Se a vaga for nacional, destaque a capacidade de leitura e consumo de documentação.'
    },
    {
      question: 'Você possui experiência comprovada com as stacks principais da vaga?',
      suggestedAnswer: `Sim, possuo sólida experiência prática com ${matchedStacks}, atuando desde a arquitetura até a entrega contínua em produção.`,
      tip: 'Citar as tecnologias exatas da vaga aumenta a pontuação nos filtros automáticos de triagem.'
    },
    {
      question: 'Possui disponibilidade para trabalhar no modelo ' + job.workplaceType.toUpperCase() + '?',
      suggestedAnswer: `Sim, resido em ${profile?.city || 'Brasil'}/${profile?.state || 'BR'} e tenho disponibilidade total e infraestrutura adequada para o modelo ${job.workplaceType}.`,
      tip: 'Confirmação rápida para o filtro geográfico do ATS.'
    }
  ];

  return {
    tailoredPitch,
    screeningAnswers,
    atsKeywordsToHighlight: job.stacks,
    canonicalUrl: job.canonicalUrl,
    recommendedSalary: profile?.salaryExpectationClt || 'A combinar',
  };
}
