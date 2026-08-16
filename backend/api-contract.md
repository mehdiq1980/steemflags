# API Contract

This contract defines the server-authoritative endpoints before a runtime implementation is attached.

## POST /api/game/start

Creates a game session only when the authenticated user has at least 1 Energy. The server decrements Energy atomically and returns a session id plus the first question.

## POST /api/game/:sessionId/answer

Accepts only the selected option. The server determines correctness from its question data, applies +1/-1 SF, records the transaction and advances the session.

## GET /api/wallet

Returns the authenticated user's SF balance, Energy and transaction summary. No client-supplied balance is accepted.

## POST /api/energy/buy

Consumes SF and adds Energy atomically, subject to the maximum-energy rule.

## POST /api/referrals/claim

Claims a valid referral for a new eligible account. Self-referrals and duplicate claims are rejected. Rewarding must occur inside one database transaction.

## Security requirements

- Authentication is required for all mutation endpoints.
- Server/database state is authoritative.
- Requests must be validated before database writes.
- Mutating operations must be idempotent where retries are possible.
- Never expose database credentials or private blockchain keys to the browser.
