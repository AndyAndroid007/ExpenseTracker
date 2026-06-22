import { useState } from 'react';
import MaskedAmount from '../MaskedAmount';
import EditCardForm from './EditCardForm';

// const categoryColors = {
//   Food: { bg: '#fff3e0', color: '#e65100' },
//   Transport: { bg: '#e3f2fd', color: '#1565c0' },
//   Shopping: { bg: '#fce4ec', color: '#c62828' },
//   Entertainment: { bg: '#f3e5f5', color: '#6a1b9a' },
//   Bills: { bg: '#e8f5e9', color: '#2e7d32' },
//   Health: { bg: '#e0f7fa', color: '#00695c' },
//   General: { bg: '#f5f5f5', color: '#424242' },
// };

const categoryClasses = {
  Food: 'bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30',
  Transport: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
  Shopping: 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
  Entertainment: 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30',
  Bills: 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30',
  Health: 'bg-cyan-50 text-cyan-700 border border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30',
  General: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50',
};

export default function ConfirmCard({ parsed, onConfirm }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditCardForm
        parsed={parsed}
        onSave={(updated) => {
          setIsEditing(false);
          // EditCardForm already called PATCH — pass alreadyPatched=true
          onConfirm(updated, true);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  // const cat = categoryColors[parsed.category] || categoryColors.General;
  const catClass = categoryClasses[parsed.category] || categoryClasses.General;

  const isConfirmDisabled = (!parsed.type || parsed.type === 'expense') && (parsed.amount === null || parsed.amount === undefined || Number(parsed.amount) <= 0);

  return (
    <div
      className="rounded-xl p-3 bg-surface border-[0.5px] border-[var(--color-separator)] shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex flex-col gap-2.5 max-w-[280px] animate-fadeIn"
      // style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-separator)' }}
    >
      <div className="flex items-center gap-2">
        <span 
          className="text-xl font-bold text-primary"
          // style={{ color: 'var(--color-primary)' }}
        >
          <MaskedAmount amount={parsed.amount} />
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${catClass}`}
          // style={{ background: cat.bg, color: cat.color }}
        >
          {parsed.category}
        </span>
      </div>
      {parsed.unmappedMerchant && parsed.category === 'General' && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 rounded-lg p-2 text-[9px] leading-normal font-medium animate-fadeIn">
          🔍 New merchant detected ("{parsed.unmappedMerchant}"). Correct the category to help Spendly learn!
        </div>
      )}
      <p 
        className="text-[10px] text-label-tertiary"
        // style={{ color: 'var(--color-label-tertiary)' }}
      >
        {parsed.dateLabel} · Confidence: {parsed.confidence}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(parsed, false)}
          disabled={isConfirmDisabled}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          // style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Confirm
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-bg text-label-secondary border border-[var(--color-separator)] cursor-pointer hover:bg-surface transition-all"
          // style={{ background: 'var(--color-bg)', color: 'var(--color-label-secondary)', border: '1px solid var(--color-separator)', cursor: 'pointer' }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
