const DEFAULT_BASE_URL = 'http://localhost:3001';

/**
 * PUBLIC_INTERFACE
 * apiFetch - thin fetch wrapper for the Notes backend.
 *
 * Uses:
 * - REACT_APP_API_BASE_URL env var if set, else defaults to http://localhost:3001
 *
 * @param {string} path API path beginning with /
 * @param {object} options { method, body, token }
 * @returns {Promise<any>} parsed JSON
 */
export async function apiFetch(path, options = {}) {
  const baseUrl = process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
  const url = `${baseUrl}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && (data.detail || data.message)) ||
      (typeof data === 'string' && data) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
