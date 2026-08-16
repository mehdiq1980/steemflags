import { COUNTRIES } from '../data/countries.js';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export class FlagGame {
  constructor(onUpdate, totalQuestions = 20) {
    this.onUpdate = onUpdate;
    this.totalQuestions = totalQuestions;
    this.reset();
  }

  reset() {
    this.questionNumber = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.current = null;
    this.used = new Set();
    this.answered = false;
    this.completed = false;
  }

  isComplete() {
    return this.completed || this.questionNumber >= this.totalQuestions;
  }

  next() {
    if (this.isComplete() || (this.current && !this.answered)) return;
    let pool = COUNTRIES.filter(([name]) => !this.used.has(name));
    if (pool.length < 4) {
      this.used.clear();
      pool = COUNTRIES;
    }

    const country = pool[Math.floor(Math.random() * pool.length)];
    this.used.add(country[0]);
    const wrong = shuffle(COUNTRIES.filter(([name]) => name !== country[0])).slice(0, 3);
    this.current = { country, options: shuffle([country, ...wrong]) };
    this.questionNumber += 1;
    this.answered = false;
    this.onUpdate(this.current, this.score, this.questionNumber, this.streak, this.bestStreak);
  }

  answer(name) {
    if (!this.current || this.answered || this.isComplete()) return null;
    this.answered = true;
    const correct = name === this.current.country[0];
    this.score = Math.max(0, this.score + (correct ? 1 : -1));
    this.streak = correct ? this.streak + 1 : 0;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    if (this.questionNumber >= this.totalQuestions) this.completed = true;
    return {
      correct,
      answer: this.current.country[0],
      score: this.score,
      streak: this.streak,
      bestStreak: this.bestStreak,
      complete: this.completed
    };
  }
}
