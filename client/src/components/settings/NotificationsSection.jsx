import { useState, useEffect } from 'react';
import { subscribeUserToPush, unsubscribeUserFromPush } from '../../utils/pushNotifications';
import api from '../../utils/api';
import AlertBox from '../ui/AlertBox';

export default function NotificationsSection() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: 'success', message: '' });
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    // Fetch streak data for freezes display
    api.get('/streaks')
      .then(res => setStreakData(res.data))
      .catch(err => console.error('Failed to fetch streak data:', err));

    // Check if push subscription already exists on device
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setIsEnabled(true);
          }
        });
      });
    }
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    setAlertInfo({ type: 'success', message: '' });
    try {
      if (isEnabled) {
        await unsubscribeUserFromPush();
        setIsEnabled(false);
        setAlertInfo({ type: 'warning', message: 'Reminders disabled.' });
      } else {
        await subscribeUserToPush();
        setIsEnabled(true);
        setAlertInfo({ type: 'success', message: '🔥 Reminders enabled! You will receive daily streak alerts.' });
      }
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: err.message || 'Failed to update notification settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSend = async () => {
    try {
      const res = await api.post('/notifications/test-send');
      if (res.status === 200) {
        setAlertInfo({ type: 'success', message: '🚀 Test notification dispatched to device!' });
      } else {
        setAlertInfo({ type: 'error', message: res.data?.message || 'Failed to dispatch test notification.' });
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Failed to reach server for test notification.' });
    }
  };

  return (
    <>
      <AlertBox
        description={alertInfo.message}
        type={alertInfo.type}
        onClose={() => setAlertInfo({ ...alertInfo, message: '' })}
      />
      <div className="bg-surface border-[0.5px] border-separator rounded-card p-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.9375rem] font-medium text-label-primary m-0">Daily Streak Reminders</p>
            <p className="text-[0.8125rem] text-label-tertiary mt-0.5 m-0">
              Receive mobile alerts at 8 PM local time to protect your streak.
            </p>
          </div>
          <div className="flex gap-1 bg-bg border-[0.5px] border-separator rounded-xl p-1 shrink-0">
            <button
              onClick={() => !isEnabled && handleToggle()}
              disabled={loading}
              className={`px-3 py-1 rounded-lg border-none cursor-pointer text-[0.8125rem] transition-all duration-150 ease-in-out ${
                isEnabled
                  ? 'font-semibold bg-surface text-emerald-500 shadow-sm'
                  : 'font-normal bg-transparent text-label-tertiary shadow-none hover:text-label-secondary'
              }`}
            >
              {loading && !isEnabled ? '...' : 'Enable'}
            </button>
            <button
              onClick={() => isEnabled && handleToggle()}
              disabled={loading}
              className={`px-3 py-1 rounded-lg border-none cursor-pointer text-[0.8125rem] transition-all duration-150 ease-in-out ${
                !isEnabled
                  ? 'font-semibold bg-surface text-label-primary shadow-sm'
                  : 'font-normal bg-transparent text-label-tertiary shadow-none hover:text-label-secondary'
              }`}
            >
              {loading && isEnabled ? '...' : 'Disable'}
            </button>
          </div>
        </div>

        {isEnabled && (
          <>
            <div className="h-[0.5px] bg-separator my-1" />
            <div className="flex items-center justify-between">
              <span className="text-[0.8125rem] text-label-secondary">Verify device connection</span>
              <button
                onClick={handleTestSend}
                className="px-2.5 py-1 rounded-lg bg-bg text-xs font-medium text-label-primary border-[0.5px] border-separator hover:bg-surface-hover cursor-pointer"
              >
                Send Test Push
              </button>
            </div>
          </>
        )}

        {streakData && (
          <>
            <div className="h-[0.5px] bg-separator my-1" />
            <div className="flex items-center justify-between">
              <span className="text-[0.8125rem] text-label-secondary">Streak Protection Inventory</span>
              <span className="text-xs font-semibold text-label-primary flex items-center gap-1">
                🧊 {streakData.freezes_available ?? 0} Freezes Available
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
