# Steem Flags

Guess the Flags & Earn $STEEM.

## Data architecture

The global SF leaderboard is GitHub-hosted.

- `data/leaderboard.json` stores leaderboard data.
- `js/leaderboard.js` reads and ranks the GitHub JSON file.
- `.github/workflows/validate-leaderboard.yml` validates leaderboard changes.
- No Cloudflare Worker, D1, PostgreSQL, Express, or external leaderboard API is required by the repository.

> GitHub is the source of truth for the leaderboard data. Automated player write access requires a future GitHub-native workflow design; browser code never receives a GitHub write token.
