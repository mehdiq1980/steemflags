import { COUNTRIES } from './countries.js';

// Shared question source for the browser and future server importer.
// The server must copy this dataset into its authoritative questions table.
export const QUESTIONS = Object.freeze(
  COUNTRIES.map(([name, flag]) => Object.freeze({
    country: name,
    flag,
    active: true
  }))
);

export function getQuestionByCountry(country) {
  return QUESTIONS.find((question) => question.country === country) ?? null;
}
