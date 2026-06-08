import MaskedAmount from '../MaskedAmount';

const rows = [
  { label: 'Food', pct: 78, color: '#007aff', amount: 2530 },
  { label: 'Transport', pct: 50, color: '#5856d6', amount: 1620 },
  { label: 'Shopping', pct: 33, color: '#32ade6', amount: 1070 },
  { label: 'Bills', pct: 18, color: '#c7c7cc', amount: 583 },
];

export default function BreakdownChart() {
  return (
    <>
      <p 
      // style={{
      //   fontSize: '11px',
      //   fontWeight: 600,
      //   letterSpacing: '0.06em',
      //   textTransform: 'uppercase',
      //   color: 'var(--color-label-tertiary)',
      //   marginBottom: '8px',
      //   paddingLeft: '4px',
      // }}
      className="text-[11px] font-semibold tracking-[0.06em] text-label-tertiary uppercase mb-2 pl-1"
      >
        Breakdown
      </p>
      <div 
      // style={{
      //   background: 'var(--color-surface)',
      //   border: '0.5px solid var(--color-separator)',
      //   borderRadius: '16px',
      //   padding: '1rem 1.25rem',
      //   display: 'flex',
      //   flexDirection: 'column',
      //   gap: '0.875rem',
      // }}
      className="bg-surface border-[0.5px] border-separator rounded-[16px] px-4 py-5 flex flex-col gap-3.5"
      >
        {rows.map(row => (
          <div key={row.label} 
          // style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
          className="flex items-center gap-2.5"
          >
            <span 
            // style={{
            //   width: '74px',
            //   flexShrink: 0,
            //   fontSize: '12px',
            //   color: 'var(--color-label-secondary)',
            // }}
            className="w-[74px] shrink-0 text-[12px] text-label-secondary"
            >
              {row.label}
            </span>
            <div 
            // style={{
            //   flex: 1,
            //   height: '7px',
            //   background: 'var(--color-bg)',
            //   borderRadius: '4px',
            //   overflow: 'hidden',
            // }}
            className="flex-1 h-[7px] bg-bg rounded-[4px] overflow-hidden"
            >
              <div 
              style={{
                height: '100%',
                width: `${row.pct}%`,
                background: row.color,
                borderRadius: '4px',
                transition: 'width 0.6s ease',
              }} 
              // className="h-full w-full bg-[row.color] rounded-[4px]"
              />
            </div>
            <span 
            // style={{
            //   width: '52px',
            //   flexShrink: 0,
            //   fontSize: '12px',
            //   fontWeight: 500,
            //   color: 'var(--color-label-primary)',
            //   textAlign: 'right',
            // }}
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
