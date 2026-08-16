// Quiz data is intentionally kept separate from the game controller.
// Production questions will be loaded from the backend database.

export const BANNED_COUNTRIES = Object.freeze([
  'Iran',
  'Russia',
  'North Korea',
  'Cuba',
]);

export function isAllowedCountry(name) {
  return !BANNED_COUNTRIES.includes(name);
}

export function filterAllowedQuestions(questions = []) {
  return questions.filter((question) => {
    const country = question?.country || question?.answer;
    return country && isAllowedCountry(country);
  });
}
