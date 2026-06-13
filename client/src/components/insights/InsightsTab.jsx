import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StatCard from './StatCard';
import BreakdownChart from './BreakdownChart';
import InsightCard from './InsightCard';
import api from '../../utils/api';
import logger from '../../utils/logger';

const INSIGHT_ICONS = ['flame', 'moon', 'trending-up'];
const INSIGHT_ACCENTS = ['violet', 'blue', 'violet'];

export default function InsightsTab({ active }) {
  const { loggedIn } = useContext(AuthContext);
  const [period, setPeriod] = useState('weekly');
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;

    async function fetchInsights() {
      setLoading(true);
      try {
        logger.info({ period }, 'Fetching insights from server...');
        const response = await api.get(`/insights/${period}`);
        setInsightsData(response.data);
        logger.info({ period }, 'Successfully fetched period insights');
      } catch (err) {
        logger.error({ err, period }, 'Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [period, active]);

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
        className="max-w-[640px] mx-auto px-[clamp(1rem,4vw,2rem)] py-[clamp(1rem,3vw,1.5rem)] flex flex-col gap-md"
      >
        {/* Sync Status Header */}
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
              className={`text-sm font-semibold m-0 ${loggedIn ? 'text-green-700' : 'text-label-primary'}`}
            >
              {loggedIn ? 'Data synced to cloud' : 'Stored locally on this device'}
            </p>
            <p 
              //style={{ fontSize: '11px', color: loggedIn ? '#2e7d4a' : 'var(--color-label-tertiary)', marginTop: '2px' }}
              className={`text-[11px] mt-0.5 ${loggedIn ? 'text-green-800' : 'text-label-tertiary'}`}
            >
              {loggedIn
                ? 'Your streak and insights are backed up and available on all your devices.'
                : 'Sign in in Settings to sync your streak and insights across devices.'}
            </p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex gap-1 p-0.5 bg-surface border-[0.5px] border-separator rounded-xl max-w-[280px]">
          {['weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1 rounded-[10px] text-xs font-semibold capitalize cursor-pointer transition-colors outline-none focus:outline-none ${
                period === p 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-transparent text-label-secondary hover:text-label-primary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-label-secondary font-medium text-xs animate-pulse">
            Analyzing statistics & generating insights...
          </div>
        ) : insightsData ? (
          <>
            <div>
              <p 
                // style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-label-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}
                className="text-[11px] font-[600] tracking-[0.06em] text-label-tertiary uppercase mb-3 capitalize"
              >
                {period} summary
              </p>
              <div 
                //style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
                className="grid grid-cols-2 gap-2"
              >
                <StatCard 
                  label="Total spent" 
                  value={insightsData.total_spend} 
                  isAmount 
                  sub={insightsData.top_category ? `Top: ${insightsData.top_category}` : 'No spend logged'} 
                />
                <StatCard 
                  label="No-spend days" 
                  value={insightsData.no_spend_days} 
                  sub={period === 'weekly' ? 'Logged this week' : 'Logged this period'} 
                  accentColor="#5856d6" 
                  subColor="#5856d6" 
                />
                <StatCard 
                  label="Saved days" 
                  value={insightsData.save_days} 
                  sub="Target goal count" 
                  accentColor="#5856d6" 
                  subColor="#5856d6" 
                />
                <StatCard 
                  label="Confidence Level" 
                  value={insightsData.data_confidence} 
                  sub={insightsData.data_confidence === 'low' ? 'Insufficient data' : 'High quality insights'} 
                />
              </div>
            </div>

            <BreakdownChart 
              breakdown={insightsData.category_breakdown} 
              totalSpend={insightsData.total_spend} 
            />

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
                {insightsData.insights && insightsData.insights.length > 0 ? (
                  insightsData.insights.map((insight, idx) => (
                    <InsightCard 
                      key={idx}
                      text={insight}
                      icon={INSIGHT_ICONS[idx % INSIGHT_ICONS.length]}
                      accent={INSIGHT_ACCENTS[idx % INSIGHT_ACCENTS.length]}
                    />
                  ))
                ) : (
                  <div className="text-center py-4 bg-surface border border-separator rounded-card text-xs text-label-tertiary">
                    No insights generated for this period.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-label-secondary text-xs">
            Could not fetch insights. Log some expenses first!
          </div>
        )}

      </div>
    </div>
  );
}
