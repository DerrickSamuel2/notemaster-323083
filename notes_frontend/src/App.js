import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { apiFetch } from './api/client';
import { AuthPage } from './pages/AuthPage';
import { NotesPage } from './pages/NotesPage';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from './state/authStorage';

// PUBLIC_INTERFACE
function App() {
  /** Root app: manages auth token + user, and conditionally renders auth or notes UI. */
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [me, setMe] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const token = auth?.token || null;

  const api = useMemo(() => {
    return {
      // PUBLIC_INTERFACE
      async getMe() {
        /** Get current user profile. */
        return apiFetch('/auth/me', { token });
      },
      // PUBLIC_INTERFACE
      async login(email, password) {
        /** Login and return {token, user}. */
        return apiFetch('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
      },
      // PUBLIC_INTERFACE
      async register(email, password) {
        /** Register and return {token, user}. */
        return apiFetch('/auth/register', {
          method: 'POST',
          body: { email, password },
        });
      },
      // PUBLIC_INTERFACE
      async listTags() {
        /** List tags for current user. */
        return apiFetch('/tags', { token });
      },
      // PUBLIC_INTERFACE
      async createTag(name) {
        /** Create tag. */
        return apiFetch('/tags', { method: 'POST', token, body: { name } });
      },
      // PUBLIC_INTERFACE
      async deleteTag(tagId) {
        /** Delete tag. */
        return apiFetch(`/tags/${encodeURIComponent(tagId)}`, { method: 'DELETE', token });
      },
      // PUBLIC_INTERFACE
      async listNotes(params) {
        /** List notes with optional filtering/search. */
        const sp = new URLSearchParams();
        if (params?.q) sp.set('q', params.q);
        if (params?.tagId) sp.set('tag_id', String(params.tagId));
        if (params?.pinnedOnly) sp.set('pinned', 'true');
        if (params?.favoritedOnly) sp.set('favorited', 'true');
        return apiFetch(`/notes?${sp.toString()}`, { token });
      },
      // PUBLIC_INTERFACE
      async createNote(payload) {
        /** Create note. */
        return apiFetch('/notes', { method: 'POST', token, body: payload });
      },
      // PUBLIC_INTERFACE
      async updateNote(noteId, payload) {
        /** Update note. */
        return apiFetch(`/notes/${encodeURIComponent(noteId)}`, { method: 'PUT', token, body: payload });
      },
      // PUBLIC_INTERFACE
      async deleteNote(noteId) {
        /** Delete note. */
        return apiFetch(`/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE', token });
      },
      // PUBLIC_INTERFACE
      async togglePin(noteId) {
        /** Toggle pinned status. */
        return apiFetch(`/notes/${encodeURIComponent(noteId)}/pin`, { method: 'POST', token });
      },
      // PUBLIC_INTERFACE
      async toggleFavorite(noteId) {
        /** Toggle favorited status. */
        return apiFetch(`/notes/${encodeURIComponent(noteId)}/favorite`, { method: 'POST', token });
      },
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      if (!token) {
        setMe(null);
        return;
      }
      try {
        const res = await api.getMe();
        if (!cancelled) setMe(res);
      } catch (e) {
        // Token invalid or backend not ready; log out locally
        if (!cancelled) {
          clearStoredAuth();
          setAuth(null);
          setMe(null);
        }
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [token, api]);

  // PUBLIC_INTERFACE
  const handleAuthSuccess = (result) => {
    /** Store auth and move into app. */
    setStoredAuth(result);
    setAuth(result);
    setMe(result.user);
  };

  // PUBLIC_INTERFACE
  const handleLogout = () => {
    /** Clear local auth. */
    clearStoredAuth();
    setAuth(null);
    setMe(null);
  };

  return (
    <div className="App">
      <header className="TopBar">
        <div className="TopBar-left">
          <div className="Brand">
            <div className="Brand-mark" aria-hidden="true">N</div>
            <div className="Brand-text">
              <div className="Brand-title">NoteMaster</div>
              <div className="Brand-subtitle">minimal notes</div>
            </div>
          </div>
        </div>

        <div className="TopBar-right">
          <button
            className="btn btn-ghost"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle theme"
            type="button"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>

          {me ? (
            <>
              <div className="UserPill" title={me.email}>
                {me.email}
              </div>
              <button className="btn btn-primary" onClick={handleLogout} type="button">
                Logout
              </button>
            </>
          ) : (
            <div className="Badge">Not signed in</div>
          )}
        </div>
      </header>

      <main className="Main">
        {!token ? (
          <AuthPage api={api} onAuthSuccess={handleAuthSuccess} />
        ) : (
          <NotesPage api={api} me={me} />
        )}
      </main>
    </div>
  );
}

export default App;
