import { CandidateProfile } from '../types';

export const DEFAULT_PROFILE: CandidateProfile = {
  fullName: 'Bruno Bianchi Leo',
  email: '',
  phone: '',
  linkedinUrl: 'https://www.linkedin.com/in/bruno-bianchi-leo/',
  githubUrl: 'https://github.com/BBLBruno',
  portfolioUrl: 'https://radar-concursos-ti.vercel.app',
  resumeExternalUrl: '',
  resumePdfName: '',
  resumePdfDataUrl: '',
  city: 'Muzambinho',
  state: 'MG',
  title: 'Analista de Operações (BizOps), Processos, Inteligência Comercial & Dados',
  summary:
    'Bacharel em Ciência da Computação com atuação na interseção entre Operações de Negócios (BizOps), Inteligência Comercial, Dados/BI e Automação de Processos. Experiência prática no diagnóstico de gargalos operacionais (As-Is / To-Be), acompanhamento de KPIs (CAC, LTV, Conversão, SLA), estruturação de CRM/Onboarding e implementação de fluxos automatizados via N8N, SQL e IA.',
  seniority: 'pleno',
  primaryStacks: [
    'Inteligência de Mercado',
    'Inteligência Comercial',
    'Operações / BizOps',
    'Processos / BPMN',
    'Onboarding / CS',
    'Análise de Dados',
    'Indicadores / KPIs',
    'CRM',
    'HubSpot',
    'Salesforce',
    'Sales Ops',
    'RevOps',
    'Power BI',
    'SQL',
    'N8N',
    'Automação / IA',
    'Excel / Sheets',
  ],
  yearsOfExperience: 3,
  preferredWorkplace: 'qualquer',
  salaryExpectationClt: 'A combinar',
  salaryExpectationPj: 'A combinar',
  background: {
    education:
      'Bacharel em Ciência da Computação — base analítica sólida em bancos de dados (SQL), lógica de sistemas, integração de APIs e modelagem de processos (BPMN).',
    entrepreneurship:
      'Experiência prática em gestão e operação de e-commerce — visão executiva de negócio sobre P&L, eficiência operacional, funil de vendas, retenção e margem.',
    keyMetricCase:
      'Case de Eficiência Operacional: Redução expressiva no volume de chamados manuais de atendimento através do redesenho de processos, automações em N8N e triagem inteligente com IA.',
    operationalPillars:
      'Mapeamento e otimização de processos (Lean / BPMN), análise de dados e construção de dashboards (SQL, Power BI, Excel Avançado), gestão de funil em CRM (HubSpot / Salesforce) e implantação/onboarding técnico de clientes.',
    nicheFocus: [
      'Operações / BizOps',
      'Processos / BPMN',
      'Inteligência de Mercado',
      'Inteligência Comercial',
      'CRM, RevOps & Onboarding',
      'Dados & BI (SQL / Power BI)',
      'Automação & IA (N8N)',
    ],
  },
  preferences: {
    hideAffirmativeJobs: true,
    maxHybridDistanceKm: 150,
    maxHybridDaysPerWeek: 2,
    referenceCity: 'Muzambinho',
    referenceState: 'MG',
  },
  screeningAnswers: {
    availability: 'Disponibilidade imediata para início em modelo 100% remoto ou híbrido.',
    englishLevel: 'Intermediário a Avançado (leitura técnica fluente, ferramentas globais e comunicação escrita).',
    pcd: 'nao',
    willingToRelocate: true,
    leadershipExperience:
      'Vivência prática liderando operações ponta a ponta, alinhamento entre áreas comercial, atendimento e tecnologia, e acompanhamento de metas e indicadores (KPIs/OKRs).',
    customBio:
      'Profissional analítico com formação em Ciência da Computação e mentalidade orientada a negócios, focado em transformar processos manuais em operações escaláveis e orientadas por dados.',
  },
  applicationTrackers: [],
};

const PROFILE_STORAGE_KEY = 'radar_vagas_candidate_profile_v7';
const LEGACY_PREMADE_IDS = new Set([
  'trk_gupy',
  'trk_inhire',
  'trk_greenhouse',
  'trk_solides',
  'trk_linkedin',
]);

export function loadStoredProfile(): CandidateProfile {
  try {
    const raw =
      localStorage.getItem(PROFILE_STORAGE_KEY) ||
      localStorage.getItem('radar_vagas_candidate_profile_v6') ||
      localStorage.getItem('radar_vagas_candidate_profile_v5');
    if (raw) {
      const parsed = JSON.parse(raw);
      const customTrackers = Array.isArray(parsed.applicationTrackers)
        ? parsed.applicationTrackers
            .filter((t: any) => t && t.id && !LEGACY_PREMADE_IDS.has(t.id))
            .map((t: any) => ({
              id: t.id,
              name: t.name || '',
              description: t.description ?? t.notes ?? '',
              url: t.url || '',
            }))
        : [];
      // Remove e-mail/telefone fictícios antigos se ainda forem os de exemplo
      const cleanEmail = parsed.email === 'bruno@example.com' ? '' : parsed.email || '';
      const cleanPhone = parsed.phone === '(35) 99876-5432' ? '' : parsed.phone || '';

      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        email: cleanEmail,
        phone: cleanPhone,
        background: { ...DEFAULT_PROFILE.background, ...parsed.background },
        preferences: { ...DEFAULT_PROFILE.preferences, ...parsed.preferences },
        applicationTrackers: customTrackers,
      };
    }
  } catch (err) {
    console.error('Erro ao ler perfil do localStorage:', err);
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: CandidateProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Erro ao salvar perfil no localStorage:', err);
  }
}
