const PREFIX = 'steemflags.state.v2';
const USER_KEY = 'steemflags.username';
const DAILY_ENERGY = 30;
const defaults = { sf: 0, energy: DAILY_ENERGY, lastEnergyDay: null, energyVersion: DAILY_ENERGY };

function key(username) {
  return `${PREFIX}_${encodeURIComponent(String(username).trim().toLowerCase())}`;
}

export function getStoredUsername() {
  return localStorage.getItem(USER_KEY) || null;
}

export function setStoredUsername(username) {
  const value = String(username).trim().toLowerCase();
  localStorage.setItem(USER_KEY, value);
  return value;
}

export function clearStoredUsername() {
  localStorage.removeItem(USER_KEY);
}

export function loadState(username = getStoredUsername()) {
  if (!username) return { ...defaults };
  try {
    const stored = JSON.parse(localStorage.getItem(key(username)) || '{}');
    // One-time migration: existing accounts created with the old 3-energy cap
    // receive the new temporary 30-energy daily allocation without losing SF.
    if (stored.energyVersion !== DAILY_ENERGY) {
      const migrated = { ...defaults, ...stored, energy: DAILY_ENERGY, energyVersion: DAILY_ENERGY };
      localStorage.setItem(key(username), JSON.stringify(migrated));
      return migrated;
    }
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

export function saveState(state, username = getStoredUsername()) {
  if (!username) throw new Error('Login required');
  localStorage.setItem(key(username), JSON.stringify({ ...state, energyVersion: DAILY_ENERGY }));
}

export function resetState(username = getStoredUsername()) {
  if (username) localStorage.removeItem(key(username));
  return { ...defaults };
}

function localDay() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function refreshDailyEnergy(state, username = getStoredUsername()) {
  const day = localDay();
  if (state.lastEnergyDay !== day) {
    state.energy = DAILY_ENERGY;
    state.lastEnergyDay = day;
    state.energyVersion = DAILY_ENERGY;
    if (username) saveState(state, username);
  } else if (state.energyVersion !== DAILY_ENERGY) {
    state.energy = DAILY_ENERGY;
    state.energyVersion = DAILY_ENERGY;
    if (username) saveState(state, username);
  }
  return state;
}
