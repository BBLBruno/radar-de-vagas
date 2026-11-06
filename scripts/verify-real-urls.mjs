const companies = [
  { slug: 'quintoandar', name: 'QuintoAndar' },
  { slug: 'vtex', name: 'VTEX' },
  { slug: 'gympass', name: 'Wellhub (Gympass)' },
  { slug: 'rdstation', name: 'RD Station' },
  { slug: 'pipefy', name: 'Pipefy' },
  { slug: 'nuvemshop', name: 'Nuvemshop' },
  { slug: 'creditas', name: 'Creditas' },
  { slug: 'neon', name: 'Banco Neon', platform: 'lever' },
  { slug: 'dasa', name: 'Dasa Tech', platform: 'lever' }
];

async function verify() {
  console.log('--- TESTANDO URLS REAIS DE VAGAS NOS ATSs ---');
  for (const c of companies) {
    try {
      if (c.platform === 'lever') {
        const res = await fetch(`https://api.lever.co/v0/postings/${c.slug}?mode=json`);
        if (res.ok) {
          const list = await res.json();
          const first = list[0];
          if (first) {
            const head = await fetch(first.hostedUrl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(`[Lever] ${c.name} (${head.status}): ${first.text} -> ${first.hostedUrl}`);
          }
        }
      } else {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${c.slug}/jobs`);
        if (res.ok) {
          const data = await res.json();
          const first = (data.jobs || [])[0];
          if (first) {
            const head = await fetch(first.absolute_url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(`[Greenhouse] ${c.name} (${head.status}): ${first.title} -> ${first.absolute_url}`);
          }
        }
      }
    } catch (e) {
      console.log(`Erro em ${c.name}:`, e.message);
    }
  }
}

verify();
