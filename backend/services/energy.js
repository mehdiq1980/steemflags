export const DAILY_ENERGY = 3;
export const ENERGY_PER_GAME = 1;
export const ENERGY_PURCHASE_COST = 10;

export function canStartGame(energy) {
  return Number(energy) >= ENERGY_PER_GAME;
}

export function consumeGameEnergy(energy) {
  if (!canStartGame(energy)) throw new Error('Not enough energy');
  return Number(energy) - ENERGY_PER_GAME;
}

export function buyEnergy(energy, sfBalance, amount = 1) {
  const units = Number(amount);
  if (!Number.isInteger(units) || units < 1) throw new Error('Invalid energy amount');
  const cost = units * ENERGY_PURCHASE_COST;
  if (Number(sfBalance) < cost) throw new Error('Not enough SF');
  return { energy: Math.min(DAILY_ENERGY, Number(energy) + units), cost };
}
