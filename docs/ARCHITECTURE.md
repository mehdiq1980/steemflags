# Steem Flags Architecture

## Source of truth
The GitHub repository is the canonical source for the project. Chat history is not required to reconstruct the implementation.

## Frontend
The existing game is being migrated from the legacy monolithic `index.html` into modules. During the migration the legacy game remains preserved; new modules are introduced incrementally so gameplay is not lost.

Planned frontend areas:
- `css/` — shared, game and responsive styles
- `js/` — application, game, API, wallet, energy and UI modules
- `components/` — reusable UI components such as the hamburger menu
- `pages/` — standalone views where appropriate
- `assets/flags/` — flag assets

## Backend
- Node.js + Express
- PostgreSQL
- REST API under `/api`
- SF balance changes are server-authoritative
- Authentication sessions are stored as hashes; Posting Keys are never persisted
- Scheduled jobs handle daily energy and weekly reward accounting

## Economy rules
- New account: 0 SF
- Correct answer: +1 SF
- Wrong answer: -1 SF, floor at 0
- Video advertisement reward: +2 SF after server-side verification
- Referral: +10 SF to inviter and +10 SF to eligible new user
- Energy: 3 daily free energy; one energy per game; 10 SF buys one additional energy
- 30% of verified advertising revenue is allocated to the weekly STEEM reward pool

## Country exclusion rule
Iran, Russia, North Korea and Cuba must not appear in quiz questions or answer options. This is enforced at data-import/validation level as well as at question selection level.

## Deployment target
Frontend can be hosted on Cloudflare Pages. The stateful API and PostgreSQL database require a backend runtime/database service; they are not assumed to run inside a static Pages deployment.
