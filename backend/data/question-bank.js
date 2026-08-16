import { QUESTIONS } from '../../data/questions.js';

/**
 * Server-side question-bank adapter.
 * The browser dataset remains useful for development, but production APIs
 * should replace this adapter with a database-backed implementation.
 */
export function getActiveQuestions() {
  return QUESTIONS.filter((question) => question.active);
}

export function getQuestionByIndex(index) {
  const questions = getActiveQuestions();
  if (!Number.isInteger(index) || index < 0 || index >= questions.length) return null;
  return questions[index];
}
