import { t } from './i18n.js';

const root = document.getElementById('leaderboard');
const AVATAR_RPC = 'https://api.steemit.com';
const API_BASE = String(window.STEEM_FLAGS_API_URL || window.location.origin).replace(/\/$/, '');
const LEADERBOARD_TITLE = '🏆 Steem Flags Leaderboard';
const USER_KEY = 'steemflags.username';

function avatarUrl(username) { return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`; }
function currentUser() { return String(localStorage.getItem(USER_KEY) || '').trim().toLowerCase(); }
function render(rows, yourRank, yourSF) {
  if (!rows.length) { root.innerHTML = `<h2>${LEADERBOARD_TITLE}</h2><p class="muted">${t('leaderboardEmpty')}</p>`; return; }
  const body = rows.map((row, index) => {
    const username = String(row.username ?? row.user ?? '—');
    const sf = Number(row.sf ?? 0);
    const avatar = row.avatar || avatarUrl(username);
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : String(index + 1);
    return `<tr><td class="rank">${medal}</td><td class="leaderPlayer"><img class="leaderAvatar" src="${escapeAttribute(avatar)}" alt="@${escapeAttribute(username)}" loading="lazy" referrerpolicy="no-referrer"><span>@${escapeHtml(username)}</span></td><td>${sf.toLocaleString()} SF</td></tr>`;
  }).join('');
  const mine = yourRank !== null && yourRank !== undefined ? `<div class="leaderboardMe"><strong>Your Rank: #${Number(yourRank).toLocaleString()}</strong><span>Your SF: ${Number(yourSF ?? 0).toLocaleString()} SF</span></div>` : '';
  root.innerHTML = `<h2>${LEADERBOARD_TITLE}</h2><table><thead><tr><th class="rank">${t('rank')}</th><th>${t('player')}</th><th>${t('sf')}</th></tr></thead><tbody>${body}</tbody></table>${mine}`;
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character])); }
function escapeAttribute(value) { return escapeHtml(value); }
async function loadAvatars(rows) {
  const usernames = rows.map(row => row.username).filter(Boolean).slice(0, 100);
  if (!usernames.length) return rows;
  try {
    const response = await fetch(AVATAR_RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'condenser_api.get_accounts', params: [usernames] }), cache: 'no-store' });
    if (!response.ok) return rows;
    const payload = await response.json();
    const accounts = new Map((payload.result || []).map(account => [account.name, account]));
    return rows.map(row => {
      const account = accounts.get(row.username);
      const metadata = account?.json_metadata ? (() => { try { return JSON.parse(account.json_metadata); } catch { return {}; } })() : {};
      const profile = metadata.profile || {};
      return { ...row, avatar: profile.profile_image || avatarUrl(row.username) };
    });
  } catch (error) { console.warn('Steem avatar lookup failed:', error); return rows; }
}
async function syncLocalSF() {
  const username = currentUser();
  if (!username || typeof window.submitGlobalSF !== 'function') return;
  try {
    const raw = localStorage.getItem(`steemflags.state.v2_${encodeURIComponent(username)}`);
    const state = raw ? JSON.parse(raw) : null;
    if (state && Number.isInteger(Number(state.sf))) await window.submitGlobalSF(username, Number(state.sf));
  } catch (error) { console.warn('SF leaderboard sync failed:', error); }
}
async function loadLeaderboard() {
  await syncLocalSF();
  const username = currentUser();
  const endpoint = `${API_BASE}/api/leaderboard?limit=10${username ? `&username=${encodeURIComponent(username)}` : ''}`;
  try {
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Leaderboard HTTP ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : (payload.leaderboard ?? payload.rows ?? []);
    render(await loadAvatars(rows), payload.yourRank, payload.yourSF);
  } catch (error) { console.warn('Steem Flags leaderboard unavailable:', error); root.innerHTML = `<h2>${LEADERBOARD_TITLE}</h2><p class="muted">${t('leaderboardUnavailable')}</p>`; }
}
if (root) { loadLeaderboard(); window.addEventListener('steemflags:sf-changed', loadLeaderboard); setInterval(loadLeaderboard, 10000); }
