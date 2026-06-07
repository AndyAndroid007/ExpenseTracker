import { IconMessage2, IconChartBar, IconClock, IconSettings } from '@tabler/icons-react';

const tabs = [
  { id: 'log', label: 'Log', Icon: IconMessage2 },
  { id: 'insights', label: 'Insights', Icon: IconChartBar },
  { id: 'history', label: 'History', Icon: IconClock },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
];

export default function BottomNav({ active, onSelect }) {
  return (
    <nav style={{
      background: 'var(--color-surface)',
      borderTop: '0.5px solid var(--color-separator)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      flexShrink: 0,
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0 12px',
              gap: '3px',
              color: isActive ? 'var(--color-primary)' : 'var(--color-label-tertiary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              position: 'relative',
            }}
          >
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '32px',
                height: '2px',
                background: 'var(--color-primary)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.01em',
            }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
