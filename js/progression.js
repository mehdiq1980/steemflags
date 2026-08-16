const PREFIX = 'steemflags.progress.v1';
const DEFAULTS = { games: 0, correct: 0, questions: 0, bestStreak: 0 };

function key(username) {
  return `${PREFIX}_${encodeURIComponent(String(username).trim().toLowerCase())}`;
}

export function loadProgress(username) {
  if (!username) return { ...DEFAULTS };
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(key(username)) || '{}') }; }
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

export function saveProgress(progress, username) {
  if (!username) throw new Error('Login required');
  localStorage.setItem(key(username), JSON.stringify(progress));
}

export function accuracy(progress) {
  return progress.questions ? Math.round((progress.correct / progress.questions) * 100) : 0;
}
