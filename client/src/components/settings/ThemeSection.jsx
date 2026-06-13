import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function ThemeSection() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div
      /* style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-separator)',
        borderRadius: 'var(--radius-card)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }} */
      className="bg-surface border-[0.5px] border-separator rounded-card p-md flex items-center justify-between"
    >
      <div>
        <p
          /* style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-label-primary)', margin: 0 }} */
          className="text-[0.9375rem] font-medium text-label-primary m-0"
        >
          Theme
        </p>
        <p
          /* style={{ fontSize: '0.8125rem', color: 'var(--color-label-tertiary)', marginTop: '2px' }} */
          className="text-[0.8125rem] text-label-tertiary mt-0.5"
        >
          {theme === 'light' ? 'Light mode active' : 'Dark mode active'}
        </p>
      </div>
      <div
        /* style={{ display: 'flex', gap: '6px', background: 'var(--color-bg)', borderRadius: '10px', padding: '4px' }} */
        className="flex gap-1.5 bg-bg rounded-[10px] p-1"
      >
        {['light', 'dark'].map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            /* style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: theme === t ? 600 : 400,
              background: theme === t ? 'var(--color-surface)' : 'transparent',
              color: theme === t ? 'var(--color-label-primary)' : 'var(--color-label-tertiary)',
              boxShadow: theme === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }} */
            className={`flex items-center gap-1.25 px-3 py-1.5 rounded-lg border-none cursor-pointer text-[0.8125rem] transition-all duration-150 ease-in-out ${
              theme === t ? 'font-semibold bg-surface text-label-primary shadow-sm' : 'font-normal bg-transparent text-label-tertiary shadow-none'
            }`}
          >
            {t === 'light' ? <IconSun size={14} strokeWidth={2} /> : <IconMoon size={14} strokeWidth={2} />}
            {t === 'light' ? 'Light' : 'Dark'}
          </button>
        ))}
      </div>
    </div>
  );
}
