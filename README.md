# Steem Flags

Guess the Flags & Earn $STEEM.

## GitHub-only SF architecture

The global SF leaderboard is hosted entirely in this repository.

- `data/leaderboard.json` is the global SF source of truth.
- `js/leaderboard.js` reads and ranks the JSON file.
- Completed games open a prefilled GitHub SF-event issue; the player submits it on GitHub.
- `.github/workflows/process-sf-issues.yml` validates the submitted event and updates the leaderboard with the workflow's `GITHUB_TOKEN`.
- `.github/workflows/process-sf-events.yml` remains available for repository event files.
- `.github/workflows/validate-leaderboard.yml` validates leaderboard structure.
- No Cloudflare Worker, D1, PostgreSQL, Express, or external leaderboard database is required by the repository.

### Security boundary

The browser never receives a GitHub write token. The GitHub issue is only an input queue; GitHub Actions is the only component that writes `leaderboard.json`.

Because a public browser cannot create a GitHub issue invisibly without authentication, the player must press **Submit new issue** after the game opens the prefilled event. This is GitHub-only and near-real-time, but it is not a cryptographic proof that the game was played honestly. A stronger anti-cheat design would require a trusted verifier outside a static GitHub Pages site.
