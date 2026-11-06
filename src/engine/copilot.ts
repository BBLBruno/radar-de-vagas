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
  const roleTitle =
    profile?.title || 'Analista de Operações (BizOps), Processos, Inteligência Comercial & Dados';
  const matchedStacks =
    job.matchedKeywords && job.matchedKeywords.length > 0
      ? job.matchedKeywords.join(', ')
      : job.stacks.slice(0, 4).join(', ');

  const education =
    profile?.background?.education ||
    'Bacharel em Ciência da Computação — base analítica em SQL, BI, integrações e modelagem de processos (BPMN).';
  const entrepreneurship =
    profile?.background?.entrepreneurship ||
    'Ex-cofundador de operação de e-commerce que faturou R$ 2.5M — visão prática de P&L, funil comercial, retenção e SLA.';
  const keyMetric =
    profile?.background?.keyMetricCase ||
    'Redução comprovada de 60% na demanda manual do SAC através do redesenho de processos, automações em N8N e agentes de IA.';
  const operationalPillars =
    profile?.background?.operationalPillars ||
    'Mapeamento e otimização de processos (Lean / BPMN), análise de dados e construção de dashboards (SQL, Power BI, Excel Avançado), gestão de funil em CRM (HubSpot / Salesforce) e onboarding de clientes.';

  const linksFooter = [
    profile?.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : '',
    profile?.githubUrl ? `GitHub / Portfólio: ${profile.githubUrl}` : '',
    profile?.resumeExternalUrl ? `Currículo (PDF): ${profile.resumeExternalUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const tailoredPitch = `Olá, time de recrutamento e gestão da ${job.company}!

Me chamo ${candidateName} e atuo focado em Operações de Negócios (BizOps), Processos, Inteligência Comercial/Dados e Automação (${roleTitle}).

Ao analisar os desafios da posição de "${job.title}", identifiquei forte alinhamento com minha bagagem prática de mercado:

1. Formação Analítica & Técnica: ${education}
2. Vivência Real de Negócio e Operação: ${entrepreneurship}
3. Resultados Mensuráveis (Método STAR): ${keyMetric}
4. Domínio Prático das Competências da Vaga: Experiência direta com ${matchedStacks}. ${operationalPillars}

Tenho disponibilidade imediata para atuar no modelo ${
    job.workplaceType === 'remoto'
      ? '100% Remoto'
      : job.workplaceType === 'hibrido'
      ? 'Híbrido'
      : 'Presencial'
  } e foco total em gerar ganho de eficiência, visibilidade de indicadores (KPIs) e escala para a operação da ${job.company}.

Fico à disposição para conversarmos sobre como posso agregar ao time desde as primeiras semanas!

Atenciosamente,
${candidateName}
${linksFooter}`;

  const screeningAnswers: CopilotScreeningAnswer[] = [
    {
      question: 'Fale sobre sua trajetória profissional, formação e diferencial para a vaga (Pitch Resumido):',
      suggestedAnswer: `${education} ${entrepreneurship} Atuo conectando processos operacionais, inteligência de dados (SQL / Power BI / KPIs) e automação (CRM / N8N / IA) para eliminar trabalho manual e destravar crescimento.`,
      tip: 'Padrão de mercado: combina base analítica (Computação) + visão de dono (R$ 2.5M) + foco em eficiência.',
    },
    {
      question: 'Compartilhe um case prático onde você otimizou processos, reduziu custos ou gerou eficiência:',
      suggestedAnswer: `${keyMetric} Mapeei os principais motivos de contato (As-Is), desenhei fluxos automatizados de triagem e integração via N8N e IA (To-Be) e implementei indicadores de acompanhamento, liberando a equipe para demandas estratégicas.`,
      tip: 'Estruturado no método STAR (Situação, Tarefa, Ação e Resultado com métrica de 60%).',
    },
    {
      question: 'Como você atua com análise de dados, indicadores (KPIs), CRM e rotina operacional?',
      suggestedAnswer: `${operationalPillars} Utilizo dados para diagnosticar gargalos de conversão, retenção e SLA, garantindo que os processos rodem com previsibilidade e documentação clara.`,
      tip: 'Ideal para perguntas técnicas de BizOps, Inteligência Comercial, Dados, CRM e Implantação/Onboarding.',
    },
    {
      question: 'Qual a sua pretensão salarial (CLT / PJ)?',
      suggestedAnswer: profile?.salaryExpectationClt
        ? `CLT: ${profile.salaryExpectationClt} | PJ: ${profile.salaryExpectationPj || 'A combinar'} (flexível conforme pacote de benefícios e escopo do cargo).`
        : 'Aberto à faixa salarial praticada pela empresa para o nível da posição.',
      tip: 'Mostra transparência e flexibilidade para avançar à etapa de entrevista.',
    },
    {
      question: `Disponibilidade para início e aderência ao modelo (${job.workplaceType.toUpperCase()}):`,
      suggestedAnswer:
        profile?.screeningAnswers?.availability ||
        'Disponibilidade imediata, com estrutura completa para atuação remota ou híbrida e facilidade de adaptação a ferramentas globais.',
      tip: 'Responde de forma objetiva ao critério logístico da triagem.',
    },
  ];

  return {
    tailoredPitch,
    screeningAnswers,
    atsKeywordsToHighlight: job.stacks,
    canonicalUrl: job.canonicalUrl,
    recommendedSalary: profile?.salaryExpectationClt || 'A combinar',
    nicheHighlights: [
      'Bacharel em Ciência da Computação',
      'Ex-cofundador e-commerce R$ 2.5M',
      'Case: -60% demanda manual via N8N & IA',
      'Foco: BizOps, Processos, Dados/BI, CRM & Onboarding',
    ],
  };
}
