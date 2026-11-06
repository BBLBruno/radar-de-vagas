import { Job } from '../types';
import liveJobsData from '../data/liveJobs.json';

const getPastDateIso = (daysAgo: number, hoursAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

export const CURATED_NICHE_JOBS: Job[] = [
  {
    id: 'niche_n8n_01',
    title: 'Especialista em Automações de Processos & N8N (AI Ops)',
    company: 'Fintech Hub Brasil',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&crop=faces',
    platform: 'greenhouse',
    canonicalUrl: 'https://boards.greenhouse.io/fintechhub/jobs/892104',
    publishedAt: getPastDateIso(1, 2),
    daysOpen: 1,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'senior',
    stacks: ['N8N', 'AI Agents', 'OpenAI API', 'Webhooks', 'REST APIs', 'PostgreSQL', 'Python'],
    salary: 'R$ 14.000 - R$ 18.000 (CLT / PJ)',
    description: 'Buscamos profissional sênior para liderar a arquitetura e orquestração de fluxos complexos em N8N integrando LLMs (OpenAI/Claude), sistemas legados e esteiras de atendimento e cobrança.',
    requirements: [
      'Domínio avançado em N8N (self-hosted, sub-workflows, filas e nodes customizados)',
      'Experiência integrando modelos de Inteligência Artificial para automação de SAC e backoffice',
      'Criação e consumo de webhooks e APIs REST resilientes',
      'Conhecimento de banco relacional SQL para persistência de dados'
    ],
    benefits: ['100% Home Office definitivo', 'Auxílio tecnologia e internet', 'Plano de saúde Bradesco Top', 'Bônus semestral'],
    isActive: true,
    isAffirmative: false,
    nicheCategories: ['automacao', 'ai_ops'],
  },
  {
    id: 'niche_revops_02',
    title: 'Revenue Operations (RevOps) Lead - HubSpot & CRM',
    company: 'SaaS Growth Scaleup',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop&crop=faces',
    platform: 'lever',
    canonicalUrl: 'https://jobs.lever.co/saasgrowth/b4c3d2e1-0987-6543-210f-edcba9876543',
    publishedAt: getPastDateIso(2, 4),
    daysOpen: 2,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'senior',
    stacks: ['RevOps', 'HubSpot', 'Salesforce', 'CRM', 'Make', 'SQL', 'Metabase'],
    salary: 'R$ 15.000 - R$ 19.500 (CLT)',
    description: 'Liderar a estratégia de RevOps unificando Marketing, Vendas e Customer Success. Mapeamento de funil, governança de dados no CRM e automações de enriquecimento de leads.',
    requirements: [
      'Sólida experiência liderando operações de receita (RevOps) ou Sales Ops em B2B SaaS',
      'Profundo conhecimento de HubSpot CRM / Salesforce e arquitetura de pipeline',
      'Automações entre ferramentas de prospecção, faturamento e CS',
      'Foco em métricas chave: CAC, LTV, Churn, Conversão de pipeline'
    ],
    benefits: ['Stock options', 'Horário flexível', 'Cartão Caju multiflex', 'Gympass'],
    isActive: true,
    isAffirmative: false,
    nicheCategories: ['revops'],
  },
  {
    id: 'niche_po_03',
    title: 'Product Owner (PO) - Automação & Plataforma de Integrações',
    company: 'Omnichannel Corp',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=faces',
    platform: 'gupy',
    canonicalUrl: 'https://omnichannel.gupy.io/job/eyJqb2JJZCI6OTg3NjU0MywidHlwZSI6ImpvYl9ib2FyZCJ9',
    publishedAt: getPastDateIso(2, 1),
    daysOpen: 2,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'pleno',
    stacks: ['Product Owner', 'Analista de Produto', 'Jira', 'BPMN', 'REST APIs', 'Product Discovery'],
    salary: 'R$ 11.000 - R$ 14.500 (CLT)',
    description: 'Gestão de backlog, discovery e entrega de novas features para a plataforma de conectores e automações internas. Alinhamento contínuo com stakeholders de receita e engenharia.',
    requirements: [
      'Atuação como Product Owner ou Analista de Produto em produtos de software/integração',
      'Experiência em levantamento e especificação de requisitos técnicos (APIs, webhooks)',
      'Metodologias ágeis (Scrum/Kanban) e ferramentas de gestão (Jira/Confluence)'
    ],
    benefits: ['Vale alimentação/refeição expressivo', 'Plano médico e dental', 'Day off aniversário'],
    isActive: true,
    isAffirmative: false,
    nicheCategories: ['produto'],
  },
  {
    id: 'niche_salesops_04',
    title: 'Sales Operations (Sales Ops) Analyst Sênior',
    company: 'AgriTech Valley',
    companyLogo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&h=100&fit=crop&crop=faces',
    platform: 'lever',
    canonicalUrl: 'https://jobs.lever.co/agritechvalley/7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
    publishedAt: getPastDateIso(3, 5),
    daysOpen: 3,
    workplaceType: 'hibrido',
    location: 'Ribeirão Preto, SP - Brasil',
    city: 'Ribeirão Preto',
    state: 'SP',
    seniority: 'senior',
    stacks: ['Sales Ops', 'CRM', 'HubSpot', 'N8N', 'SQL', 'BPMN'],
    salary: 'R$ 10.000 - R$ 13.500 (CLT)',
    description: 'Otimização dos processos do time comercial, relatórios de produtividade, automação de cadências e integração com ERP. Modelo híbrido 1x na semana (apenas 135km de Muzambinho).',
    requirements: [
      'Experiência consistente em estruturação de processos comerciais e rotinas de Sales Ops',
      'Automação de tarefas manuais de vendedores e sincronização de dados via N8N/Zapier',
      'Disponibilidade para modelo híbrido flexível de 1 a 2 dias por semana em Ribeirão Preto'
    ],
    benefits: ['Auxílio combustível e pedágio', 'Plano Unimed Nacional', 'Previdência privada'],
    isActive: true,
    isAffirmative: false,
    distanceFromMuzambinhoKm: 135,
    hybridDaysPerWeek: 1,
    nicheCategories: ['revops', 'automacao'],
  },
  {
    id: 'niche_aiops_05',
    title: 'AI Ops & Prompt Engineer - Atendimento Automatizado',
    company: 'NextGen Digital',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=faces',
    platform: 'greenhouse',
    canonicalUrl: 'https://boards.greenhouse.io/nextgendigital/jobs/5544332',
    publishedAt: getPastDateIso(1, 6),
    daysOpen: 1,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'pleno',
    stacks: ['AI Ops', 'OpenAI API', 'N8N', 'Make', 'WhatsApp API', 'LangChain'],
    salary: 'R$ 12.000 - R$ 16.000 (CLT)',
    description: 'Desenvolvimento e monitoramento de agentes de IA para resolução de tíquetes de suporte nível 1 e 2. Otimização de prompts, RAG e orquestração de chamadas de ferramentas.',
    requirements: [
      'Experiência prática em automação de SAC e fluxos de atendimento com IA',
      'Engenharia de prompt, avaliação de alucinações e métricas de satisfação (CSAT)',
      'Integrações com canais de mensageria (WhatsApp/Zendesk/Intercom) via webhooks'
    ],
    benefits: ['Contrato remoto em qualquer lugar do Brasil', 'Auxílio setup home office de R$ 3.000'],
    isActive: true,
    isAffirmative: false,
    nicheCategories: ['ai_ops', 'automacao'],
  },
  {
    id: 'niche_req_06',
    title: 'Analista de Requisitos e Processos de Negócio (BPMN / CRM)',
    company: 'Logística Inteligente',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop&crop=faces',
    platform: 'gupy',
    canonicalUrl: 'https://logistica.gupy.io/job/eyJqb2JJZCI6MzM0NDU1NiwidHlwZSI6ImpvYl9ib2FyZCJ9',
    publishedAt: getPastDateIso(3, 1),
    daysOpen: 3,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'pleno',
    stacks: ['Analista de Requisitos', 'BPMN', 'Jira', 'Confluence', 'CRM', 'SQL'],
    salary: 'R$ 9.500 - R$ 12.000 (CLT)',
    description: 'Mapeamento de fluxos operacionais, especificação de regras de negócio para sistemas internos e ponte entre as áreas de operações e TI.',
    requirements: [
      'Experiência em documentação de requisitos funcionais e não-funcionais',
      'Modelagem de processos em BPMN (Bizagi / Miro)',
      'Conhecimento de fluxos de CRM e esteiras operacionais'
    ],
    benefits: ['Flash multibenefícios', 'Day off', 'Auxílio creche'],
    isActive: true,
    isAffirmative: false,
    nicheCategories: ['produto', 'automacao'],
  }
];

export const SEED_JOBS: Job[] = [
  ...CURATED_NICHE_JOBS,
  ...(liveJobsData as Job[]),
];
