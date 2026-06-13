import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import logger from '../../utils/logger';

export default function ProfileSection() {
  const { user, setUser, setCurrentStreak, loggedIn } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  /* const cardStyle = {
    background: 'var(--color-surface)',
    border: '0.5px solid var(--color-separator)',
    borderRadius: 'var(--radius-card)',
    padding: '1.25rem',
  }; */

  /* const inputStyle = {
    background: 'var(--color-bg)',
    border: '0.5px solid var(--color-separator)',
    borderRadius: '10px',
    padding: '0.625rem 0.875rem',
    width: '100%',
    fontSize: '0.9375rem',
    color: 'var(--color-label-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  }; */

  /* const primaryBtnStyle = {
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: '10px',
    padding: '0.75rem',
    width: '100%',
    fontSize: '0.9375rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  }; */

  async function handleSignIn(e) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      logger.info({ email }, 'Authenticating email/password credentials...');
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        logger.info({ userId: response.data.user.id }, 'Standard login successful');
        
        // Fetch newly logged-in user streak
        const streakRes = await api.get('/streaks');
        setCurrentStreak(streakRes.data?.current_streak || 0);
      }
    } catch (err) {
      logger.error({ err }, 'Email/password authentication failed');
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      logger.info({ email, name }, 'Registering/upgrading user profile on backend...');
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        logger.info({ userId: response.data.user.id }, 'User registration/upgrade completed successfully');
      }
    } catch (err) {
      logger.error({ err }, 'Registration failed');
      setErrorMsg(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    setErrorMsg(null);
    try {
      logger.info('Invalidating current session credentials...');
      await api.post('/auth/logout');
      
      logger.info('Initializing clean anonymous guest profile...');
      const response = await api.post('/auth/anonymous');
      if (response.data?.user) {
        setUser(response.data.user);
        setCurrentStreak(0);
        logger.info('Successfully reverted to guest session');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to cleanly log out');
    } finally {
      setLoading(false);
    }
  }

  if (loggedIn && user) {
    // Compute user initials (e.g. AN for Anirudh Narayanan)
    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';

    const memberSinceStr = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
      : 'Today';

    return (
      <div
        /* style={cardStyle} */
        className="bg-surface border-[0.5px] border-separator rounded-card p-md animate-fadeIn"
      >
        {/* Avatar + name/email */}
        <div
          /* style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }} */
          className="flex items-center gap-4 mb-5"
        >
          <div
            /* style={{
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
            }} */
            className="w-14 h-14 rounded-full bg-blue-light text-primary font-bold text-[1.25rem] flex items-center justify-center shrink-0"
          >
            {initials}
          </div>
          <div>
            <p
              /* style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-label-primary)', margin: 0 }} */
              className="text-[1rem] font-semibold text-label-primary m-0"
            >
              {user.name}
            </p>
            <p
              /* style={{ fontSize: '0.8125rem', color: 'var(--color-label-tertiary)', marginTop: '2px' }} */
              className="text-[0.8125rem] text-label-tertiary mt-0.5"
            >
              {user.email}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div
          /* style={{ height: '0.5px', background: 'var(--color-separator)', marginBottom: '1rem' }} */
          className="h-[0.5px] bg-separator mb-4"
        />

        {/* Info rows */}
        {[
          ['Member since', memberSinceStr],
          ['Account type', 'Member'],
          ['Phone', 'Not added'],
        ].map(([label, value], i, arr) => (
          <div key={label}>
            <div
              className={`flex justify-between items-center ${i === 0 ? 'pt-0' : 'pt-3'} ${i === arr.length - 1 ? 'pb-0' : 'pb-3'}`}
            >
              <span
                className="text-[0.9375rem] text-label-secondary"
              >
                {label}
              </span>
              <span
                className="text-[0.9375rem] text-label-tertiary"
              >
                {value}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div
                className="h-[0.5px] bg-separator"
              />
            )}
          </div>
        ))}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="text-primary bg-transparent border-none cursor-pointer text-sm mt-4 p-0 font-medium hover:opacity-85 disabled:opacity-50"
        >
          {loading ? 'Logging out...' : 'Sign out'}
        </button>
      </div>
    );
  }

  return (
    <div
      /* style={cardStyle} */
      className="bg-surface border-[0.5px] border-separator rounded-card p-md animate-fadeIn"
    >
      {user?.isAnonymous && (
        <div className="mb-4 text-xs leading-relaxed font-medium bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 p-3.5 rounded-xl flex items-start gap-2.5">
          <span className="text-base select-none">💡</span>
          <div>
            <strong>Guest Mode:</strong> You are browsing using a temporary guest session. Your streaks and expense logs are only stored locally in this browser. Register or sign in below to sync your data.
          </div>
        </div>
      )}

      <p
        className="text-[0.9375rem] text-label-secondary text-center mb-4 leading-[1.5]"
      >
        Sign in or create an account to sync your streaks and expense logs.
      </p>

      {/* Tab Selectors */}
      <div className="flex gap-1 p-0.5 bg-bg border-[0.5px] border-separator rounded-xl mb-4">
        <button
          onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
          className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer outline-none focus:outline-none transition-all ${
            activeTab === 'login' 
              ? 'bg-surface text-label-primary shadow-sm' 
              : 'bg-transparent text-label-tertiary hover:text-label-secondary'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
          className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer outline-none focus:outline-none transition-all ${
            activeTab === 'register' 
              ? 'bg-surface text-label-primary shadow-sm' 
              : 'bg-transparent text-label-tertiary hover:text-label-secondary'
          }`}
        >
          Register
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
          ⚠️ {errorMsg}
        </div>
      )}

      {activeTab === 'login' ? (
        <form
          onSubmit={handleSignIn}
          className="flex flex-col gap-3"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            /* style={inputStyle} */
            className="bg-bg border-[0.5px] border-separator rounded-[10px] px-3.5 py-2.5 w-full text-[0.9375rem] text-label-primary outline-none focus:border-primary disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            /* style={inputStyle} */
            className="bg-bg border-[0.5px] border-separator rounded-[10px] px-3.5 py-2.5 w-full text-[0.9375rem] text-label-primary outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            /* style={primaryBtnStyle} */
            className="bg-primary text-white rounded-[10px] py-3 w-full text-[0.9375rem] font-semibold border-none cursor-pointer hover:opacity-90 disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={loading}
            /* style={inputStyle} */
            className="bg-bg border-[0.5px] border-separator rounded-[10px] px-3.5 py-2.5 w-full text-[0.9375rem] text-label-primary outline-none focus:border-primary disabled:opacity-50"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            /* style={inputStyle} */
            className="bg-bg border-[0.5px] border-separator rounded-[10px] px-3.5 py-2.5 w-full text-[0.9375rem] text-label-primary outline-none focus:border-primary disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Password (Min. 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            /* style={inputStyle} */
            className="bg-bg border-[0.5px] border-separator rounded-[10px] px-3.5 py-2.5 w-full text-[0.9375rem] text-label-primary outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            /* style={primaryBtnStyle} */
            className="bg-primary text-white rounded-[10px] py-3 w-full text-[0.9375rem] font-semibold border-none cursor-pointer hover:opacity-90 disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}
    </div>
  );
}
