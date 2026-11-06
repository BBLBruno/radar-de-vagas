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
  nicheHighlights: string[];
}

export function generateCopilotKit(job: Job, profile: CandidateProfile | null): CopilotKit {
  const candidateName = profile?.fullName || 'Bruno';
  const roleTitle = profile?.title || 'Especialista em Automações, AI Ops & RevOps';
  const matchedStacks = job.matchedKeywords && job.matchedKeywords.length > 0 
    ? job.matchedKeywords.join(', ')
    : job.stacks.slice(0, 4).join(', ');

  // Dados do background fixo de alto impacto do usuário
  const education = profile?.background?.education || 'Bacharel em Ciência da Computação';
  const entrepreneurship = profile?.background?.entrepreneurship || 'Ex-cofundador de e-commerce de R$ 2.5M';
  const keyMetric = profile?.background?.keyMetricCase || 'Case comprovado de redução de 60% no volume de SAC via N8N e IA';

  // 1. Pitch / Cover Letter de Alta Conversão focado no Background Fixo
  const tailoredPitch = `Olá, time de recrutamento e liderança da ${job.company}!

Me chamo ${candidateName}, sou ${education} e atuo focado na interseção entre tecnologia, automação de processos e resultado de negócio (${roleTitle}).

Acompanhando os desafios da oportunidade de "${job.title}", identifiquei sinergia direta com a minha trajetória prática:

• Visão de Negócio & Produto: Como ${entrepreneurship}, entendo na pele como a eficiência operacional e o alinhamento de processos impactam o faturamento, CAC, LTV e a experiência do cliente.
• Automação & AI Ops na Prática: Construo arquiteturas escaláveis conectando CRMs, ferramentas de produto e fluxos inteligentes com N8N e IA generativa. Tenho como marco um ${keyMetric}, eliminando gargalos manuais e acelerando respostas.
• Domínio das Stacks da Vaga: Experiência sólida e hands-on com ${matchedStacks}.

Estou 100% estruturado para o modelo ${job.workplaceType === 'remoto' ? '100% Remoto' : 'Híbrido flexível'} e pronto para gerar valor imediato na operação da ${job.company}.

Fico à disposição para batermos um papo técnico sobre como posso acelerar as iniciativas da equipe!

Atenciosamente,
${candidateName}
${profile?.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : ''}
${profile?.githubUrl ? `GitHub: ${profile.githubUrl}` : ''}`;

  // 2. Respostas Estratégicas para Perguntas de Triagem dos ATSs
  const screeningAnswers: CopilotScreeningAnswer[] = [
    {
      question: 'Qual o seu background profissional e formação acadêmica?',
      suggestedAnswer: `${education}. ${entrepreneurship}. Atuação focada em AI Ops, RevOps, fluxos de automação com N8N e gestão de produtos digitais com foco em métricas de eficiência.`,
      tip: 'Destaca de imediato a base técnica sólida e a experiência real de gestão de negócio/produto.'
    },
    {
      question: 'Possui experiência comprovada com N8N, integrações e Inteligência Artificial?',
      suggestedAnswer: `Sim. Crio e opero pipelines completos no N8N integrando APIs, webhooks, CRMs e modelos de LLM/OpenAI. Um dos meus principais cases foi a redução de 60% do atendimento do SAC através de agentes autônomos e triagem inteligente de chamados.`,
      tip: 'Apresentar métrica quantitativa (60% de redução) aumenta drasticamente a taxa de resposta.'
    },
    {
      question: 'Como você conecta operações (RevOps / AI Ops) aos objetivos de negócio?',
      suggestedAnswer: `Por ter sido cofundador de operação que faturou R$ 2.5M, não enxergo automações como meros scripts, mas como alavancas de receita e retenção. Mapeio a jornada, elimino fricções no CRM/funil e orquestro os dados para tomadas de decisão ágeis.`,
      tip: 'Excelente resposta para vagas de RevOps, Sales Ops e Product Owner.'
    },
    {
      question: 'Qual a sua pretensão salarial (CLT e PJ)?',
      suggestedAnswer: profile?.salaryExpectationClt 
        ? `CLT: ${profile.salaryExpectationClt} | PJ: ${profile.salaryExpectationPj || 'A combinar'}`
        : 'Aberto a negociação compatível com o impacto estratégico da função.',
      tip: 'Evite deixar em branco; use sua faixa de mercado.'
    },
    {
      question: 'Disponibilidade e modelo de trabalho (' + job.workplaceType.toUpperCase() + '):',
      suggestedAnswer: job.workplaceType === 'remoto'
        ? 'Disponibilidade imediata em regime 100% remoto, com infraestrutura completa de home office e comunicação assíncrona.'
        : `Disponibilidade imediata para modelo híbrido de até 2 dias presenciais na semana, dentro do raio de atuação compatível.`,
      tip: 'Confirmação direta dos critérios estabelecidos para a vaga.'
    }
  ];

  return {
    tailoredPitch,
    screeningAnswers,
    atsKeywordsToHighlight: job.stacks,
    canonicalUrl: job.canonicalUrl,
    recommendedSalary: profile?.salaryExpectationClt || 'R$ 10.000,00',
    nicheHighlights: [
      'Bacharel em Ciência da Computação',
      'Ex-cofundador e-commerce R$ 2.5M',
      'Case: Redução 60% SAC com N8N e IA',
      'Foco: AI Ops, RevOps, Automação & Produto'
    ]
  };
}
