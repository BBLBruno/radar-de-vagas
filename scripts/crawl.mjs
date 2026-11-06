/**
 * Standalone Node.js Crawler Script for ATS Platforms
 * Executável via cron, GitHub Actions ou localmente.
 * 
 * Uso: node scripts/crawl.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const MONITORED_COMPANIES = {
  greenhouse: [
    { slug: 'quintoandar', name: 'QuintoAndar' },
    { slug: 'vtex', name: 'VTEX' },
    { slug: 'gympass', name: 'Wellhub (Gympass)' },
  ],
  lever: [
    { slug: 'neon', name: 'Banco Neon' },
  ],
};

function calculateDaysOpen(isoDate) {
  const diffTime = Math.abs(new Date().getTime() - new Date(isoDate).getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isBrazil(location) {
  if (!location) return true;
  const l = location.toLowerCase();
  if (l.includes('portugal') || l.includes('lisboa') || l.includes('united states') || l.includes('usa') || l.includes('spain') || l.includes('germany') || l.includes('uk')) {
    return false;
  }
  return l.includes('brasil') || l.includes('brazil') || l.includes('remoto') || l.includes('remote') || l.includes('sp') || l.includes('são paulo') || l.includes('rio');
}

function detectWorkplace(title, location) {
  const combined = `${title} ${location}`.toLowerCase();
  if (combined.includes('híbrido') || combined.includes('hibrido') || combined.includes('hybrid')) return 'hibrido';
  if (combined.includes('remoto') || combined.includes('remote') || combined.includes('home office')) return 'remoto';
  if (combined.includes('presencial') || combined.includes('on-site')) return 'presencial';
  return 'remoto';
}

function detectSeniority(text) {
  const l = text.toLowerCase();
  if (l.includes('estágio') || l.includes('estagiário') || l.includes('intern')) return 'estagio';
  if (l.includes('especialista') || l.includes('staff') || l.includes('principal') || l.includes('lead')) return 'especialista';
  if (l.includes('sênior') || l.includes('senior') || l.includes('sr')) return 'senior';
  if (l.includes('pleno') || l.includes('pl') || l.includes('mid')) return 'pleno';
  if (l.includes('júnior') || l.includes('junior') || l.includes('jr')) return 'junior';
  return 'pleno';
}

const TECHS = ['React', 'Next.js', 'Vue.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Golang', 'Java', 'Kotlin', 'Swift', 'Flutter', 'C#', '.NET', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Kafka'];

function extractStacks(text) {
  const found = [];
  for (const t of TECHS) {
    const reg = new RegExp(`(^|[^a-zA-Z0-9#+])${t.toLowerCase()}([^a-zA-Z0-9#+]|$)`, 'i');
    if (reg.test(text)) found.push(t);
  }
  return found;
}

async function scrapeGreenhouse(company) {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = [];

    for (const raw of (data.jobs || [])) {
      const loc = raw.location?.name || '';
      if (!isBrazil(loc)) continue;

      const workplace = detectWorkplace(raw.title, loc);
      const daysOpen = calculateDaysOpen(raw.updated_at);
      const stacks = extractStacks(`${raw.title} ${raw.content || ''}`);

      jobs.push({
        id: `gh_${company.slug}_${raw.id}`,
        title: raw.title,
        company: company.name,
        platform: 'greenhouse',
        canonicalUrl: raw.absolute_url,
        publishedAt: raw.updated_at,
        daysOpen,
        workplaceType: workplace,
        location: loc || 'Brasil',
        seniority: detectSeniority(raw.title),
        stacks: stacks.length > 0 ? stacks : ['Tecnologia', 'Software'],
        description: `Vaga de ${raw.title} na ${company.name}. Inscrição direta via Greenhouse.`,
        requirements: stacks.map(s => `Conhecimento em ${s}`),
        isActive: true,
      });
    }

    console.log(`[Greenhouse] ${company.name}: ${jobs.length} vagas filtradas para o Brasil.`);
    return jobs;
  } catch (err) {
    console.error(`[Greenhouse] Erro em ${company.name}:`, err.message);
    return [];
  }
}

async function scrapeLever(company) {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${company.slug}?mode=json`);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = [];

    for (const raw of data) {
      const loc = raw.categories?.location || '';
      if (!isBrazil(loc)) continue;

      const workplace = detectWorkplace(raw.text, loc);
      const pubIso = new Date(raw.createdAt).toISOString();
      const daysOpen = calculateDaysOpen(pubIso);
      const stacks = extractStacks(`${raw.text} ${raw.descriptionPlain || ''}`);

      jobs.push({
        id: `lever_${company.slug}_${raw.id}`,
        title: raw.text,
        company: company.name,
        platform: 'lever',
        canonicalUrl: raw.hostedUrl,
        publishedAt: pubIso,
        daysOpen,
        workplaceType: workplace,
        location: loc || 'Brasil',
        seniority: detectSeniority(raw.text),
        stacks: stacks.length > 0 ? stacks : ['Tecnologia', 'Software'],
        description: raw.descriptionPlain?.slice(0, 300) || `Oportunidade na ${company.name}. Inscrição direta via Lever.`,
        requirements: stacks.map(s => `Conhecimento em ${s}`),
        isActive: true,
      });
    }

    console.log(`[Lever] ${company.name}: ${jobs.length} vagas filtradas para o Brasil.`);
    return jobs;
  } catch (err) {
    console.error(`[Lever] Erro em ${company.name}:`, err.message);
    return [];
  }
}

async function main() {
  console.log('--- Iniciando Pipeline de Coleta nos ATSs ---');
  const allJobs = [];

  for (const c of MONITORED_COMPANIES.greenhouse) {
    const j = await scrapeGreenhouse(c);
    allJobs.push(...j);
  }

  for (const c of MONITORED_COMPANIES.lever) {
    const j = await scrapeLever(c);
    allJobs.push(...j);
  }

  const outDir = path.resolve('src/data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'liveJobs.json'), JSON.stringify(allJobs, null, 2), 'utf-8');

  console.log(`\n🎉 Pipeline finalizado com sucesso!`);
  console.log(`Total de vagas no Brasil coletadas diretamente dos ATSs: ${allJobs.length}`);
  console.log(`Arquivo salvo em: src/data/liveJobs.json`);
}

main();
