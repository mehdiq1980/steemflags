# Steem RPC Worker

`steem-rpc-proxy.js` is a Cloudflare Worker intended to proxy only `condenser_api.get_accounts` for the Steem Flags login flow.

## Deploy

Deploy this file as a Cloudflare Worker. The deployed Worker URL should then be configured in the frontend as the Steem account lookup endpoint.

The worker does **not** accept or process a Posting Key. It only forwards the public account lookup request.

Allowed browser origins are currently:
- `https://mehdiq1980.github.io`
- `https://steemflags.mehdiq.workers.dev`
