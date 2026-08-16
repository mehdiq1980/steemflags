import { toApiError } from '../errors/api-error.js';

export async function executeApi(handler) {
  try {
    const data = await handler();
    return { status: 200, body: { ok: true, data } };
  } catch (error) {
    const apiError = toApiError(error);
    return {
      status: apiError.status,
      body: { ok: false, error: { code: apiError.code, message: apiError.message } }
    };
  }
}
