import fs from 'node:fs';

const liveJobs = JSON.parse(fs.readFileSync('src/data/liveJobs.json', 'utf8'));

console.log('--- AMOSTRA DE VAGAS REAIS EM LIVEJOBS ---');
liveJobs.slice(0, 20).forEach((j, i) => {
  console.log(`${i+1}. [${j.company}] ${j.title}`);
  console.log(`   Link: ${j.canonicalUrl}`);
  console.log(`   Stacks: ${j.stacks.join(', ')}`);
});
