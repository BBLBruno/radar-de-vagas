import fs from 'node:fs';

const liveJobs = JSON.parse(fs.readFileSync('src/data/liveJobs.json', 'utf8'));
console.log('--- DIAGNÓSTICO DE LINKS ---');
console.log('Total vagas liveJobs:', liveJobs.length);

const platforms = {};
liveJobs.forEach(j => {
  platforms[j.platform] = (platforms[j.platform] || 0) + 1;
});
console.log('Plataformas em liveJobs:', platforms);

async function testUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    return res.status;
  } catch (e) {
    return `ERR: ${e.message}`;
  }
}

async function run() {
  console.log('\nTestando as primeiras 10 vagas de liveJobs:');
  for (let i = 0; i < Math.min(10, liveJobs.length); i++) {
    const j = liveJobs[i];
    const status = await testUrl(j.canonicalUrl);
    console.log(`[${status}] ${j.company} -> ${j.canonicalUrl}`);
  }
}

run();
