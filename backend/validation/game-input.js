export function validateAnswerInput(body) {
  const answer = body?.answer;
  if (typeof answer !== 'string' || answer.length === 0 || answer.length > 128) {
    throw new Error('Invalid answer');
  }
  return answer;
}

export function validateSessionId(sessionId) {
  if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(sessionId)) {
    throw new Error('Invalid session id');
  }
  return sessionId;
}
