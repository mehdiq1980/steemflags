import { createRouter } from './router.js';

/**
 * Framework-neutral HTTP adapter. The host runtime supplies `db`, `requireUser`
 * and `getQuestion`, keeping secrets and persistence outside the browser bundle.
 */
export function createHttpHandler(deps) {
  const router = createRouter(deps);
  return async function handle(request) {
    const method = request.method?.toUpperCase();
    const path = request.path || request.url || '';

    if (method === 'GET' && path === '/api/wallet') return router.wallet(request);
    if (method === 'POST' && path === '/api/game/start') return router.startGame(request);
    if (method === 'POST' && /^\/api\/game\/[^/]+\/answer$/.test(path)) {
      const sessionId = path.split('/')[3];
      return router.answer({ ...request, params: { ...request.params, sessionId } });
    }
    if (method === 'POST' && path === '/api/referrals/claim') return router.claimReferral(request);

    return { status: 404, error: 'Not found' };
  };
}
