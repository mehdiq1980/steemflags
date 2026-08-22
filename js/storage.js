const PREFIX = 'steemflags.state.v2';
const USER_KEY = 'steemflags.username';
const DAILY_ENERGY = 3;
// Daily energy allowance is 3. Purchased energy is tracked separately and resets each local day.
const ENERGY_MIGRATION_VERSION = 33;
const defaults = { sf: 0, energy: DAILY_ENERGY, lastEnergyDay: null, energyVersion: ENERGY_MIGRATION_VERSION, purchasedEnergyToday: 0, purchaseDay: null };

function key(username) {
  return `${PREFIX}_${encodeURIComponent(String(username).trim().toLowerCase())}`;
}

export function getStoredUsername() { return localStorage.getItem(USER_KEY) || null; }
export function setStoredUsername(username) { const value = String(username).trim().toLowerCase(); localStorage.setItem(USER_KEY, value); return value; }
export function clearStoredUsername() { localStorage.removeItem(USER_KEY); }

export function loadState(username = getStoredUsername()) {
  if (!username) return { ...defaults };
  try {
    const stored = JSON.parse(localStorage.getItem(key(username)) || '{}');
    if (stored.energyVersion !== ENERGY_MIGRATION_VERSION) {
      const migrated = {
        ...defaults,
        ...stored,
        energy: DAILY_ENERGY,
        lastEnergyDay: localDay(),
        energyVersion: ENERGY_MIGRATION_VERSION,
        purchasedEnergyToday: 0,
        purchaseDay: localDay()
      };
      localStorage.setItem(key(username), JSON.stringify(migrated));
      return migrated;
    }
    return { ...defaults, ...stored };
  } catch { return { ...defaults }; }
}

// Always read the current SF/D2E balance directly from the user's saved localStorage state.
export function getStoredSF(username = getStoredUsername()) {
  const current = loadState(username);
  const value = Number(current?.sf);
  return Number.isFinite(value) ? value : 0;
}

export function saveState(state, username = getStoredUsername()) {
  if (!username) throw new Error('Login required');
  localStorage.setItem(key(username), JSON.stringify({ ...state, energyVersion: ENERGY_MIGRATION_VERSION }));
}

export function resetState(username = getStoredUsername()) {
  if (username) localStorage.removeItem(key(username));
  return { ...defaults };
}

function localDay() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function refreshDailyEnergy(state, username = getStoredUsername()) {
  const day = localDay();
  if (state.lastEnergyDay !== day) {
    state.energy = DAILY_ENERGY;
    state.lastEnergyDay = day;
    state.energyVersion = ENERGY_MIGRATION_VERSION;
    state.purchasedEnergyToday = 0;
    state.purchaseDay = day;
    if (username) saveState(state, username);
  } else if (state.energyVersion !== ENERGY_MIGRATION_VERSION) {
    state.energy = DAILY_ENERGY;
    state.energyVersion = ENERGY_MIGRATION_VERSION;
    state.purchasedEnergyToday = 0;
    state.purchaseDay = day;
    if (username) saveState(state, username);
  } else if (state.purchaseDay !== day) {
    state.purchasedEnergyToday = 0;
    state.purchaseDay = day;
    if (username) saveState(state, username);
  }
  return state;
}
