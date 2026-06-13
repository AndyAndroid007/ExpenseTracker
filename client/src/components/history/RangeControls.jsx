import { useState } from 'react';
import { IconChevronDown, IconCalendar, IconPencil } from '@tabler/icons-react';

const ranges = ['This week', 'This month', 'This year', 'Custom range'];

export default function RangeControls({ range, onRange, dateLabel, onEditCustom }) {
  const [open, setOpen] = useState(false);

  // const btnBase = {
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '6px',
  //   padding: '8px 14px',
  //   borderRadius: '10px',
  //   background: 'var(--color-surface)',
  //   border: '0.5px solid var(--color-separator)',
  //   cursor: 'pointer',
  //   fontSize: '0.875rem',
  //   fontWeight: 500,
  //   color: 'var(--color-label-primary)',
  //   fontFamily: 'inherit',
  // };

  const btnBaseClass = "flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-surface border-[0.5px] border-separator cursor-pointer text-sm font-medium text-label-primary";

  const isCustom = range === 'Custom range';

  return (
    <div 
      className="flex items-center gap-2 flex-wrap"
      // style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
    >
      {/* Range dropdown */}
      <div 
        className="relative"
        // style={{ position: 'relative' }}
      >
        <button 
          onClick={() => setOpen(o => !o)} 
          className={btnBaseClass}
          /* style={btnBase} */
        >
          {range}
          <IconChevronDown
            size={14}
            className={`transition-transform duration-150 text-label-tertiary ${open ? 'rotate-180' : 'rotate-0'}`}
            /* style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              color: 'var(--color-label-tertiary)',
            }} */
          />
        </button>

        {open && (
          <div 
            className="absolute top-[calc(100%+6px)] left-0 z-20 bg-surface border-[0.5px] border-separator rounded-[12px] overflow-hidden min-w-[150px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            /* style={{
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
            }} */
          >
            {ranges.map(r => (
              <button
                key={r}
                onClick={() => { onRange(r); setOpen(false); }}
                className={`block w-full text-left px-4 py-2.5 border-none cursor-pointer text-sm ${r === range ? 'bg-blue-light text-primary font-semibold' : 'bg-transparent text-label-primary font-normal'}`}
                /* style={{
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
                }} */
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date label display */}
      <div 
        className="flex items-center gap-1.25 px-3 py-2 rounded-[10px] bg-bg border-[0.5px] border-separator text-sm text-label-secondary select-none"
        /* style={{
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
        }} */
      >
        <IconCalendar size={14} strokeWidth={1.8} className="text-label-tertiary" /* color="var(--color-label-tertiary)" */ />
        <span>{dateLabel}</span>
        {isCustom && onEditCustom && (
          <button
            onClick={onEditCustom}
            title="Edit date range"
            className="bg-transparent border-none cursor-pointer pl-1 flex items-center text-primary hover:opacity-80"
            /* style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 0 4px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-primary)',
            }} */
          >
            <IconPencil size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}