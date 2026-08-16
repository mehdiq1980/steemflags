import { loadState, saveState, resetState, refreshDailyEnergy } from './storage.js';
import { FlagGame } from './game.js';

const $ = (id) => document.getElementById(id);
let state = refreshDailyEnergy(loadState());

const home = $('homeView');
const gameView = $('gameView');
const answers = $('answers');
const feedback = $('feedback');
const next = $('nextButton');
const energy = $('energyValue');
const sf = $('sfValue');
const counter = $('questionCounter');
const score = $('scoreLabel');
const streak = $('streakLabel');
const flag = $('flagImage');

const game = new FlagGame(renderQuestion);

function renderStats() {
  energy.textContent = state.energy;
  sf.textContent = state.sf;
}

function renderQuestion(question, points, number, currentStreak) {
  counter.textContent = `Question ${number}`;
  score.textContent = `Score: ${points}`;
  if (streak) streak.textContent = `🔥 ${currentStreak}`;
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
  if (state.energy <= 0) {
    feedback.textContent = 'No energy left today.';
    feedback.className = 'feedback bad';
    return;
  }

  state.energy -= 1;
  const result = game.answer(name);

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
  renderStats();
  next.hidden = false;
}

function startGame() {
  state = refreshDailyEnergy(loadState());
  if (state.energy <= 0) {
    feedback.textContent = 'No energy left today. Come back tomorrow.';
    feedback.className = 'feedback bad';
    return;
  }
  game.reset();
  home.hidden = true;
  gameView.hidden = false;
  game.next();
}

$('startButton').addEventListener('click', startGame);

next.addEventListener('click', () => {
  if (state.energy > 0) game.next();
  else {
    feedback.textContent = 'No energy left today.';
    feedback.className = 'feedback bad';
    next.hidden = true;
  }
});

$('menuButton').addEventListener('click', () => {
  const menu = $('menu');
  menu.hidden = !menu.hidden;
  $('menuButton').setAttribute('aria-expanded', String(!menu.hidden));
});

document.querySelectorAll('[data-action="home"]').forEach((button) => {
  button.addEventListener('click', () => {
    gameView.hidden = true;
    home.hidden = false;
    $('menu').hidden = true;
  });
});

document.querySelectorAll('[data-action="reset"]').forEach((button) => {
  button.addEventListener('click', () => {
    state = refreshDailyEnergy(resetState());
    game.reset();
    renderStats();
    gameView.hidden = true;
    home.hidden = false;
    $('menu').hidden = true;
  });
});

renderStats();
