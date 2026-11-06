import { SeniorityLevel, WorkplaceType } from '../types';

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const TECH_STACKS_DICTIONARY = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI', 
  'Java', 'Spring Boot', 'Kotlin', 'Go', 'Golang', 'C#', '.NET', 
  'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Rust', 'Swift', 'Flutter', 
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 
  'CI/CD', 'GitHub Actions', 'GraphQL', 'REST', 'Tailwind CSS', 
  'Kafka', 'RabbitMQ', 'Microservices', 'Clean Architecture', 'TDD'
];

/**
 * Calcula a quantidade de dias em que a vaga está em aberto
 */
export function calculateDaysOpen(publishedAtIso: string): number {
  const publishedDate = new Date(publishedAtIso);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Validação rigorosa: Garante que a vaga é no Brasil ou Remota com contratação no Brasil.
 * Rejeita vagas explicitamente presenciais em outros países.
 */
export function isBrazilJob(location: string, workplaceType: WorkplaceType): boolean {
  if (!location) return workplaceType === 'remoto';

  const normalized = location.toLowerCase();

  // Exclusões explícitas de outros países
  const foreignExclusions = [
    'portugal', 'lisboa', 'porto', 'united states', 'usa', 'estados unidos', 
    'españa', 'spain', 'madrid', 'barcelona', 'germany', 'berlin', 
    'uk', 'london', 'argentina', 'buenos aires', 'chile', 'colombia', 
    'mexico', 'poland', 'canada', 'italy'
  ];

  for (const foreign of foreignExclusions) {
    if (normalized.includes(foreign) && !normalized.includes('brasil') && !normalized.includes('brazil')) {
      return false;
    }
  }

  // Sinais positivos de Brasil
  if (
    normalized.includes('brasil') ||
    normalized.includes('brazil') ||
    normalized.includes('remoto') ||
    normalized.includes('remote') ||
    normalized.includes('home office') ||
    normalized.includes('nacional')
  ) {
    return true;
  }

  // Verifica se contém sigla de estado brasileiro
  for (const uf of BRAZIL_STATES) {
    const regex = new RegExp(`\\b${uf}\\b`, 'i');
    if (regex.test(location)) return true;
  }

  // Principais cidades brasileiras
  const brCities = [
    'são paulo', 'sao paulo', 'rio de janeiro', 'belo horizonte', 'curitiba', 
    'porto alegre', 'florianópolis', 'florianopolis', 'recife', 'salvador', 
    'brasília', 'brasilia', 'fortaleza', 'campinas', 'goiânia', 'manaus', 
    'vitória', 'vitoria', 'santos', 'sorocaba', 'joinville', 'blumenau'
  ];

  return brCities.some(city => normalized.includes(city));
}

/**
 * Identifica o nível de senioridade a partir do título e texto
 */
export function detectSeniority(title: string, description: string = ''): SeniorityLevel {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes('estágio') || text.includes('estagio') || text.includes('intern') || text.includes('estagiário')) {
    return 'estagio';
  }
  if (text.includes('especialista') || text.includes('staff') || text.includes('principal') || text.includes('tech lead') || text.includes('lead engineer')) {
    return 'especialista';
  }
  if (text.includes('sênior') || text.includes('senior') || text.includes('sr.') || text.includes('sr ') || text.includes('iii')) {
    return 'senior';
  }
  if (text.includes('pleno') || text.includes('mid-level') || text.includes('pl.') || text.includes('pl ') || text.includes('ii')) {
    return 'pleno';
  }
  if (text.includes('júnior') || text.includes('junior') || text.includes('jr.') || text.includes('jr ') || text.includes('entry') || text.includes(' i ')) {
    return 'junior';
  }

  return 'pleno'; // Default balanceado
}

/**
 * Identifica a modalidade de trabalho (Remoto, Híbrido, Presencial)
 */
export function detectWorkplaceType(title: string, location: string = '', workplaceRaw: string = ''): WorkplaceType {
  const combined = `${title} ${location} ${workplaceRaw}`.toLowerCase();

  if (combined.includes('híbrido') || combined.includes('hibrido') || combined.includes('hybrid')) {
    return 'hibrido';
  }
  if (
    combined.includes('remoto') || 
    combined.includes('remote') || 
    combined.includes('100% remoto') || 
    combined.includes('teletrabalho') ||
    combined.includes('home office')
  ) {
    return 'remoto';
  }
  if (combined.includes('presencial') || combined.includes('on-site') || combined.includes('onsite')) {
    return 'presencial';
  }

  // Por padrão, se contiver apenas cidade sem menção de remoto, tende a ser híbrido/presencial
  return 'remoto';
}

/**
 * Extrai tecnologias e stacks do texto
 */
export function extractStacks(text: string): string[] {
  const found: string[] = [];
  const normalized = text.toLowerCase();

  for (const stack of TECH_STACKS_DICTIONARY) {
    const stackLower = stack.toLowerCase();
    // Busca exata para evitar falsos positivos como 'c' em 'com'
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escapeRegExp(stackLower)}([^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(normalized)) {
      found.push(stack);
    }
  }

  return Array.from(new Set(found));
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
