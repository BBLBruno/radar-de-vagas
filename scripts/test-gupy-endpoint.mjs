async function testGupy() {
  const urls = [
    'https://portal.gupy.io/api/job?name=revops',
    'https://portal.gupy.io/api/v1/jobs?jobName=n8n',
    'https://nubank.gupy.io/api/v1/jobs',
    'https://itau.gupy.io/api/v1/jobs',
    'https://stone.gupy.io/api/v1/jobs',
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://portal.gupy.io/'
        }
      });
      const ct = res.headers.get('content-type') || '';
      console.log(`URL: ${u}`);
      console.log(`Status: ${res.status} | Content-Type: ${ct}`);
      if (res.ok && ct.includes('json')) {
        const d = await res.json();
        console.log(`  -> Sucesso: ${Array.isArray(d) ? d.length : (d.data ? d.data.length : 'obj')} registros`);
        const first = Array.isArray(d) ? d[0] : (d.data ? d.data[0] : null);
        if (first) {
          console.log(`  -> Exemplo título: ${first.name}`);
          console.log(`  -> Exemplo jobUrl: ${first.jobUrl}`);
        }
      }
    } catch (e) {
      console.log(`Erro em ${u}:`, e.message);
    }
  }
}
testGupy();
