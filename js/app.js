import { loadState, saveState, resetState, refreshDailyEnergy } from './storage.js';
import { FlagGame } from './game.js';
import { loadProgress, recordAnswer, recordGame, saveProgress, accuracy } from './progression.js';

const $ = (id) => document.getElementById(id);
let state = refreshDailyEnergy(loadState());
let progress = loadProgress();
const home = $('homeView'), gameView = $('gameView'), answers = $('answers'), feedback = $('feedback');
const next = $('nextButton'), energy = $('energyValue'), sf = $('sfValue'), counter = $('questionCounter');
const score = $('scoreLabel'), streak = $('streakLabel'), flag = $('flagImage'), start = $('startButton');
const progressSummary = $('progressSummary');
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
  counter.textContent = `Question ${number}`;
  score.textContent = `Score: ${points}`;
  streak.textContent = `🔥 ${currentStreak}`;
  flag.textContent = question.country[1];
  flag.setAttribute('aria-label', `${question.country[0]} flag`);
  answers.replaceChildren(); feedback.textContent = ''; feedback.className = 'feedback'; next.hidden = true;
  question.options.forEach(([name]) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'answer'; button.textContent = name;
    button.addEventListener('click', () => choose(button, name), { once: true }); answers.appendChild(button);
  });
}

function choose(button, name) {
  if (answered || state.energy <= 0) return;
  const result = game.answer(name);
  if (!result) return;
  answered = true; state.energy -= 1;
  progress = recordAnswer(progress, result.correct, result.streak);
  if (result.correct) {
    state.sf += 1; feedback.textContent = `Correct! +1 SF${result.streak > 1 ? ` · ${result.streak} streak` : ''}`; feedback.className = 'feedback ok'; button.classList.add('correct');
  } else {
    state.sf = Math.max(0, state.sf - 1); feedback.textContent = `Wrong. Correct answer: ${result.answer}`; feedback.className = 'feedback bad'; button.classList.add('wrong');
  }
  [...answers.children].forEach((b) => { b.disabled = true; if (b.textContent === result.answer) b.classList.add('correct'); });
  saveState(state); saveProgress(progress); renderStats(); next.hidden = false;
}

function startGame() {
  state = refreshDailyEnergy(loadState()); renderStats(); if (state.energy <= 0) return;
  game.reset(); progress = recordGame(progress); saveProgress(progress); renderStats(); home.hidden = true; gameView.hidden = false; game.next();
}

start.addEventListener('click', startGame);
next.addEventListener('click', () => { if (state.energy > 0) game.next(); else { feedback.textContent = 'No energy left today. Come back tomorrow.'; feedback.className = 'feedback bad'; next.hidden = true; } });
$('menuButton').addEventListener('click', () => { const menu = $('menu'); menu.hidden = !menu.hidden; $('menuButton').setAttribute('aria-expanded', String(!menu.hidden)); });
document.querySelectorAll('[data-action="home"]').forEach((b) => b.addEventListener('click', () => { gameView.hidden = true; home.hidden = false; $('menu').hidden = true; renderStats(); }));
document.querySelectorAll('[data-action="reset"]').forEach((b) => b.addEventListener('click', () => { state = refreshDailyEnergy(resetState()); game.reset(); progress = loadProgress(); renderStats(); gameView.hidden = true; home.hidden = false; $('menu').hidden = true; }));
renderStats();
