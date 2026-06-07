import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StatCard from './StatCard';
import BreakdownChart from './BreakdownChart';
import InsightCard from './InsightCard';

export default function InsightsTab() {
  const { loggedIn } = useContext(AuthContext);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(0.875rem, 2vw, 1.25rem)',
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          background: loggedIn ? '#e8f5e9' : 'var(--color-surface)',
          border: `0.5px solid ${loggedIn ? '#a8d5b8' : 'var(--color-separator)'}`,
        }}>
          <span style={{ fontSize: '16px' }}>{loggedIn ? '☁️' : '📱'}</span>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: loggedIn ? '#1a7a4a' : 'var(--color-label-primary)', margin: 0 }}>
              {loggedIn ? 'Data synced to cloud' : 'Stored locally on this device'}
            </p>
            <p style={{ fontSize: '11px', color: loggedIn ? '#2e7d4a' : 'var(--color-label-tertiary)', marginTop: '2px' }}>
              {loggedIn
                ? 'Your streak and insights are backed up and available on all your devices.'
                : 'Sign in in Settings to sync your streak and insights across devices.'}
            </p>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-label-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}>
            This week
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <StatCard label="Total spent" value={3240} isAmount sub="↑ 12% vs last week" subColor="#007aff" />
            <StatCard label="No-spend days" value="3" sub="Personal best" accentColor="#5856d6" subColor="#5856d6" />
            <StatCard label="Avg daily spend" value={463} isAmount sub="Across 7 days" />
            <StatCard label="Saved days" value="1" sub="This week" accentColor="#5856d6" subColor="#5856d6" />
          </div>
        </div>

        <BreakdownChart />

        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-label-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Insights
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InsightCard accent="violet" icon="flame" text="You had **3 no-spend days** this week — a personal best." />
            <InsightCard accent="blue" icon="moon" text="**Evening spending** is 2× higher than mornings. Most logs after 7 PM." />
            <InsightCard accent="violet" icon="trending-up" text="Food spend up **18%** compared to last week." />
          </div>
        </div>

      </div>
    </div>
  );
}
