import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function ProfileSection() {
  const { loggedIn, setLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const cardStyle = {
    background: 'var(--color-surface)',
    border: '0.5px solid var(--color-separator)',
    borderRadius: 'var(--radius-card)',
    padding: '1.25rem',
  };

  const inputStyle = {
    background: 'var(--color-bg)',
    border: '0.5px solid var(--color-separator)',
    borderRadius: '10px',
    padding: '0.625rem 0.875rem',
    width: '100%',
    fontSize: '0.9375rem',
    color: 'var(--color-label-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const primaryBtnStyle = {
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: '10px',
    padding: '0.75rem',
    width: '100%',
    fontSize: '0.9375rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  };

  function handleSignIn(e) {
    e.preventDefault();
    if (email && password) {
      setLoggedIn(true);
    }
  }

  function handleSignOut() {
    setLoggedIn(false);
    setEmail('');
    setPassword('');
  }

  if (loggedIn) {
    return (
      <div style={cardStyle}>
        {/* Avatar + name/email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--color-blue-light)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            AN
          </div>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-label-primary)', margin: 0 }}>
              Anirudh Narayanan
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-label-tertiary)', marginTop: '2px' }}>
              anirudh@spendly.app
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: '0.5px', background: 'var(--color-separator)', marginBottom: '1rem' }} />

        {/* Info rows */}
        {[
          ['Member since', 'May 2025'],
          ['Account type', 'Free'],
          ['Phone', 'Not added'],
        ].map(([label, value], i, arr) => (
          <div key={label}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: i === 0 ? 0 : '0.75rem',
              paddingBottom: i === arr.length - 1 ? 0 : '0.75rem',
            }}>
              <span style={{ fontSize: '0.9375rem', color: 'var(--color-label-secondary)' }}>{label}</span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--color-label-tertiary)' }}>{value}</span>
            </div>
            {i < arr.length - 1 && (
              <div style={{ height: '0.5px', background: 'var(--color-separator)' }} />
            )}
          </div>
        ))}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            color: 'var(--color-primary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginTop: '0.75rem',
            padding: 0,
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <p style={{
        fontSize: '0.9375rem',
        color: 'var(--color-label-secondary)',
        textAlign: 'center',
        marginBottom: '1.25rem',
        lineHeight: 1.5,
      }}>
        Sign in to sync your data across devices
      </p>
      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={primaryBtnStyle}>
          Sign in
        </button>
      </form>
    </div>
  );
}
