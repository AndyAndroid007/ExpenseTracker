import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StatCard from './StatCard';
import BreakdownChart from './BreakdownChart';
import InsightCard from './InsightCard';

export default function InsightsTab() {
  const { loggedIn } = useContext(AuthContext);
  return (
    <div 
    // style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}
    className="flex-1 overflow-y-auto bg-bg"
    >
      <div 
      // style={{
      //   maxWidth: '900px',
      //   margin: '0 auto',
      //   padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
      //   display: 'flex',
      //   flexDirection: 'column',
      //   gap: 'clamp(0.875rem, 2vw, 1.25rem)',
      // }}
      className="max-w-[900px] mx-auto px-[clamp(1rem, 3vw, 1.5rem)] py-[clamp(1rem, 4vw, 2rem)] flex flex-col gap-md"
      >

        <div 
        // style={{
        //   display: 'flex',
        //   alignItems: 'center',
        //   gap: '0.625rem',
        //   padding: '0.75rem 1rem',
        //   borderRadius: '12px',
        //   background: loggedIn ? '#e8f5e9' : 'var(--color-surface)',
        //   border: `0.5px solid ${loggedIn ? '#a8d5b8' : 'var(--color-separator)'}`,
        // }}
        className={`flex items-center gap-[10px] px-4 py-3 rounded-[12px] border-[0.5px] ${loggedIn ? 'bg-green-50 border-green-200' : 'bg-surface border-separator'}`}
        >
          <span 
          // style={{ fontSize: '16px' }}
          className="text-[16px]"
          >
            {loggedIn ? '☁️' : '📱'}
          </span>
          <div>
            <p 
            //style={{ fontSize: '0.8125rem', fontWeight: 600, color: loggedIn ? '#1a7a4a' : 'var(--color-label-primary)', margin: 0 }}
            className={`text-sm font-semibold margin-0 ${loggedIn ? 'text-green-700' : 'text-label-primary'}`}
            >
              {loggedIn ? 'Data synced to cloud' : 'Stored locally on this device'}
            </p>
            <p 
            //style={{ fontSize: '11px', color: loggedIn ? '#2e7d4a' : 'var(--color-label-tertiary)', marginTop: '2px' }}
            className={`text-[11px] mt-0.5 ${loggedIn ? 'text-green-800' : 'text-label-tertiary'}`}>
              {loggedIn
                ? 'Your streak and insights are backed up and available on all your devices.'
                : 'Sign in in Settings to sync your streak and insights across devices.'}
            </p>
          </div>
        </div>

        <div>
          <p 
          // style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-label-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}
          className="text-[11px] font-[600] tracking-[0.06em] text-label-tertiary uppercase mb-3"
          >
            This week
          </p>
          <div 
          //style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
          className="grid grid-cols-2 gap-2"
          >
            <StatCard label="Total spent" value={3240} isAmount sub="↑ 12% vs last week" subColor="#007aff" />
            <StatCard label="No-spend days" value="3" sub="Personal best" accentColor="#5856d6" subColor="#5856d6" />
            <StatCard label="Avg daily spend" value={463} isAmount sub="Across 7 days" />
            <StatCard label="Saved days" value="1" sub="This week" accentColor="#5856d6" subColor="#5856d6" />
          </div>
        </div>

        <BreakdownChart />

        <div>
          <p 
          //style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-label-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}
          className="text-[11px] font-[600] tracking-[0.06em] text-label-tertiary uppercase mb-3"
          >
            Insights
          </p>
          <div 
          //style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          className="flex flex-col gap-2"
          >
            <InsightCard accent="violet" icon="flame" text="You had **3 no-spend days** this week — a personal best." />
            <InsightCard accent="blue" icon="moon" text="**Evening spending** is 2× higher than mornings. Most logs after 7 PM." />
            <InsightCard accent="violet" icon="trending-up" text="Food spend up **18%** compared to last week." />
          </div>
        </div>

      </div>
    </div>
  );
}
