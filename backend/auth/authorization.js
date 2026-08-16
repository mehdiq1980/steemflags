import { requireSession } from './session.js';

export function authorizeUser(session, resourceUserId) {
  const authenticated = requireSession(session);
  if (String(authenticated.userId) !== String(resourceUserId)) {
    throw new Error('Forbidden');
  }
  return authenticated;
}

export function authorizeMutation(session, resourceUserId) {
  return authorizeUser(session, resourceUserId);
}
