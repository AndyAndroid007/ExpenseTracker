import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import logger from '../utils/logger';
import axios from 'axios';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  loggedIn: false,
  currentStreak: 0,
  setCurrentStreak: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const loggedIn = !!user && !user.isAnonymous;

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      if (userData.isAnonymous) {
        localStorage.setItem('spendly_guest_user_id', userData.id);
        logger.info({ userId: userData.id }, 'Guest user ID persisted in localStorage');
      } else {
        localStorage.removeItem('spendly_guest_user_id');
        logger.info('Registered member profile active, guest ID cleared from localStorage');
      }
    } else {
      localStorage.removeItem('spendly_guest_user_id');
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function initAuth() {
      try {
        logger.info('Verifying active user session from server...');
        const response = await api.get('/users/me', { signal: controller.signal });
        if (response.data?.user) {
          handleSetUser(response.data.user);
          logger.info(
            { userId: response.data.user.id, isAnonymous: response.data.user.isAnonymous },
            'Session successfully recovered from cookie'
          );
          
          try {
            const streakRes = await api.get('/streaks', { signal: controller.signal });
            setCurrentStreak(streakRes.data.current_streak || 0);
          } catch (streakErr) {
            if (!axios.isCancel(streakErr)) {
              logger.warn({ err: streakErr }, 'Could not fetch streak on initialization');
            }
          }
        } else {
          throw new Error('No user data returned');
        }
      } catch (err) {
        if (axios.isCancel(err)) return;

        logger.warn('No active session found or session expired. Initializing guest session...');
        try {
          const guestUserId = localStorage.getItem('spendly_guest_user_id');
          const response = await api.post('/auth/anonymous', { guestUserId }, { signal: controller.signal });
          if (response.data?.user) {
            handleSetUser(response.data.user);
            logger.info({ userId: response.data.user.id, reused: !!guestUserId }, 'Initialized anonymous guest session');
            setCurrentStreak(0);
          }
        } catch (guestErr) {
          if (!axios.isCancel(guestErr)) {
            logger.error({ err: guestErr }, 'Failed to initialize anonymous guest session');
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, loading, loggedIn, currentStreak, setCurrentStreak }}>
      {children}
    </AuthContext.Provider>
  );
}
