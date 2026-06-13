import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
      onApply(label, start, end);
    }
    onClose();
  }

  const cells = [];
  for (let i = 0; i < getFirstDay(year, month); i++) cells.push(null);
  for (let d = 1; d <= getDaysInMonth(year, month); d++) cells.push(d);

  const calendarContent = (
    <div
      // style={{
      //   padding: '20px',
      //   display: 'flex',
      //   flexDirection: 'column',
      //   gap: '16px',
      // }}
      className="p-4 flex flex-col gap-3"
    >
      {/* Header */}
      <div
        // style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        className="flex items-center justify-between"
      >
        <p
          // style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-label-primary)', margin: 0 }}
          className="text-sm font-semibold text-label-primary m-0"
        >
          Pick a range
        </p>
        <button
          onClick={onClose}
          // style={{
          //   width: '30px', height: '30px', borderRadius: '50%',
          //   background: 'var(--color-bg)',
          //   border: '0.5px solid var(--color-separator)',
          //   display: 'flex', alignItems: 'center', justifyContent: 'center',
          //   cursor: 'pointer', color: 'var(--color-label-tertiary)',
          // }}
          className="w-7 h-7 rounded-full bg-bg border border-separator flex items-center justify-center cursor-pointer text-label-tertiary outline-none focus:outline-none hover:bg-separator/20"
        >
          <IconX size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Month navigation */}
      <div
        // style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        className="flex items-center justify-between"
      >
        <button onClick={prevMonth}
          // style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-label-secondary)', padding: '4px' }}
          className="bg-transparent border-0 cursor-pointer text-label-secondary p-1 outline-none focus:outline-none hover:text-label-primary"
        >
          <IconChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1.5">
          <select
            value={month}
            onChange={e => setMonth(parseInt(e.target.value, 10))}
            className="bg-bg border-[0.5px] border-separator rounded-lg px-1.5 py-0.5 text-xs font-semibold text-label-primary outline-none cursor-pointer focus:border-primary"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value, 10))}
            className="bg-bg border-[0.5px] border-separator rounded-lg px-1.5 py-0.5 text-xs font-semibold text-label-primary outline-none cursor-pointer focus:border-primary"
          >
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button onClick={nextMonth}
          // style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-label-secondary)', padding: '4px' }}
          className="bg-transparent border-0 cursor-pointer text-label-secondary p-1 outline-none focus:outline-none hover:text-label-primary"
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div
        // style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}
        className="grid grid-cols-7 gap-1"
      >
        {DAYS.map(d => (
          <div key={d}
            // style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--color-label-tertiary)', padding: '4px 0' }}
            className="text-center text-[10px] font-semibold text-label-tertiary p-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div
        // style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}
        className="grid grid-cols-7 gap-1"
      >
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const selected = isStart(d) || isEnd(d);
          const ranged = inRange(d);
          const tod = isToday(d);
          return (
            <button
              key={i}
              onClick={() => selectDay(d)}
              /* style={{
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
              }} */
              className={`aspect-square rounded-full cursor-pointer text-xs flex items-center justify-center font-inherit outline-none focus:outline-none ${
                tod && !selected ? 'border-[1.5px] border-primary' : 'border-0 border-transparent'
              } ${
                selected ? 'bg-primary text-white' : ranged ? 'bg-blue-light text-primary' : tod ? 'bg-transparent text-primary' : 'bg-transparent text-label-primary'
              } ${
                selected || tod ? 'font-semibold' : 'font-normal'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div
        // style={{ display: 'flex', gap: '8px', marginTop: '4px' }}
        className="flex gap-2 mt-1"
      >
        <button
          onClick={onClose}
          // style={{
          //   flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 500,
          //   background: 'var(--color-bg)', color: 'var(--color-label-secondary)',
          //   border: '0.5px solid var(--color-separator)', cursor: 'pointer', fontFamily: 'inherit',
          // }}
          className="flex-1 p-[8px] rounded-[8px] text-xs font-semibold bg-bg text-label-secondary border border-separator cursor-pointer font-inherit outline-none focus:outline-none hover:bg-separator/20"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          /* style={{
            flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 600,
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            opacity: start ? 1 : 0.5,
          }} */
          className="flex-1 p-[8px] rounded-[8px] text-xs font-semibold bg-primary text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-inherit outline-none focus:outline-none hover:opacity-95"
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
      /* style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 100,
        display: 'flex',
        alignItems: isNarrow ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isNarrow ? 0 : '1rem',
      }} */
      className={`fixed inset-0 bg-black/35 z-[100] flex ${isNarrow ? 'items-end' : 'items-center'} justify-center ${isNarrow ? 'p-0' : 'p-4'}`}
    >
      <div
        onClick={e => e.stopPropagation()}
        // style={{
        //   background: 'var(--color-surface)',
        //   borderRadius: isNarrow ? '20px 20px 0 0' : '20px',
        //   width: '100%',
        //   maxWidth: isNarrow ? '100%' : '380px',
        //   boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        //   animation: isNarrow ? 'slideUp 0.22s ease' : 'fadeIn 0.15s ease',
        // }}
        className={`bg-surface rounded-tl-[20px] rounded-tr-[20px] ${isNarrow ? 'rounded-bl-0 rounded-br-0' : 'rounded-[20px]'} w-full ${isNarrow ? 'max-w-full' : 'max-w-[300px]'} shadow-lg ${isNarrow ? 'animate-slideUp' : 'animate-fadeIn'}`}
      >
        {calendarContent}
      </div>
    </div>
  );

  return createPortal(backdrop, document.body);
}
