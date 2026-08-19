import { t } from './i18n.js';

const root = document.getElementById('leaderboard');
const LEADERBOARD_TITLE = '🏆 Steem Flags Leaderboard';
const USER_KEY = 'steemflags.username';
const DATA_URL = './data/leaderboard.json';

function currentUser() {
  return String(localStorage.getItem(USER_KEY) || '').trim().toLowerCase();
}

function avatarUrl(username) {
  return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function render(rows, me) {
  if (!rows.length) {
    root.innerHTML = `<h2>${LEADERBOARD_TITLE}</h2><p class="muted">${t('leaderboardEmpty')}</p>`;
    return;
  }

  const body = rows.map((row, index) => {
    const username = String(row.username || '—');
    const sf = Number(row.sf || 0);
    const avatar = row.avatar || avatarUrl(username);
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : String(index + 1);
    return `<tr><td class="rank">${medal}</td><td class="leaderPlayer"><img class="leaderAvatar" src="${escapeAttribute(avatar)}" alt="@${escapeAttribute(username)}" loading="lazy" referrerpolicy="no-referrer"><span>@${escapeHtml(username)}</span></td><td>${sf.toLocaleString()} SF</td></tr>`;
  }).join('');

  const mine = me ? `<div class="leaderboardMe"><img class="leaderAvatar" src="${escapeAttribute(me.avatar || avatarUrl(me.username))}" alt="@${escapeAttribute(me.username)}"><div><strong>Your Rank: #${Number(me.rank).toLocaleString()}</strong><span>Your SF: ${Number(me.sf).toLocaleString()} SF</span></div></div>` : '';

  root.innerHTML = `<h2>${LEADERBOARD_TITLE}</h2><table><thead><tr><th class="rank">${t('rank')}</th><th>${t('player')}</th><th>${t('sf')}</th></tr></thead><tbody>${body}</tbody></table>${mine}`;
}

async function loadLeaderboard() {
  try {
    const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Leaderboard HTTP ${response.status}`);
    const data = await response.json();
    const players = data && typeof data.players === 'object' ? data.players : {};

    const rows = Object.entries(players)
      .map(([username, value]) => ({ username, sf: Number(value?.sf || 0), avatar: value?.avatar }))
      .filter(row => Number.isFinite(row.sf))
      .sort((a, b) => b.sf - a.sf || a.username.localeCompare(b.username))
      .slice(0, 100);

    const username = currentUser();
    const myIndex = rows.findIndex(row => row.username === username);
    const me = myIndex >= 0 ? { ...rows[myIndex], rank: myIndex + 1 } : null;
    render(rows, me);
  } catch (error) {
    console.warn('GitHub leaderboard unavailable:', error);
    root.innerHTML = `<h2>${LEADERBOARD_TITLE}</h2><p class="muted">${t('leaderboardUnavailable')}</p>`;
  }
}

if (root) loadLeaderboard();
