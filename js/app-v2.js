import { loadState, saveState, resetState, getStoredUsername, setStoredUsername, clearStoredUsername } from './storage.js?v=20260824-d1-game-02';
import { refreshLeaderboardSF } from './sf-balance.js?v=20260820-03';
import { FlagGame } from './game.js';
import { loadProgress, recordAnswer, recordGame, saveProgress, accuracy } from './progression.js';
import { applyLanguage, getLanguage, t, setLanguage } from './i18n.js';
import { verifyPostingKey } from './steem-auth.js';
import { saveGameResult } from './reward.js?v=20260824-d1-game-02';

const API_BASE = 'https://steemflags.mehdiq.workers.dev';
const GAME_STATE_PREFIX = 'steemFlags.incompleteGame.v2_';
const $ = id => document.getElementById(id);
const gameStateKey = username => `${GAME_STATE_PREFIX}${encodeURIComponent(String(username).trim().toLowerCase())}`;

function loadIncompleteGame(username) {
  if (!username) return null;
  try { return JSON.parse(localStorage.getItem(gameStateKey(username)) || 'null'); } catch { return null; }
}
function saveIncompleteGame(username, game) {
  if (username && game.hasProgress()) localStorage.setItem(gameStateKey(username), JSON.stringify(game.serialize()));
}
function clearIncompleteGame(username) { if (username) localStorage.removeItem(gameStateKey(username)); }

async function loadComponent() {
  const response = await fetch('./components/app-shell.html?v=20260824-d1-game-05', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load component: ${response.status}`);
  return response.text();
}
async function fetchAccount(username) {
  const response = await fetch(`${API_BASE}/api/account?username=${encodeURIComponent(username)}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`ACCOUNT_API_${response.status}`);
  const data = await response.json();
  if (!data?.success || !data.account) throw new Error('ACCOUNT_API_INVALID');
  return data.account;
}
async function startGameOnServer(username) {
  const response = await fetch(`${API_BASE}/api/game/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }), cache: 'no-store' });
  const data = await response.json();
  if (!response.ok || !data?.success) throw new Error(data?.error || `GAME_START_${response.status}`);
  return data.account;
}
async function fetchSteemBalance(account) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'condenser_api.get_accounts', params: [[account]] });
  for (const endpoint of ['https://api.steemit.com', 'https://api.steem.house', 'https://api.steemyy.com', 'https://api.steemworld.org']) {
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store' });
      if (!response.ok) continue;
      const data = await response.json();
      const balance = data?.result?.[0]?.balance;
      if (typeof balance === 'string' && /\d/.test(balance)) return balance.replace(/\s*STEEM\s*$/i, '').trim();
    } catch (error) { console.warn('STEEM endpoint failed', endpoint, error); }
  }
  return null;
}

async function bootstrap() {
  const app = $('app');
  if (!app) throw new Error('APP_CONTAINER_MISSING');
  app.innerHTML = await loadComponent();
  start();
}

function start() {
  let username = getStoredUsername();
  let state = loadState(username);
  let progress = loadProgress(username);
  let postingKey = null;

  const loginView = $('loginView');
  const home = $('homeView');
  const leaderboard = $('leaderboardSection');
  const gameView = $('gameView');
  const answers = $('answers');
  const feedback = $('feedback');
  const next = $('nextButton');
  const energy = $('energyValue');
  const d2e = $('sfValue');
  const steem = $('steemValue');
  const assets = $('assetStats');
  const counter = $('questionCounter');
  const score = $('scoreLabel');
  const flag = $('flagImage');
  const newButton = $('newGameButton');
  const resumeButton = $('resumeGameButton');
  const summary = $('progressSummary');
  const loginForm = $('loginForm');
  const usernameInput = $('usernameInput');
  const loginFeedback = $('loginFeedback');
  const loggedIn = $('loggedInUser');
  const language = $('languageSelect');
  const progressBar = $('quizProgressBar');
  const info = $('countryInfoLink');

  if (!loginForm || !loginView || !home || !gameView || !newButton) throw new Error('REQUIRED_UI_MISSING');

  let key = $('postingKeyInput');
  if (!key) {
    key = document.createElement('input');
    key.id = 'postingKeyInput';
    key.type = 'password';
    key.required = true;
    key.autocomplete = 'off';
    loginForm.insertBefore(key, $('loginButton'));
  }

  const game = new FlagGame(renderQuestion);

  function getLogoutButton() { return document.querySelector('[data-action="logout"]'); }
  function setLogoutVisible(visible) {
    const button = getLogoutButton();
    if (button) button.hidden = !visible;
  }
  function bindLogout() {
    const button = getLogoutButton();
    if (!button || button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    button.addEventListener('click', event => {
      event.preventDefault();
      clearStoredUsername();
      username = null;
      postingKey = null;
      game.reset();
      loginView.hidden = false;
      home.hidden = true;
      leaderboard.hidden = true;
      gameView.hidden = true;
      setLogoutVisible(false);
      hideInfo();
    });
  }

  function hideInfo() {
    if (!info) return;
    info.hidden = true;
    info.removeAttribute('href');
    info.style.display = 'none';
  }
  function showInfo(name) {
    if (!info) return;
    const lang = getLanguage();
    const host = lang === 'fa' ? 'fa' : lang === 'es' ? 'es' : 'en';
    info.textContent = 'ℹ️ More information about this country';
    info.href = `https://${host}.wikipedia.org/wiki/${encodeURIComponent(String(name).trim().replace(/ /g, '_'))}`;
    info.hidden = false;
    info.style.display = 'block';
  }

  async function syncAccountFromD1() {
    if (!username) return null;
    const account = await fetchAccount(username);
    state = loadState(username);
    state.sf = Number(account.D2E) || 0;
    state.energy = Number(account.Energy) || 0;
    saveState(state, username);
    d2e.textContent = String(state.sf);
    energy.textContent = String(state.energy);
    newButton.disabled = state.energy <= 0;
    return account;
  }

  async function updateStats() {
    if (username) await syncAccountFromD1(); else state = loadState();
    energy.textContent = String(state.energy);
    newButton.disabled = !username || state.energy <= 0;
    if (assets) assets.hidden = !username;
    if (summary) summary.hidden = !username;
    if (resumeButton) resumeButton.hidden = !Boolean(username && loadIncompleteGame(username));
    if (username) {
      summary.textContent = `${t('gamesLabel')}: ${progress.games} · ${t('accuracyLabel')}: ${accuracy(progress)}%`;
      loggedIn.textContent = `${t('loggedInAs')} @${username}`;
      d2e.textContent = String(state.sf);
      refreshLeaderboardSF(username, d2e);
      const balance = await fetchSteemBalance(username);
      if (balance !== null && steem) steem.textContent = balance;
    }
    bindLogout();
  }

  function setProgress(number) {
    const value = Math.max(0, Math.min(game.totalQuestions, Number(number) || 0));
    if (progressBar) {
      progressBar.style.width = `${(value / game.totalQuestions) * 100}%`;
      progressBar.setAttribute('aria-valuenow', String(value));
    }
  }
  function renderQuestion(question, points, number) {
    counter.textContent = `${t('question')} ${number} ${t('of')} ${game.totalQuestions}`;
    score.textContent = `${t('score')}: ${points}`;
    setProgress(number);
    flag.textContent = question.country[1];
    answers.replaceChildren();
    feedback.textContent = '';
    feedback.className = 'feedback';
    next.hidden = true;
    hideInfo();
    question.options.forEach(([name]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer';
      button.textContent = name;
      button.onclick = () => chooseAnswer(button, name);
      answers.appendChild(button);
    });
  }
  function chooseAnswer(button, name) {
    if (game.answered || game.completed || !username) return;
    const result = game.answer(name);
    if (!result) return;
    progress = recordAnswer(progress, result.correct);
    if (result.correct) {
      state.sf += 1;
      feedback.textContent = `${t('correct')} +1 D2E`;
      feedback.className = 'feedback ok';
      button.classList.add('correct');
    } else {
      state.sf -= 1;
      feedback.textContent = `${t('wrong')} ${result.answer}`;
      feedback.className = 'feedback bad';
      button.classList.add('wrong');
    }
    for (const item of answers.children) {
      item.disabled = true;
      if (item.textContent === result.answer) item.classList.add('correct');
    }
    saveState(state, username);
    saveProgress(progress, username);
    saveIncompleteGame(username, game);
    d2e.textContent = String(Math.max(0, state.sf));
    showInfo(result.answer);
    next.hidden = false;
  }
  function showHome() {
    loginView.hidden = true;
    home.hidden = false;
    leaderboard.hidden = false;
    gameView.hidden = true;
    hideInfo();
    bindLogout();
    setLogoutVisible(true);
    updateStats().catch(error => console.error('Stats refresh failed', error));
  }
  function showGame() {
    loginView.hidden = true;
    home.hidden = true;
    leaderboard.hidden = true;
    gameView.hidden = false;
    hideInfo();
  }
  async function newGame() {
    if (!username) return;
    newButton.disabled = true;
    try {
      const account = await startGameOnServer(username);
      state = loadState(username);
      state.energy = Number(account.Energy) || 0;
      state.sf = Number(account.D2E) || 0;
      saveState(state, username);
      clearIncompleteGame(username);
      game.reset();
      progress = recordGame(progress);
      saveProgress(progress, username);
      showGame();
      game.next();
      saveIncompleteGame(username, game);
      energy.textContent = String(state.energy);
      d2e.textContent = String(state.sf);
    } catch (error) {
      console.error('Unable to start game', error);
      feedback.textContent = error?.message || 'Unable to start game.';
      feedback.className = 'feedback bad';
      await updateStats();
    }
  }
  function resumeGame() {
    const saved = loadIncompleteGame(username);
    if (!saved || !game.restore(saved)) {
      clearIncompleteGame(username);
      updateStats();
      return;
    }
    showGame();
    saveIncompleteGame(username, game);
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const account = usernameInput.value.trim().toLowerCase();
    const posting = key.value.trim();
    if (!/^[a-z0-9.-]{3,32}$/.test(account) || !posting) {
      loginFeedback.textContent = t('invalidPostingKey');
      return;
    }
    try {
      await verifyPostingKey(account, posting);
      postingKey = globalThis.dsteem?.PrivateKey?.fromString(posting) || null;
      username = setStoredUsername(account);
      await syncAccountFromD1();
      key.value = '';
      progress = loadProgress(username);
      showHome();
    } catch (error) {
      postingKey = null;
      console.error('Login failed', error);
      loginFeedback.textContent = error?.message || t('invalidPostingKey');
    }
  });

  if (language) {
    language.addEventListener('change', () => {
      setLanguage(language.value);
      applyLanguage(document, getLanguage());
      if (!gameView.hidden && game.current) renderQuestion(game.current, game.score, game.questionNumber);
    });
  }
  newButton.onclick = newGame;
  if (resumeButton) resumeButton.onclick = resumeGame;
  next.onclick = async () => {
    if (!game.isComplete()) {
      game.next();
      saveIncompleteGame(username, game);
      return;
    }
    const eventId = `${username}-${Date.now()}-${crypto.randomUUID()}`;
    const result = await saveGameResult({ username, score: game.score, eventId });
    if (!result.success) {
      feedback.textContent = result.error || 'Unable to save game result. Please try again.';
      feedback.className = 'feedback bad';
      return;
    }
    clearIncompleteGame(username);
    state = result.account;
    state.sf = Number(result.account.D2E) || 0;
    state.energy = Number(result.account.Energy) || 0;
    saveState(state, username);
    d2e.textContent = String(state.sf);
    energy.textContent = String(state.energy);
    showHome();
  };
  document.querySelectorAll('[data-action="home"]').forEach(button => button.addEventListener('click', showHome));
  document.querySelectorAll('[data-action="reset"]').forEach(button => button.addEventListener('click', () => { clearIncompleteGame(username); game.reset(); showHome(); }));
  applyLanguage(document, getLanguage());
  bindLogout();

  if (username) {
    syncAccountFromD1().then(() => { showHome(); }).catch(error => {
      console.error('Stored-session sync failed', error);
      clearStoredUsername();
      username = null;
      loginView.hidden = false;
      home.hidden = true;
      leaderboard.hidden = true;
      gameView.hidden = true;
      setLogoutVisible(false);
    });
  } else {
    loginView.hidden = false;
    home.hidden = true;
    leaderboard.hidden = true;
    gameView.hidden = true;
    setLogoutVisible(false);
  }
}

bootstrap().catch(error => {
  console.error('Steem Flags startup failed', error);
  const loading = $('loading');
  if (loading) loading.innerHTML = `<h2>Unable to load the game</h2><p>Startup error: ${String(error?.message || error)}</p><p>Please refresh the page.</p>`;
});