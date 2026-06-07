import MaskedAmount from '../MaskedAmount';

const categoryColors = {
  Food: { bg: '#fff3e0', color: '#e65100' },
  Transport: { bg: '#e3f2fd', color: '#1565c0' },
  Shopping: { bg: '#fce4ec', color: '#c62828' },
  Entertainment: { bg: '#f3e5f5', color: '#6a1b9a' },
  Bills: { bg: '#e8f5e9', color: '#2e7d32' },
  Health: { bg: '#e0f7fa', color: '#00695c' },
  General: { bg: '#f5f5f5', color: '#424242' },
};

export default function ConfirmCard({ parsed, onConfirm, onEdit }) {
  const { amount, category, dateLabel, confidence } = parsed;
  const cat = categoryColors[category] || categoryColors.General;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-separator)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
          <MaskedAmount amount={amount} />
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: cat.bg, color: cat.color }}
        >
          {category}
        </span>
      </div>
      <p className="text-xs" style={{ color: 'var(--color-label-tertiary)' }}>
        {dateLabel} · confidence: {confidence}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Confirm
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-bg)', color: 'var(--color-label-secondary)', border: '1px solid var(--color-separator)', cursor: 'pointer' }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
