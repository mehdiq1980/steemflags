import { COUNTRIES } from '../data/countries.js';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export class FlagGame {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.reset();
  }

  reset() {
    this.questionNumber = 0;
    this.score = 0;
    this.streak = 0;
    this.current = null;
    this.used = new Set();
  }

  next() {
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
    this.onUpdate(this.current, this.score, this.questionNumber, this.streak);
  }

  answer(name) {
    if (!this.current) return null;
    const correct = name === this.current.country[0];
    this.score = Math.max(0, this.score + (correct ? 1 : -1));
    this.streak = correct ? this.streak + 1 : 0;
    return { correct, answer: this.current.country[0], score: this.score, streak: this.streak };
  }
}
