const KEY = 'steemflags.progress.v1';
const DEFAULTS = { games: 0, correct: 0, questions: 0, bestStreak: 0 };

export function loadProgress() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...DEFAULTS }; }
}

export function recordAnswer(progress, correct, streak) {
  progress.questions += 1;
  if (correct) progress.correct += 1;
  if (streak > progress.bestStreak) progress.bestStreak = streak;
  return progress;
}

export function recordGame(progress) {
  progress.games += 1;
  return progress;
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function accuracy(progress) {
  return progress.questions ? Math.round((progress.correct / progress.questions) * 100) : 0;
}
