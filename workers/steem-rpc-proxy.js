const ALLOWED_ORIGINS = new Set([
  'https://mehdiq1980.github.io',
  'https://steemflags.mehdiq.workers.dev'
]);
const STEEM_RPC = 'https://api.steemit.com';

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'null';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), { status: 405, headers });
    }
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response(JSON.stringify({ error: 'ORIGIN_NOT_ALLOWED' }), { status: 403, headers });
    }

    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: 'INVALID_JSON' }), { status: 400, headers }); }

    if (body?.method !== 'condenser_api.get_accounts' || !Array.isArray(body?.params)) {
      return new Response(JSON.stringify({ error: 'INVALID_RPC_REQUEST' }), { status: 400, headers });
    }

    const upstream = await fetch(STEEM_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'condenser_api.get_accounts', params: body.params, id: body.id ?? 1 })
    });

    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers });
  }
};
