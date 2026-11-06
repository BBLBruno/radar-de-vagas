import fs from 'node:fs';

const jobs = JSON.parse(fs.readFileSync('src/data/liveJobs.json', 'utf8'));
console.log('Total liveJobs:', jobs.length);
jobs.slice(0, 15).forEach(j => {
  console.log(`[${j.platform}] ${j.company} - ${j.title}`);
  console.log(`   URL: ${j.canonicalUrl}`);
});
