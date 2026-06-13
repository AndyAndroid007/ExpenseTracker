import { useContext } from 'react';
import { IconEye, IconEyeOff, IconSun, IconMoon } from '@tabler/icons-react';
import { MaskContext } from '../context/MaskContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const TAB_TITLES = {
  log: 'Log Expense',
  insights: 'Insights',
  history: 'History',
  settings: 'Settings',
};

export default function Header({ tab }) {
  const { masked, toggle } = useContext(MaskContext);
  const { loggedIn, currentStreak } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <header
      className="flex items-center justify-between shrink-0 h-11 bg-surface border-b-[0.5px] border-[var(--color-separator)] px-[var(--space-lg)]"
      /* style={{
        background: 'var(--color-surface)',
        borderBottom: '0.5px solid var(--color-separator)',
        padding: '0 clamp(1rem, 4vw, 2rem)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }} */
    >
        <div
        /* style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }} */
        className="flex items-baseline gap-3"
      >
        <span
          /* style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            fontWeight: 700,
            color: 'var(--color-label-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }} */
          className="text-base font-bold text-label-primary tracking-tight leading-none"
        >
          Spendly
        </span>
        <span
          /* style={{
            fontSize: '0.8125rem',
            color: 'var(--color-label-tertiary)',
            fontWeight: 400,
          }} */
          className="text-[11px] text-label-tertiary font-normal"
        >
          {TAB_TITLES[tab] || ''}
        </span>
      </div>

      <div 
      /* style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} */
      className="flex items-center gap-2"
      >
        <div 
        className="flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-orange-50 border border-orange-100 text-[10px] font-semibold text-orange-700 select-none"
        /* style={{
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
        }} */
        >
          🔥 <span>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
        </div>
        <div 
        /* style={{
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
        }} */
        className={`flex items-center gap-1 px-2 py-1 rounded-full border-[0.5px] text-[10px] font-medium select-none whitespace-nowrap ${loggedIn ? 'bg-green-50 border-green-200 text-green-700' : 'bg-bg border-[var(--color-separator)] text-label-tertiary'}`}
        >
          <span 
          /* style={{ fontSize: '9px' }} */
          className="text-[9px]"
          >
            {loggedIn ? '●' : '○'}
          </span>
          {loggedIn ? 'Synced' : 'Local only'}
        </div>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="w-7 h-7 rounded-full bg-bg border-[0.5px] border-[var(--color-separator)] flex items-center justify-center cursor-pointer shrink-0 text-label-tertiary hover:bg-separator/20 focus:outline-none"
        >
          {theme === 'light' ? <IconMoon size={16} strokeWidth={1.6} /> : <IconSun size={16} strokeWidth={1.6} />}
        </button>
        <button
          onClick={toggle}
          title={masked ? 'Show amounts' : 'Hide amounts'}
          /* style={{
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
          }} */
          className="w-7 h-7 rounded-full bg-bg border-[0.5px] border-[var(--color-separator)] flex items-center justify-center cursor-pointer shrink-0 text-label-tertiary hover:bg-separator/20 focus:outline-none"
        >
          {masked ? <IconEyeOff size={16} strokeWidth={1.6} /> : <IconEye size={16} strokeWidth={1.6} />}
        </button>
      </div>
    </header>
  );
}
