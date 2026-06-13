import EntryRow from './EntryRow';

export default function EntryList({ groups = [] }) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-surface rounded-[14px] border-[0.5px] border-separator text-center">
        <span className="text-3xl mb-2">📥</span>
        <p className="text-sm font-semibold text-label-primary">No entries found</p>
        <p className="text-xs text-label-tertiary mt-1">Try logging an expense in the Chat tab!</p>
      </div>
    );
  }

  return (
    <div
      /* style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} */
      className="flex flex-col gap-5"
    >
      {groups.map(group => (
        <div key={group.dateSub}>
          {/* Date header */}
          <div 
          // style={{
          //   display: 'flex',
          //   alignItems: 'baseline',
          //   gap: '6px',
          //   marginBottom: '8px',
          //   paddingLeft: '2px',
          // }}
          className="flex items-baseline gap-1.5 mb-2 pl-0.5"
          >
            <span 
            // style={{
            //   fontSize: '13px',
            //   fontWeight: 600,
            //   color: 'var(--color-label-primary)',
            // }}
            className="text-[13px] font-semibold text-label-primary"
            >
              {group.dateLabel}
            </span>
            <span 
            // style={{
            //   fontSize: '11px',
            //   color: 'var(--color-label-tertiary)',
            //   fontWeight: 400,
            // }}
            className="text-[11px] text-label-tertiary font-normal"
            >
              {group.dateSub}
            </span>
          </div>

          {/* Entry card */}
          <div 
          // style={{
          //   background: 'var(--color-separator)',
          //   borderRadius: '14px',
          //   overflow: 'hidden',
          //   border: '0.5px solid var(--color-separator)',
          //   display: 'flex',
          //   flexDirection: 'column',
          //   gap: '0.5px',
          // }}
          className="bg-separator rounded-[14px] overflow-hidden border-[0.5px] border-separator flex flex-col gap-[0.5px]"
          >
            {group.entries.map((entry, i) => (
              <EntryRow
                key={entry.id || i}
                entry={entry}
                isLast={i === group.entries.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
