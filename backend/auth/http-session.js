import { requireSession } from './session.js';

export function getSessionFromRequest(request) {
  const session = request?.session;
  return requireSession(session);
}

export function authenticateRequest(request, requireUser) {
  const session = getSessionFromRequest(request);
  return requireUser(request).then((user) => {
    if (String(user.id) !== String(session.userId)) throw new Error('Forbidden');
    return user;
  });
}
