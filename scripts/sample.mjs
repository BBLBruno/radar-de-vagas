async function inspect() {
  const res = await fetch('https://boards-api.greenhouse.io/v1/boards/quintoandar/jobs?content=true');
  const data = await res.json();
  console.log('QuintoAndar total jobs:', data.jobs.length);
  const sample = data.jobs[0];
  console.log('Sample Job:', JSON.stringify({
    id: sample.id,
    title: sample.title,
    location: sample.location,
    updated_at: sample.updated_at,
    absolute_url: sample.absolute_url,
  }, null, 2));
}

inspect();
