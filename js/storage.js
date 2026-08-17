const PREFIX = 'steemflags.state.v2';
const USER_KEY = 'steemflags.username';
const defaults = { sf: 0, energy: 30, lastEnergyDay: null };

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
    return { ...defaults, ...JSON.parse(localStorage.getItem(key(username)) || '{}') };
  } catch {
    return { ...defaults };
  }
}

export function saveState(state, username = getStoredUsername()) {
  if (!username) throw new Error('Login required');
  localStorage.setItem(key(username), JSON.stringify(state));
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
    state.energy = 30;
    state.lastEnergyDay = day;
    if (username) saveState(state, username);
  }
  return state;
}
