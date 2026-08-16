import assert from 'node:assert/strict';
import test from 'node:test';
import { createRouter } from '../api/router.js';

const user = { id: 7, steem_username: 'player', sf_balance: 0, energy: 3, total_points: 0 };
const db = {};
const router = createRouter({
  db,
  requireUser: async () => user,
  getQuestion: async () => null
});

test('wallet rejects a session belonging to another user', async () => {
  await assert.rejects(() => router.wallet({ session: { userId: 99 } }), /Forbidden/);
});

test('wallet accepts the authenticated owner', async () => {
  const wallet = await router.wallet({ session: { userId: 7 } });
  assert.equal(wallet.username, 'player');
});
