const PREFIX = 'steemflags.state.v2';
const USER_KEY = 'steemflags.username';
const DAILY_ENERGY = 3;
const ENERGY_MIGRATION_VERSION = 36;
const defaults = { sf: 0, energy: DAILY_ENERGY, lastEnergyDay: null, energyVersion: ENERGY_MIGRATION_VERSION, purchasedEnergyToday: 0, purchaseDay: null, processedEnergyPurchases: [] };
function key(username) { return `${PREFIX}_${encodeURIComponent(String(username).trim().toLowerCase())}`; }
export function getStoredUsername() { return localStorage.getItem(USER_KEY) || null; }
export function setStoredUsername(username) { const value = String(username).trim().toLowerCase(); localStorage.setItem(USER_KEY, value); return value; }
export function clearStoredUsername() { localStorage.removeItem(USER_KEY); }
export function loadState(username = getStoredUsername()) { if (!username) return { ...defaults }; try { const stored = JSON.parse(localStorage.getItem(key(username)) || '{}'); return { ...defaults, ...stored, energyVersion: ENERGY_MIGRATION_VERSION, processedEnergyPurchases: Array.isArray(stored.processedEnergyPurchases) ? stored.processedEnergyPurchases : [] }; } catch { return { ...defaults }; } }
export function getStoredSF(username = getStoredUsername()) { const value = Number(loadState(username)?.sf); return Number.isFinite(value) ? value : 0; }
export function saveState(state, username = getStoredUsername()) { if (!username) throw new Error('Login required'); localStorage.setItem(key(username), JSON.stringify({ ...state, energyVersion: ENERGY_MIGRATION_VERSION })); }
export function resetState(username = getStoredUsername()) { if (username) localStorage.removeItem(key(username)); return { ...defaults }; }
function localDay() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }
export function refreshDailyEnergy(state, username = getStoredUsername()) { const day = localDay(); if (state.lastEnergyDay !== day) { state.energy = DAILY_ENERGY; state.lastEnergyDay = day; state.purchasedEnergyToday = 0; state.purchaseDay = day; state.processedEnergyPurchases = []; if (username) saveState(state, username); } else if (state.purchaseDay !== day) { state.purchasedEnergyToday = 0; state.purchaseDay = day; if (username) saveState(state, username); } return state; }

export async function syncPurchasedEnergy(state, username = getStoredUsername()) {
  if (!username) return state;
  const sync = async () => {
    try {
      const response = await fetch(`./data/leaderboard.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return false;
      const data = await response.json();
      const player = data?.players?.[String(username).trim().toLowerCase()];
      const events = Array.isArray(player?.shop_energy_events) ? player.shop_energy_events.map(String) : [];
      const processed = Array.isArray(state.processedEnergyPurchases) ? state.processedEnergyPurchases : [];
      const newEvents = events.filter(id => !processed.includes(id));
      if (!newEvents.length) return false;
      state.energy = (Number(state.energy) || 0) + newEvents.length;
      state.purchasedEnergyToday = (Number(state.purchasedEnergyToday) || 0) + newEvents.length;
      state.processedEnergyPurchases = [...processed, ...newEvents].slice(-100);
      saveState(state, username);
      const energyEl = document.getElementById('energyValue');
      if (energyEl) energyEl.textContent = String(state.energy);
      const shopEnergyEl = document.getElementById('shopEnergy');
      if (shopEnergyEl) shopEnergyEl.textContent = String(state.energy);
      return true;
    } catch (error) { console.warn('Unable to sync purchased energy', error); return false; }
  };
  if (await sync()) return state;
  // GitHub Actions needs a short time to process the Issue after the user returns from GitHub.
  // Poll for up to 60 seconds so the top Energy balance updates automatically without another login.
  if (!window.__steemFlagsEnergySyncStarted) {
    window.__steemFlagsEnergySyncStarted = true;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      const done = await sync();
      if (done || attempts >= 12) { clearInterval(timer); window.__steemFlagsEnergySyncStarted = false; }
    }, 5000);
  }
  return state;
}
