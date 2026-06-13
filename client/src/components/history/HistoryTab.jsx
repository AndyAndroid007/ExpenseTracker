import { useState, useEffect } from 'react';
import RangeControls from './RangeControls';
import EntryList from './EntryList';
import CalendarSheet from './CalendarSheet';
import StatCard from '../insights/StatCard';
import api from '../../utils/api';
import logger from '../../utils/logger';

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(date) {
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

function SummaryGrid({ totalSpent, transactionCount, noSpendCount, topCategory }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard label="Total spent" value={totalSpent} isAmount />
      <StatCard label="Transactions" value={transactionCount} />
      <StatCard label="No-spend days" value={noSpendCount} accentColor="#5856d6" subColor="#5856d6" />
      <StatCard label="Top category" value={topCategory} />
    </div>
  );
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function groupEntriesByDate(entries) {
  const groups = {};

  entries.forEach(entry => {
    const dateStr = entry.expenseDate.substring(0, 10);
    const dateParts = dateStr.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    const localDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let dateLabel = '';
    const localDateZero = new Date(localDate);
    localDateZero.setHours(0,0,0,0);

    if (localDateZero.getTime() === today.getTime()) {
      dateLabel = 'Today';
    } else if (localDateZero.getTime() === yesterday.getTime()) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = DAYS_OF_WEEK[localDate.getDay()];
    }

    const dateSub = `${localDate.getDate()} ${SHORT_MONTHS[localDate.getMonth()]}`;

    const key = dateStr;
    if (!groups[key]) {
      groups[key] = {
        dateLabel,
        dateSub,
        entries: []
      };
    }

    groups[key].entries.push({
      id: entry.id,
      title: entry.rawText,
      category: entry.category || 'General',
      amount: Number(entry.amount),
      type: entry.type,
      nospend: entry.type === 'no_spend',
      saveday: entry.type === 'save_day'
    });
  });

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map(k => groups[k]);
}

export default function HistoryTab({ active }) {
  const [range, setRange] = useState('This week');
  const [customLabel, setCustomLabel] = useState(null);
  const [customDates, setCustomDates] = useState({ start: null, end: null });
  const [showCal, setShowCal] = useState(false);
  const [rawEntries, setRawEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const dateLabel = range === 'Custom range'
    ? (customLabel || 'Pick dates')
    : computeDateLabel(range);

  useEffect(() => {
    if (!active) return;

    async function fetchEntries() {
      setLoading(true);
      try {
        let fromDateStr, toDateStr;
        const today = new Date();

        if (range === 'This week') {
          const start = new Date(today);
          start.setDate(today.getDate() - 6);
          fromDateStr = toIsoDate(start);
          toDateStr = toIsoDate(today);
        } else if (range === 'This month') {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          fromDateStr = toIsoDate(start);
          toDateStr = toIsoDate(today);
        } else if (range === 'This year') {
          const start = new Date(today.getFullYear(), 0, 1);
          fromDateStr = toIsoDate(start);
          toDateStr = toIsoDate(today);
        } else if (range === 'Custom range') {
          if (!customDates.start) {
            setRawEntries([]);
            setLoading(false);
            return;
          }
          fromDateStr = toIsoDate(customDates.start);
          toDateStr = customDates.end ? toIsoDate(customDates.end) : fromDateStr;
        }

        logger.info({ from: fromDateStr, to: toDateStr }, 'Fetching filtered entries from server...');
        const response = await api.get('/entries', {
          params: {
            from: fromDateStr,
            to: toDateStr,
            limit: 100,
          }
        });

        if (response.data?.entries) {
          setRawEntries(response.data.entries);
          logger.info({ count: response.data.entries.length }, 'Successfully fetched filtered entries');
        }
      } catch (err) {
        logger.error({ err }, 'Failed to fetch entries in HistoryTab');
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, [range, customDates, active]);

  function handleRangeChange(r) {
    setRange(r);
    if (r === 'Custom range') {
      setShowCal(true);
    }
  }

  function handleApplyCustom(label, start, end) {
    setCustomLabel(label);
    setCustomDates({ start, end });
  }

  // Compute stats
  let totalSpent = 0;
  let transactionCount = 0;
  let noSpendCount = 0;
  const categorySums = {};

  rawEntries.forEach(entry => {
    if (entry.type === 'expense') {
      const amt = Number(entry.amount) || 0;
      totalSpent += amt;
      transactionCount++;
      const cat = entry.category || 'General';
      categorySums[cat] = (categorySums[cat] || 0) + amt;
    } else if (entry.type === 'no_spend') {
      noSpendCount++;
    }
  });

  let topCategory = '—';
  let maxSpent = 0;
  Object.entries(categorySums).forEach(([cat, sum]) => {
    if (sum > maxSpent) {
      maxSpent = sum;
      topCategory = cat;
    }
  });

  const groupedGroups = groupEntriesByDate(rawEntries);

  return (
    <>
      <div 
        className="flex-1 overflow-y-auto bg-bg scrollbar-none"
        // style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}
      >
        <div 
          className="max-w-[640px] mx-auto px-[clamp(1rem,4vw,2rem)] py-[clamp(1rem,3vw,1.5rem)] flex flex-col gap-4"
          // style={{
          //   maxWidth: '900px',
          //   margin: '0 auto',
          //   padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
          //   display: 'flex',
          //   flexDirection: 'column',
          //   gap: '1rem',
          // }}
        >
          <RangeControls
            range={range}
            onRange={handleRangeChange}
            dateLabel={dateLabel}
            onEditCustom={range === 'Custom range' ? () => setShowCal(true) : null}
          />
          <SummaryGrid
            totalSpent={totalSpent}
            transactionCount={transactionCount}
            noSpendCount={noSpendCount}
            topCategory={topCategory}
          />
          {loading ? (
            <div className="text-center py-8 text-label-secondary font-medium text-xs">
              Loading entries...
            </div>
          ) : (
            <EntryList groups={groupedGroups} />
          )}
        </div>
      </div>
      {showCal && (
        <CalendarSheet
          onApply={handleApplyCustom}
          onClose={() => setShowCal(false)}
        />
      )}
    </>
  );
}