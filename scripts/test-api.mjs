async function check() {
  console.log('Testing internet connectivity and ATS APIs...');
  const targets = [
    { name: 'Gupy Portal', url: 'https://portal.gupy.io/api/v1/jobs?jobName=desenvolvedor&limit=5' },
    { name: 'Greenhouse iFood', url: 'https://boards-api.greenhouse.io/v1/boards/ifood/jobs' },
    { name: 'Lever Pipefy', url: 'https://api.lever.co/v0/postings/pipefy?mode=json' },
    { name: 'Greenhouse Nubank', url: 'https://boards-api.greenhouse.io/v1/boards/nubank/jobs' },
    { name: 'Greenhouse QuintoAndar', url: 'https://boards-api.greenhouse.io/v1/boards/quintoandar/jobs' }
  ];

  for (const t of targets) {
    try {
      const res = await fetch(t.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${t.name}] Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : (data.jobs ? data.jobs.length : (data.data ? data.data.length : 'ok'));
        console.log(`  -> Sucesso: ${count} itens encontrados`);
      }
    } catch (e) {
      console.error(`[${t.name}] Erro:`, e.message);
    }
  }
}

check();
