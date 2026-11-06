import fs from 'node:fs';

const liveJobs = JSON.parse(fs.readFileSync('src/data/liveJobs.json', 'utf8'));
console.log(`Checking all ${liveJobs.length} jobs in liveJobs.json...`);

async function testAll() {
  const validJobs = [];
  const invalidJobs = [];

  for (const j of liveJobs) {
    try {
      const res = await fetch(j.canonicalUrl, { 
        method: 'HEAD', 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow'
      });
      if (res.ok) {
        validJobs.push(j);
      } else {
        invalidJobs.push({ title: j.title, company: j.company, url: j.canonicalUrl, status: res.status });
      }
    } catch (e) {
      invalidJobs.push({ title: j.title, company: j.company, url: j.canonicalUrl, error: e.message });
    }
  }

  console.log(`\nResult:`);
  console.log(`  Valid (200 OK): ${validJobs.length}`);
  console.log(`  Invalid / Failed: ${invalidJobs.length}`);
  if (invalidJobs.length > 0) {
    console.log('Sample invalid jobs:');
    invalidJobs.slice(0, 5).forEach(inv => console.log('  ', inv));
  }
}

testAll();
