import MaskedAmount from '../MaskedAmount';

const categoryColors = {
  Food: '#007aff',
  Transport: '#5856d6',
  Shopping: '#32ade6',
  Entertainment: '#c7c7cc',
  Bills: '#32ade6',
  Health: '#5856d6',
  General: '#8e8e93',
};

export default function BreakdownChart({ breakdown = {}, totalSpend = 0 }) {
  const rows = Object.entries(breakdown)
    .map(([label, amount]) => {
      const pct = totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0;
      return {
        label,
        amount,
        pct,
        color: categoryColors[label] || categoryColors.General,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <p 
      className="text-[11px] font-semibold tracking-[0.06em] text-label-tertiary uppercase mb-2 pl-1"
      >
        Breakdown
      </p>
      <div 
      className="bg-surface border-[0.5px] border-separator rounded-[16px] px-4 py-5 flex flex-col gap-3.5"
      >
        {rows.map(row => (
          <div key={row.label} 
          className="flex items-center gap-2.5"
          >
            <span 
            className="w-[74px] shrink-0 text-[12px] text-label-secondary"
            >
              {row.label}
            </span>
            <div 
            className="flex-1 h-[7px] bg-bg rounded-[4px] overflow-hidden"
            >
              <div
                style={{
                  width: `${row.pct}%`,
                  background: row.color,
                }}
                className="h-full rounded-[4px] transition-[width] duration-600 ease"
              />
            </div>
            <span 
            className="w-[52px] shrink-0 text-[12px] font-medium text-label-primary text-right"
            >
              <MaskedAmount amount={row.amount} />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
