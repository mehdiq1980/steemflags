import { getItem, setItem } from './storage.js';

export const GAME_RULES = Object.freeze({
  correctSF: 1,
  wrongSF: -1,
  dailyEnergy: 3,
  energyPerGame: 1,
  energyPurchaseCost: 10,
});

export function getEnergy() {
  return Number(getItem('energy', GAME_RULES.dailyEnergy));
}

export function getSF() {
  return Math.max(0, Number(getItem('sf', 0)));
}

export function changeSF(amount) {
  const next = Math.max(0, getSF() + Number(amount));
  setItem('sf', next);
  return next;
}

export function canPlay() {
  return getEnergy() >= GAME_RULES.energyPerGame;
}

export function consumeEnergy() {
  if (!canPlay()) return false;
  setItem('energy', getEnergy() - GAME_RULES.energyPerGame);
  return true;
}
