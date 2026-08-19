import { t } from './i18n.js';

const root = document.getElementById('leaderboard');
const LEADERBOARD_TITLE = '🏆 Steem Flags Leaderboard';
const DATA_URL = './data/leaderboard.json';

function avatarUrl(username) {
  return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\'\"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function render(rows) {
  const body = rows.map((row, index) => {
    const username = String(row.username || '—');
    const sf = Number(row.sf || 0);
    const avatar = row.avatar || avatarUrl(username);
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : String(index + 1);
    return `<tr><td class="rank">${medal}</td><td class="leaderPlayer"><img class="leaderAvatar" src="${escapeAttribute(avatar)}" alt="@${escapeAttribute(username)}" loading="lazy" referrerpolicy="no-referrer"><span>@${escapeHtml(username)}</span></td><td>${sf.toLocaleString()} SF</td></tr>`;
  }).join('');

  const rewardPool = `<div class="rewardPool"><h3>💰 Weekly $STEEM Rewards Pool</h3><p>✅ Amount: 20 ~ 100 $STEEM</p><p>✅ Distributed to the top 5 gamers on the leaderboard</p></div>`;
  const leaderboardTitle = `<h2>${LEADERBOARD_TITLE}</h2>`;

  if (!document.getElementById('rewardPoolStyle')) {
    const style = document.createElement('style');
    style.id = 'rewardPoolStyle';
    style.textContent = `.rewardPool{margin:12px 0 18px;padding:16px;border:2px solid rgba(255,255,255,.25);border-radius:22px;text-align:center;background:linear-gradient(145deg,#111827,#0f172a);}.rewardPool h3{margin:0 0 12px;font-size:18px}.rewardPool p{margin:6px 0;font-size:15px}`;
    document.head.appendChild(style);
  }

  root.innerHTML = `${leaderboardTitle}${rewardPool}<table><thead><tr><th class="rank">${t('rank')}</th><th>${t('player')}</th><th>${t('sf')}</th></tr></thead><tbody>${body}</tbody></table>`;
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

    render(rows);
  } catch (error) {
    console.warn('GitHub leaderboard unavailable:', error);
    root.innerHTML = `<h2>${LEADERBOARD_TITLE}</h2><div class="rewardPool"><h3>💰 Weekly $STEEM Rewards Pool</h3><p>✅ Amount: 20 ~ 100 $STEEM</p><p>✅ Distributed to the top 5 gamers on the leaderboard</p></div><p class="muted">${t('leaderboardUnavailable')}</p>`;
  }
}

if (root) loadLeaderboard();
