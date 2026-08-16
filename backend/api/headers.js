export const JSON_HEADERS = Object.freeze({
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
});

export function withJsonHeaders(response) {
  return { ...response, headers: { ...JSON_HEADERS, ...(response?.headers || {}) } };
}
