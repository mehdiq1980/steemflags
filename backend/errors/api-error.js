export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error;
  const message = error?.message || 'Internal server error';
  const known = {
    'Authentication required': [401, 'AUTH_REQUIRED'],
    'Forbidden': [403, 'FORBIDDEN'],
    'Invalid answer': [400, 'INVALID_ANSWER'],
    'Invalid session id': [400, 'INVALID_SESSION'],
    'Invalid referral code': [400, 'INVALID_REFERRAL_CODE']
  };
  const [status, code] = known[message] || [500, 'INTERNAL_ERROR'];
  return new ApiError(status, code, message);
}
