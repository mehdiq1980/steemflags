import { ENERGY_PER_GAME } from './energy.js';

export const TOTAL_QUESTIONS = 20;

export function startSession(user) {
  if (!user) throw new Error('User is required');
  const energy = Number(user.energy);
  if (energy < ENERGY_PER_GAME) throw new Error('Not enough energy');
  return {
    energyAfter: energy - ENERGY_PER_GAME,
    questionsAnswered: 0,
    correctAnswers: 0,
    points: 0,
    completed: false
  };
}

export function recordAnswer(session, correct) {
  if (!session || session.completed) throw new Error('Session is not active');
  if (session.questionsAnswered >= TOTAL_QUESTIONS) throw new Error('Session is complete');
  const next = {
    ...session,
    questionsAnswered: session.questionsAnswered + 1,
    correctAnswers: session.correctAnswers + (correct ? 1 : 0),
    points: Math.max(0, session.points + (correct ? 1 : -1))
  };
  next.completed = next.questionsAnswered === TOTAL_QUESTIONS;
  return next;
}
