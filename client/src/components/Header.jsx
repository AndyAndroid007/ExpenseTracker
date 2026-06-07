import { useContext } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { MaskContext } from '../context/MaskContext';
import { AuthContext } from '../context/AuthContext';

const TAB_TITLES = {
  log: 'Log Expense',
  insights: 'Insights',
  history: 'History',
  settings: 'Settings',
};

export default function Header({ tab }) {
  const { masked, toggle } = useContext(MaskContext);
  const { loggedIn } = useContext(AuthContext);
  return (
    <header style={{
      background: 'var(--color-surface)',
      borderBottom: '0.5px solid var(--color-separator)',
      padding: '0 clamp(1rem, 4vw, 2rem)',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{
          fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
          fontWeight: 700,
          color: 'var(--color-label-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          Spendly
        </span>
        <span style={{
          fontSize: '0.8125rem',
          color: 'var(--color-label-tertiary)',
          fontWeight: 400,
        }}>
          {TAB_TITLES[tab] || ''}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.3rem 0.75rem',
          borderRadius: '999px',
          background: '#fff3e0',
          border: '1px solid #ffcc80',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#bf4800',
          userSelect: 'none',
        }}>
          🔥 <span>7 days</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.625rem',
          borderRadius: '999px',
          background: loggedIn ? '#e8f5e9' : 'var(--color-bg)',
          border: `0.5px solid ${loggedIn ? '#a8d5b8' : 'var(--color-separator)'}`,
          fontSize: '11px',
          fontWeight: 500,
          color: loggedIn ? '#1a7a4a' : 'var(--color-label-tertiary)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '9px' }}>{loggedIn ? '●' : '○'}</span>
          {loggedIn ? 'Synced' : 'Local only'}
        </div>
        <button
          onClick={toggle}
          title={masked ? 'Show amounts' : 'Hide amounts'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--color-bg)',
            border: '0.5px solid var(--color-separator)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-label-tertiary)',
            flexShrink: 0,
          }}
        >
          {masked ? <IconEyeOff size={18} strokeWidth={1.8} /> : <IconEye size={18} strokeWidth={1.8} />}
        </button>
      </div>
    </header>
  );
}
