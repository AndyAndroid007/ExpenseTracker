import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(window.innerWidth < 640);
  useEffect(() => {
    const h = () => setNarrow(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return narrow;
}

export default function CalendarSheet({ onApply, onClose }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const isNarrow = useIsNarrow();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function selectDay(d) {
    const date = new Date(year, month, d);
    if (!start || (start && end)) { setStart(date); setEnd(null); }
    else {
      if (date < start) { setEnd(start); setStart(date); }
      else setEnd(date);
    }
  }

  function inRange(d) {
    if (!start || !end) return false;
    const date = new Date(year, month, d);
    return date > start && date < end;
  }
  function isStart(d) { return start && new Date(year, month, d).toDateString() === start.toDateString(); }
  function isEnd(d) { return end && new Date(year, month, d).toDateString() === end.toDateString(); }
  function isToday(d) { return new Date(year, month, d).toDateString() === today.toDateString(); }

  function handleApply() {
    if (start) {
      const fmt = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
      const label = end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
      onApply(label);
    }
    onClose();
  }

  const cells = [];
  for (let i = 0; i < getFirstDay(year, month); i++) cells.push(null);
  for (let d = 1; d <= getDaysInMonth(year, month); d++) cells.push(d);

  const calendarContent = (
    <div style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-label-primary)', margin: 0 }}>
          Pick a range
        </p>
        <button
          onClick={onClose}
          style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'var(--color-bg)',
            border: '0.5px solid var(--color-separator)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-label-tertiary)',
          }}
        >
          <IconX size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-label-secondary)', padding: '4px' }}>
          <IconChevronLeft size={18} />
        </button>
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-label-primary)' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-label-secondary)', padding: '4px' }}>
          <IconChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--color-label-tertiary)', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const selected = isStart(d) || isEnd(d);
          const ranged = inRange(d);
          const tod = isToday(d);
          return (
            <button
              key={i}
              onClick={() => selectDay(d)}
              style={{
                aspectRatio: '1',
                borderRadius: '50%',
                border: tod && !selected ? '1.5px solid var(--color-primary)' : 'none',
                background: selected ? 'var(--color-primary)' : ranged ? 'var(--color-blue-light)' : 'transparent',
                color: selected ? '#fff' : ranged ? 'var(--color-primary)' : tod ? 'var(--color-primary)' : 'var(--color-label-primary)',
                cursor: 'pointer',
                fontWeight: selected || tod ? 600 : 400,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 500,
            background: 'var(--color-bg)', color: 'var(--color-label-secondary)',
            border: '0.5px solid var(--color-separator)', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 600,
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            opacity: start ? 1 : 0.5,
          }}
          disabled={!start}
        >
          Apply
        </button>
      </div>
    </div>
  );

  const backdrop = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 100,
        display: 'flex',
        alignItems: isNarrow ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isNarrow ? 0 : '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: isNarrow ? '20px 20px 0 0' : '20px',
          width: '100%',
          maxWidth: isNarrow ? '100%' : '380px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          animation: isNarrow ? 'slideUp 0.22s ease' : 'fadeIn 0.15s ease',
        }}
      >
        {calendarContent}
      </div>
    </div>
  );

  return createPortal(backdrop, document.body);
}
