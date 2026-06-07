import { useState } from 'react';
import RangeControls from './RangeControls';
import EntryList from './EntryList';
import CalendarSheet from './CalendarSheet';
import MaskedAmount from '../MaskedAmount';

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(date) {
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

function computeDateLabel(range) {
  const today = new Date();
  if (range === 'This week') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return `${fmtDate(start)} - ${fmtDate(today)}`;
  }
  if (range === 'This month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return `${fmtDate(start)} - ${fmtDate(today)}`;
  }
  if (range === 'This year') {
    const start = new Date(today.getFullYear(), 0, 1);
    return `${fmtDate(start)} - ${fmtDate(today)}`;
  }
  return null;
}

function SummaryGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
      {[
        { label: 'Total spent', value: <MaskedAmount amount={3240} prefix="Rs." />, color: 'var(--color-label-primary)' },
        { label: 'Transactions', value: '11', color: 'var(--color-label-primary)' },
        { label: 'No-spend days', value: '3', color: '#5856d6' },
        { label: 'Top category', value: 'Food', color: 'var(--color-label-primary)' },
      ].map(item => (
        <div
          key={item.label}
          style={{
            background: 'var(--color-surface)',
            border: '0.5px solid var(--color-separator)',
            borderRadius: '16px',
            padding: 'clamp(0.875rem, 2vw, 1.125rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <p style={{ fontSize: '11px', color: 'var(--color-label-tertiary)', fontWeight: 500 }}>{item.label}</p>
          <p style={{
            fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
            fontWeight: 700,
            color: item.color,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function HistoryTab() {
  const [range, setRange] = useState('This week');
  const [customLabel, setCustomLabel] = useState(null);
  const [showCal, setShowCal] = useState(false);

  const dateLabel = range === 'Custom range'
    ? (customLabel || 'Pick dates')
    : computeDateLabel(range);

  function handleRangeChange(r) {
    setRange(r);
    if (r === 'Custom range') setShowCal(true);
  }

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <RangeControls
            range={range}
            onRange={handleRangeChange}
            dateLabel={dateLabel}
            onEditCustom={range === 'Custom range' ? () => setShowCal(true) : null}
          />
          <SummaryGrid />
          <EntryList />
        </div>
      </div>
      {showCal && (
        <CalendarSheet
          onApply={label => setCustomLabel(label)}
          onClose={() => setShowCal(false)}
        />
      )}
    </>
  );
}