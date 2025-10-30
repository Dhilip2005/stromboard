// quick HTTP test script to verify backend endpoints
require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

async function run() {
  const base = `http://localhost:${process.env.PORT || 5000}`;
  try {
    console.log('Testing', base + '/api/ping');
    const ping = await fetch(base + '/api/ping');
    console.log('ping status', ping.status);
    console.log('ping body', await ping.json());

    console.log('Testing create session');
    const create = await fetch(base + '/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionName: 'AutoCreatedSession' })
    });
    console.log('create status', create.status);
    const data = await create.json().catch(() => null);
    console.log('create body', data);
  } catch (err) {
    console.error('HTTP test error:', err);
    process.exit(1);
  }
}

run();
