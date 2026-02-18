import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export function AuthPage({ api, onAuthSuccess }) {
  /** Login/register UI. */
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const subtitle = useMemo(() => {
    return mode === 'login'
      ? 'Sign in to view and manage your notes.'
      : 'Create an account to start saving notes.';
  }, [mode]);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res =
        mode === 'login' ? await api.login(email, password) : await api.register(email, password);
      onAuthSuccess(res);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="AuthWrap">
      <div className="AuthCard">
        <h1 className="H1">{mode === 'login' ? 'Login' : 'Register'}</h1>
        <p className="Muted">{subtitle}</p>

        {error ? <div className="Alert" role="alert">{error}</div> : null}

        <form onSubmit={submit} className="Form">
          <label className="Label">
            Email
            <input
              className="Input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>

          <label className="Label">
            Password
            <input
              className="Input"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <div className="AuthFooter">
          {mode === 'login' ? (
            <>
              <span className="Muted">No account?</span>{' '}
              <button className="LinkBtn" type="button" onClick={() => setMode('register')}>
                Register
              </button>
            </>
          ) : (
            <>
              <span className="Muted">Already have an account?</span>{' '}
              <button className="LinkBtn" type="button" onClick={() => setMode('login')}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
