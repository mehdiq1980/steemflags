import { t } from './i18n.js';

const root = document.getElementById('leaderboard');

function render(rows) {
  if (!rows.length) { root.innerHTML = `<h2>${t('leaderboardTitle')}</h2><p class="muted">${t('leaderboardEmpty')}</p>`; return; }
  const body = rows.map((row, index) => `<tr><td class="rank">${index + 1}</td><td>${escapeHtml(row.username ?? row.user ?? '—')}</td><td>${Number(row.sf ?? row.balance ?? 0)}</td></tr>`).join('');
  root.innerHTML = `<h2>${t('leaderboardTitle')}</h2><table><thead><tr><th class="rank">${t('rank')}</th><th>${t('player')}</th><th>${t('sf')}</th></tr></thead><tbody>${body}</tbody></table>`;
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character])); }

async function loadLeaderboard() {
  const endpoint = root.dataset.leaderboardEndpoint;
  try {
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Leaderboard HTTP ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : (payload.leaderboard ?? payload.rows ?? []);
    render(rows);
  } catch (error) {
    console.warn('Steem Flags leaderboard unavailable:', error);
    root.innerHTML = `<h2>${t('leaderboardTitle')}</h2><p class="muted">${t('leaderboardUnavailable')}</p>`;
  }
}

if (root) loadLeaderboard();
