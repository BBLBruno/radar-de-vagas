import { Job } from '../types';
import liveJobsData from '../data/liveJobs.json';

// Helper para gerar datas relativas recentes
const getPastDateIso = (daysAgo: number, hoursAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

export const CURATED_SEED_JOBS: Job[] = [
  {
    id: 'gupy_nubank_01',
    title: 'Software Engineer - Backend (Go / Microservices)',
    company: 'Nubank',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&crop=faces',
    platform: 'gupy',
    canonicalUrl: 'https://nubank.gupy.io/job/eyJqb2JJZCI6NjU0MTIzOCwidHlwZSI6ImpvYl9ib2FyZCJ9',
    publishedAt: getPastDateIso(1, 4),
    daysOpen: 1,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'pleno',
    stacks: ['Go', 'Kafka', 'Docker', 'Kubernetes', 'Microservices', 'AWS', 'PostgreSQL'],
    salary: 'R$ 13.000 - R$ 17.500 (CLT)',
    description: 'Buscamos Engenheira(o) de Software Backend Pleno para atuar na evolução de nossa arquitetura de microsserviços de alta escala e disponibilidade no ecossistema de pagamentos instantâneos.',
    requirements: [
      'Sólida experiência com Go (Golang) ou linguagens funcionais/concorrentes',
      'Arquitetura orientada a eventos com Kafka ou RabbitMQ',
      'Boas práticas de Clean Architecture e testes automatizados',
      'Vivência com ambientes cloud (AWS/GCP) e orquestração de containers'
    ],
    benefits: ['Vale Refeição/Alimentação', 'Plano de Saúde e Odonto sem coparticipação', 'Auxílio Home Office mensal', 'Gympass', 'PPR'],
    isActive: true,
  },
  {
    id: 'lever_mercadolivre_02',
    title: 'Desenvolvedor Frontend Sênior (React / TypeScript / Next.js)',
    company: 'Mercado Livre',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop&crop=faces',
    platform: 'lever',
    canonicalUrl: 'https://jobs.lever.co/mercadolivre/9a1f23c4-e8b2-4d1a-9635-01a2b3c4d5e6',
    publishedAt: getPastDateIso(2, 6),
    daysOpen: 2,
    workplaceType: 'hibrido',
    location: 'São Paulo, SP - Brasil',
    city: 'São Paulo',
    state: 'SP',
    seniority: 'senior',
    stacks: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'CI/CD'],
    salary: 'R$ 16.000 - R$ 21.000 (CLT)',
    description: 'Faça parte do time que desenvolve as principais interfaces de compras e checkout do Mercado Livre, impactando mais de 100 milhões de usuários na América Latina com foco em performance e Core Web Vitals.',
    requirements: [
      'Profundo conhecimento do ecossistema React moderno e TypeScript',
      'Otimização de performance web, SSR e hydration com Next.js',
      'Testes unitários e de integração com Jest/Testing Library/Playwright',
      'Capacidade de liderar iniciativas técnicas e mentoria de devs'
    ],
    benefits: ['Bônus anual por performance', 'Previdência privada', 'Descontos no Mercado Livre e Meli+', 'Seguro saúde premium'],
    isActive: true,
  },
  {
    id: 'greenhouse_ifood_03',
    title: 'Senior Data Engineer (Python / Spark / AWS)',
    company: 'iFood',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=faces',
    platform: 'greenhouse',
    canonicalUrl: 'https://boards.greenhouse.io/ifood/jobs/5421980',
    publishedAt: getPastDateIso(3, 2),
    daysOpen: 3,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'senior',
    stacks: ['Python', 'AWS', 'PostgreSQL', 'Docker', 'Terraform', 'Kafka'],
    salary: 'R$ 15.000 - R$ 19.500 (CLT)',
    description: 'Venha construir os pipelines de dados em tempo real que alimentam a precificação dinâmica, rotas de entrega e modelos de machine learning do maior app de delivery do Brasil.',
    requirements: [
      'Experiência consolidada com Python aplicado a engenharia de dados em grande escala',
      'Processamento batch e streaming com Spark, Kafka e Lakehouse',
      'Infraestrutura como código com Terraform e ecossistema AWS (S3, EMR, Athena)',
      'Modelagem dimensional e bancos analíticos'
    ],
    benefits: ['Saldo livre flexível no iFood Benefícios', 'TotalPass', 'Subsídio para cursos e certificações', 'Horário flexível'],
    isActive: true,
  },
  {
    id: 'gupy_stone_04',
    title: 'Desenvolvedora / Desenvolvedor Full Stack Júnior (Node.js / React)',
    company: 'Stone Co.',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=faces',
    platform: 'gupy',
    canonicalUrl: 'https://stone.gupy.io/job/eyJqb2JJZCI6Nzg5MTIzMCwidHlwZSI6ImpvYl9ib2FyZCJ9',
    publishedAt: getPastDateIso(2, 1),
    daysOpen: 2,
    workplaceType: 'hibrido',
    location: 'Rio de Janeiro, RJ - Brasil',
    city: 'Rio de Janeiro',
    state: 'RJ',
    seniority: 'junior',
    stacks: ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'Git', 'REST'],
    salary: 'R$ 5.500 - R$ 7.500 (CLT)',
    description: 'Programa de desenvolvimento acelerado para desenvolvedores juniores que queiram dominar arquitetura de meios de pagamento digitais e maquininhas da Stone.',
    requirements: [
      'Conhecimento prático em JavaScript/TypeScript e Node.js',
      'Noções sólidas de consumo de APIs REST e bancos relacionais SQL',
      'Vontade de aprender e cultura de ownership/não conformismo'
    ],
    benefits: ['Plano de saúde e dental', 'Vale refeição expressivo', 'Auxílio creche', 'Parceria com universidades'],
    isActive: true,
  },
  {
    id: 'inhire_picpay_05',
    title: 'DevOps / Cloud Platform Engineer Pleno (Kubernetes / Terraform / GCP)',
    company: 'PicPay',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop&crop=faces',
    platform: 'inhire',
    canonicalUrl: 'https://picpay.inhire.app/vagas/c3b1a8f9-7d24-4e89-a1b2-c3d4e5f6a7b8',
    publishedAt: getPastDateIso(4, 5),
    daysOpen: 4,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'pleno',
    stacks: ['Kubernetes', 'Terraform', 'GCP', 'Docker', 'CI/CD', 'GitHub Actions', 'Microservices'],
    salary: 'R$ 11.000 - R$ 15.000 (CLT)',
    description: 'Atue na criação e manutenção de plataformas de engenharia (Internal Developer Platform), garantindo pipelines ágeis, observabilidade e confiabilidade para centenas de desenvolvedores.',
    requirements: [
      'Vivência operacional com clusters Kubernetes em produção',
      'Infraestrutura como código com Terraform e automação de CI/CD',
      'Monitoramento com Prometheus, Grafana e OpenTelemetry'
    ],
    benefits: ['Cartão Caju multiflex', 'Plano médico Bradesco Top', 'Wellhub', 'Day off de aniversário'],
    isActive: true,
  },
  {
    id: 'gupy_inter_08',
    title: 'Estágio em Desenvolvimento de Software (Python / Web)',
    company: 'Banco Inter',
    companyLogo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&h=100&fit=crop&crop=faces',
    platform: 'gupy',
    canonicalUrl: 'https://inter.gupy.io/job/eyJqb2JJZCI6OTAxMjM0NSwidHlwZSI6ImpvYl9ib2FyZCJ9',
    publishedAt: getPastDateIso(3, 4),
    daysOpen: 3,
    workplaceType: 'hibrido',
    location: 'Belo Horizonte, MG - Brasil',
    city: 'Belo Horizonte',
    state: 'MG',
    seniority: 'estagio',
    stacks: ['Python', 'PostgreSQL', 'Git', 'REST'],
    salary: 'Bolsa R$ 2.400 + Benefícios',
    description: 'Oportunidade de estágio no Super App do Inter. Aprenda com os melhores engenheiros do mercado em um ambiente dinâmico e inovador.',
    requirements: [
      'Matrícula ativa em Ciência da Computação, Engenharia de Software, SI ou cursos correlatos',
      'Formatura prevista a partir de dezembro de 2027',
      'Lógica de programação apurada e fundamentos de orientação a objetos'
    ],
    benefits: ['Bolsa estágio competitiva', 'Vale transporte e refeição', 'Seguro de vida', 'Trilha de efetivação'],
    isActive: true,
  },
  {
    id: 'gupy_hotmart_10',
    title: 'Engenheiro de Software Pleno - Backend (.NET / C#)',
    company: 'Hotmart',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=100&fit=crop&crop=faces',
    platform: 'gupy',
    canonicalUrl: 'https://hotmart.gupy.io/job/eyJqb2JJZCI6MTEyMjMzNCwidHlwZSI6ImpvYl9ib2FyZCJ9',
    publishedAt: getPastDateIso(4, 1),
    daysOpen: 4,
    workplaceType: 'remoto',
    location: 'Remoto - Brasil',
    seniority: 'pleno',
    stacks: ['C#', '.NET', 'PostgreSQL', 'RabbitMQ', 'AWS', 'Docker', 'TDD'],
    salary: 'R$ 11.500 - R$ 14.500 (CLT)',
    description: 'Desenvolva soluções de monetização e infraestrutura de pagamentos para criadores de conteúdo do mundo todo na plataforma da Hotmart.',
    requirements: [
      'Experiência em .NET Core / .NET 8 e C#',
      'Modelagem relacional e otimização de queries com PostgreSQL/SQL Server',
      'Cultura ágil e testes unitários e de integração com xUnit'
    ],
    benefits: ['Cartão flexível Flash', 'Day off no aniversário', 'Reembolso de cursos', 'Plano médico Amil'],
    isActive: true,
  }
];

// Unifica os dados curados com as 140 vagas reais coletadas via crawler
export const SEED_JOBS: Job[] = [
  ...CURATED_SEED_JOBS,
  ...(liveJobsData as Job[]),
];
