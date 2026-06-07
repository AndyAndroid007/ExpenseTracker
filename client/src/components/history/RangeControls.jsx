import { useState } from 'react';
import { IconChevronDown, IconCalendar, IconPencil } from '@tabler/icons-react';

const ranges = ['This week', 'This month', 'This year', 'Custom range'];

export default function RangeControls({ range, onRange, dateLabel, onEditCustom }) {
  const [open, setOpen] = useState(false);

  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    background: 'var(--color-surface)',
    border: '0.5px solid var(--color-separator)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-label-primary)',
    fontFamily: 'inherit',
  };

  const isCustom = range === 'Custom range';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Range dropdown */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(o => !o)} style={btnBase}>
          {range}
          <IconChevronDown
            size={14}
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              color: 'var(--color-label-tertiary)',
            }}
          />
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 20,
            background: 'var(--color-surface)',
            border: '0.5px solid var(--color-separator)',
            borderRadius: '12px',
            overflow: 'hidden',
            minWidth: '150px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}>
            {ranges.map(r => (
              <button
                key={r}
                onClick={() => { onRange(r); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: r === range ? 'var(--color-blue-light)' : 'transparent',
                  color: r === range ? 'var(--color-primary)' : 'var(--color-label-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: r === range ? 600 : 400,
                  fontFamily: 'inherit',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date label display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '8px 12px',
        borderRadius: '10px',
        background: 'var(--color-bg)',
        border: '0.5px solid var(--color-separator)',
        fontSize: '0.875rem',
        color: 'var(--color-label-secondary)',
        userSelect: 'none',
      }}>
        <IconCalendar size={14} strokeWidth={1.8} color="var(--color-label-tertiary)" />
        <span>{dateLabel}</span>
        {isCustom && onEditCustom && (
          <button
            onClick={onEditCustom}
            title="Edit date range"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 0 4px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <IconPencil size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}