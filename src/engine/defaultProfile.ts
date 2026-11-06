import { CandidateProfile } from '../types';

export const DEFAULT_PROFILE: CandidateProfile = {
  fullName: 'Bruno Desenvolvedor',
  email: 'bruno.dev@example.com',
  phone: '(11) 98765-4321',
  linkedinUrl: 'https://linkedin.com/in/brunodev',
  githubUrl: 'https://github.com/BBLBruno',
  portfolioUrl: 'https://radar-concursos-ti.vercel.app',
  city: 'São Paulo',
  state: 'SP',
  title: 'Engenheiro de Software Full Stack',
  summary: 'Engenheiro de software focado em ecossistema TypeScript, Node.js, React, Next.js e automações de alto impacto. Experiência na construção de aplicações escaláveis, APIs resilientes e agregadores de dados inteligentes.',
  seniority: 'pleno',
  primaryStacks: ['TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'Docker', 'REST', 'Git', 'Tailwind CSS'],
  yearsOfExperience: 4,
  preferredWorkplace: 'remoto',
  salaryExpectationClt: 'R$ 10.000,00',
  salaryExpectationPj: 'R$ 13.000,00',
  screeningAnswers: {
    availability: 'Disponibilidade imediata para início.',
    englishLevel: 'Avançado para leitura técnica e intermediário para conversação.',
    pcd: 'nao',
    willingToRelocate: false,
    leadershipExperience: 'Experiência liderando entregas técnicas em squads ágeis e revisando pull requests.',
    customBio: 'Profissional comprometido com a qualidade de código, padrões limpos e resolução prática de desafios de negócio.',
  }
};

const PROFILE_STORAGE_KEY = 'radar_vagas_candidate_profile';

export function loadStoredProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
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
