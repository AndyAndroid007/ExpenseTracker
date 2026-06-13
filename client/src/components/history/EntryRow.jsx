import MaskedAmount from '../MaskedAmount';

const categoryDot = {
  Food: '#007aff',
  Transport: '#5856d6',
  Shopping: '#32ade6',
  Entertainment: '#c7c7cc',
  Bills: '#32ade6',
  Health: '#5856d6',
  General: '#8e8e93',
};

export default function EntryRow({ entry, isLast }) {
  const dotColor = categoryDot[entry.category] || '#8e8e93';

  if (entry.nospend) {
    return (
      <div 
        className="flex items-center justify-between px-4 py-[13px] bg-surface"
        /* style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 16px',
          background: 'var(--color-surface)',
        }} */
      >
        <div 
          className="flex flex-col gap-[3px]"
          /* style={{ display: 'flex', flexDirection: 'column', gap: '3px' }} */
        >
          <span 
            className="text-[15px] font-medium text-label-primary"
            /* style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-label-primary)' }} */
          >
            No-spend day
          </span>
          <span 
            className="inline-flex items-center self-start text-[11px] font-medium px-2 py-0.5 rounded-[5px] bg-[#f0faf5] text-[#1a7a4a] border-[0.5px] border-[#a8d5b8] dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
            /* style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '5px',
              background: '#f0faf5',
              color: '#1a7a4a',
              border: '0.5px solid #a8d5b8',
            }} */
          >
            No spend
          </span>
        </div>
        <span 
          className="text-base text-[#c7c7cc] dark:text-zinc-600 font-medium"
          /* style={{ fontSize: '1rem', color: '#c7c7cc', fontWeight: 500 }} */
        >
          —
        </span>
      </div>
    );
  }

  if (entry.saveday) {
    return (
      <div 
        className="flex items-center justify-between px-4 py-[13px] bg-surface"
        /* style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 16px',
          background: 'var(--color-surface)',
        }} */
      >
        <div 
          className="flex flex-col gap-[3px]"
          /* style={{ display: 'flex', flexDirection: 'column', gap: '3px' }} */
        >
          <span 
            className="text-[15px] font-medium text-label-primary"
            /* style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-label-primary)' }} */
          >
            Saved today
          </span>
          <span 
            className="inline-flex items-center self-start text-[11px] font-medium px-2 py-0.5 rounded-[5px] bg-[var(--color-violet-light)] text-accent border-[0.5px] border-[#c8c6f7] dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30"
            /* style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '5px',
              background: 'var(--color-violet-light)',
              color: '#5856d6',
              border: '0.5px solid #c8c6f7',
            }} */
          >
            Saved
          </span>
        </div>
        <span 
          className="text-base text-accent font-medium"
          /* style={{ fontSize: '1rem', color: '#5856d6', fontWeight: 500 }} */
        >
          —
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-between px-4 py-[13px] bg-surface ${isLast ? 'border-none' : 'border-b-[0.5px] border-separator'}`}
      /* style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 16px',
        background: 'var(--color-surface)',
        borderBottom: isLast ? 'none' : '0.5px solid var(--color-separator)',
      }} */
    >
      <div 
        className="flex flex-col gap-1 min-w-0"
        /* style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }} */
      >
        <span 
          className="text-[15px] font-medium text-label-primary truncate"
          /* style={{
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'var(--color-label-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }} */
        >
          {entry.title}
        </span>
        <div 
          className="flex items-center gap-1.25"
          /* style={{ display: 'flex', alignItems: 'center', gap: '5px' }} */
        >
          <span 
            className="w-1.5 h-1.5 rounded-full shrink-0 inline-block"
            style={{ backgroundColor: dotColor }}
            /* style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: dotColor,
              flexShrink: 0,
              display: 'inline-block',
            }} */
          />
          <span 
            className="text-[11px] text-label-tertiary font-normal"
            /* style={{ fontSize: '11px', color: 'var(--color-label-tertiary)', fontWeight: 400 }} */
          >
            {entry.category}
          </span>
        </div>
      </div>
      <span 
        className="text-[15px] font-semibold text-label-primary tracking-tight shrink-0 ml-4"
        /* style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: 'var(--color-label-primary)',
          letterSpacing: '-0.02em',
          flexShrink: 0,
          marginLeft: '1rem',
        }} */
      >
        <MaskedAmount amount={entry.amount} prefix="₹" />
      </span>
    </div>
  );
}
