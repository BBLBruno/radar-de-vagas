const companies = [
  'quintoandar', 'vtex', 'gympass', 'hotmart', 'dock', 'nuvemshop', 
  'loggi', 'omie', 'contaazul', 'buser', 'meliuz', 'neon', 'dextra',
  'picpay', 'takeblip', 'maxmilhas', 'creditas', 'enjoei'
];

async function probe() {
  console.log('Probing Greenhouse and Lever for Brazilian Tech companies...');
  for (const c of companies) {
    try {
      const gh = await fetch(`https://boards-api.greenhouse.io/v1/boards/${c}/jobs`);
      if (gh.ok) {
        const d = await gh.json();
        console.log(`[Greenhouse] ${c}: ${d.jobs ? d.jobs.length : 0} vagas`);
      }
    } catch {}

    try {
      const lev = await fetch(`https://api.lever.co/v0/postings/${c}?mode=json`);
      if (lev.ok) {
        const d = await lev.json();
        console.log(`[Lever] ${c}: ${d.length} vagas`);
      }
    } catch {}
  }
}

probe();
