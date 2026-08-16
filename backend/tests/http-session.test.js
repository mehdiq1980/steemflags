import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateRequest } from '../auth/http-session.js';

test('authenticates a request whose session owns the user', async () => {
  const user = await authenticateRequest(
    { session: { userId: 4 } },
    async () => ({ id: 4, steem_username: 'player' })
  );
  assert.equal(user.id, 4);
});

test('rejects a request whose session does not own the user', async () => {
  await assert.rejects(
    () => authenticateRequest({ session: { userId: 4 } }, async () => ({ id: 5 })),
    /Forbidden/
  );
});
