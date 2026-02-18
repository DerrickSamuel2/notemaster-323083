const KEY = 'notemaster.auth';

/**
 * PUBLIC_INTERFACE
 * getStoredAuth - load auth {token, user} from localStorage.
 */
export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * setStoredAuth - store auth {token, user}.
 */
export function setStoredAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

/**
 * PUBLIC_INTERFACE
 * clearStoredAuth - remove auth from localStorage.
 */
export function clearStoredAuth() {
  localStorage.removeItem(KEY);
}
