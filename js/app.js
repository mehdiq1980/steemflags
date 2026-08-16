import { loadState, saveState, resetState, refreshDailyEnergy } from './storage.js';
import { FlagGame } from './game.js';
import { loadProgress, recordAnswer, recordGame, saveProgress, accuracy } from './progression.js';

const COMPONENTS = { appShell: './components/app-shell.html' };
const $ = (id) => document.getElementById(id);

async function loadComponent(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load component: ${response.status}`);
  return response.text();
}

async function bootstrap() {
  const app = $('app');
  try {
    app.innerHTML = await loadComponent(COMPONENTS.appShell);
    startApplication();
  } catch (error) {
    console.error('Steem Flags bootstrap failed:', error);
    app.innerHTML = '<main class="appShell"><section class="card"><h1>Steem Flags</h1><p class="muted">The game interface could not be loaded. Please refresh the page.</p></section></main>';
  }
}

function startApplication() {
  let state = refreshDailyEnergy(loadState());
  let progress = loadProgress();
  const home = $('homeView'), gameView = $('gameView'), answers = $('answers');
  const feedback = $('feedback'), next = $('nextButton'), energy = $('energyValue'), sf = $('sfValue');
  const counter = $('questionCounter'), score = $('scoreLabel'), streak = $('streakLabel'), flag = $('flagImage');
  const start = $('startButton'), progressSummary = $('progressSummary'), menu = $('menu'), menuButton = $('menuButton');
  const game = new FlagGame(renderQuestion);
  let answered = false;

  function renderStats() {
    energy.textContent = state.energy;
    sf.textContent = state.sf;
    start.disabled = state.energy <= 0;
    start.textContent = state.energy > 0 ? 'Start Game' : 'No Energy — Come Back Tomorrow';
    progressSummary.hidden = false;
    progressSummary.textContent = `Games: ${progress.games} · Accuracy: ${accuracy(progress)}% · Best streak: ${progress.bestStreak}`;
  }

  function renderQuestion(question, points, number, currentStreak) {
    answered = false;
    counter.textContent = `Question ${number} of ${game.totalQuestions}`;
    score.textContent = `Score: ${points}`;
    streak.textContent = `🔥 ${currentStreak}`;
    flag.textContent = question.country[1];
    flag.setAttribute('aria-label', `${question.country[0]} flag`);
    answers.replaceChildren();
    feedback.textContent = '';
    feedback.className = 'feedback';
    next.hidden = true;
    question.options.forEach(([name]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer';
      button.textContent = name;
      button.addEventListener('click', () => choose(button, name), { once: true });
      answers.appendChild(button);
    });
  }

  function choose(button, name) {
    if (answered) return;
    const result = game.answer(name);
    if (!result) return;
    answered = true;
    progress = recordAnswer(progress, result.correct, result.streak);
    if (result.correct) {
      state.sf += 1;
      feedback.textContent = `Correct! +1 SF${result.streak > 1 ? ` · ${result.streak} streak` : ''}`;
      feedback.className = 'feedback ok';
      button.classList.add('correct');
    } else {
      state.sf = Math.max(0, state.sf - 1);
      feedback.textContent = `Wrong. Correct answer: ${result.answer}`;
      feedback.className = 'feedback bad';
      button.classList.add('wrong');
    }
    [...answers.children].forEach((answerButton) => {
      answerButton.disabled = true;
      if (answerButton.textContent === result.answer) answerButton.classList.add('correct');
    });
    saveState(state);
    saveProgress(progress);
    renderStats();
    next.hidden = false;
  }

  function startGame() {
    state = refreshDailyEnergy(loadState());
    renderStats();
    if (state.energy <= 0) return;
    // One energy is consumed per 20-question game, not per question.
    state.energy -= 1;
    saveState(state);
    game.reset();
    progress = recordGame(progress);
    saveProgress(progress);
    renderStats();
    home.hidden = true;
    gameView.hidden = false;
    game.next();
  }

  start.addEventListener('click', startGame);
  next.addEventListener('click', () => {
    if (game.isComplete()) {
      gameView.hidden = true;
      home.hidden = false;
      feedback.textContent = 'Game complete!';
      renderStats();
      return;
    }
    game.next();
  });
  menuButton.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuButton.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.querySelectorAll('[data-action="home"]').forEach((button) => button.addEventListener('click', () => {
    gameView.hidden = true; home.hidden = false; menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); renderStats();
  }));
  document.querySelectorAll('[data-action="reset"]').forEach((button) => button.addEventListener('click', () => {
    state = refreshDailyEnergy(resetState()); game.reset(); progress = loadProgress(); renderStats();
    gameView.hidden = true; home.hidden = false; menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false');
  }));
  renderStats();
}

bootstrap();
