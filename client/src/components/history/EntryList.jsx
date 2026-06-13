import EntryRow from './EntryRow';

const DATA = [
  {
    dateLabel: 'Today',
    dateSub: 'May 31',
    entries: [
      { title: 'Swiggy', category: 'Food', amount: 280 },
      { nospend: true },
    ],
  },
  {
    dateLabel: 'Thursday',
    dateSub: 'May 29',
    entries: [
      { title: 'Uber', category: 'Transport', amount: 340 },
      { title: 'Zomato', category: 'Food', amount: 420 },
    ],
  },
  {
    dateLabel: 'Wednesday',
    dateSub: 'May 28',
    entries: [
      { title: 'Electricity bill', category: 'Bills', amount: 920 },
      { saveday: true },
    ],
  },
];

export default function EntryList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {DATA.map(group => (
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
          className="bg-separator rounded-[14px] overflow-hidden border border-separator flex flex-col gap-0"
          >
            {group.entries.map((entry, i) => (
              <EntryRow
                key={i}
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
