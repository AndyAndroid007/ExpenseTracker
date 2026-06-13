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
      // style={{
      //   display: 'flex',
      //   alignItems: 'center',
      //   justifyContent: 'space-between',
      //   padding: '13px 16px',
      //   background: 'var(--color-surface)',
      // }}
      className="flex items-center justify-between px-3 py-4 bg-surface"
      >
        <div 
        // style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
        className="flex flex-col gap-0.75"
        >
          <span 
          // style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-label-primary)' }}
          className="text-[0.9375rem] font-medium text-label-primary"
          >
            No-spend day
          </span>
          <span 
          style={{
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
          }}
          // className="inline-flex items-center self-start text-[11px] font-medium px-2 py-1 rounded-full bg-green-light text-green border-[] border-green"
          >
            No spend
          </span>
        </div>
        <span style={{ fontSize: '1rem', color: '#c7c7cc', fontWeight: 500 }}>—</span>
      </div>
    );
  }

  if (entry.saveday) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 16px',
        background: 'var(--color-surface)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-label-primary)' }}>
            Saved today
          </span>
          <span style={{
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
          }}>
            Saved
          </span>
        </div>
        <span style={{ fontSize: '1rem', color: '#5856d6', fontWeight: 500 }}>—</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '13px 16px',
      background: 'var(--color-surface)',
      borderBottom: isLast ? 'none' : '0.5px solid var(--color-separator)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <span style={{
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: 'var(--color-label-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {entry.title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '11px', color: 'var(--color-label-tertiary)', fontWeight: 400 }}>
            {entry.category}
          </span>
        </div>
      </div>
      <span style={{
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: 'var(--color-label-primary)',
        letterSpacing: '-0.02em',
        flexShrink: 0,
        marginLeft: '1rem',
      }}>
        <MaskedAmount amount={entry.amount} prefix="₹" />
      </span>
    </div>
  );
}
