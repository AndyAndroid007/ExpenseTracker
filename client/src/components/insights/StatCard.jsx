import MaskedAmount from '../MaskedAmount';

export default function StatCard({ label, value, isAmount, sub, accentColor, subColor }) {
  // const valueColor = accentColor || 'var(--color-label-primary)';
  return (
    <div
      // style={{
      //   background: 'var(--color-surface)',
      //   border: '0.5px solid var(--color-separator)',
      //   borderRadius: 'var(--radius-card)',
      //   padding: 'clamp(0.875rem, 2vw, 1.125rem)',
      //   display: 'flex',
      //   flexDirection: 'column',
      //   gap: '4px',
      // }}
      className="bg-surface border-[0.5px] border-separator rounded-[var(--radius-card)] p-[var(--space-md)] flex flex-col gap-1"
    >
      <p
        // style={{ fontSize: '11px', color: 'var(--color-label-tertiary)', fontWeight: 500 }}
        className="text-[11px] font-medium text-label-tertiary"
      >
        {label}
      </p>
      <p
        // style={{
        //   fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
        //   fontWeight: 700,
        //   color: valueColor,
        //   letterSpacing: '-0.03em',
        //   lineHeight: 1.1,
        // }}
        className="text-[clamp(1.375rem, 3vw, 1.75rem)] font-bold tracking-[-0.03em] leading-[1.1]"
        style={{ color: accentColor || 'var(--color-label-primary)' }}
      >
        {isAmount ? <MaskedAmount amount={value} prefix="₹" /> : value}
      </p>
      {sub && (
        <p
          // style={{ fontSize: '11px', color: subColor || 'var(--color-label-tertiary)', fontWeight: 500, marginTop: '2px' }}
          className="text-[11px] font-medium mt-0.5"
          style={{ color: subColor || 'var(--color-label-tertiary)' }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
