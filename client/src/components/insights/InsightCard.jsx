import { IconFlame, IconMoon, IconTrendingUp } from '@tabler/icons-react';

const iconMap = {
  flame: IconFlame,
  moon: IconMoon,
  'trending-up': IconTrendingUp,
};

export default function InsightCard({ text, accent = 'blue', icon }) {
  const isViolet = accent === 'violet';

  // const iconBg = isViolet ? '#eeecff' : '#e8f1ff';
  // const iconColor = isViolet ? '#5856d6' : '#007aff';
  // const boldColor = isViolet ? '#5856d6' : '#007aff';

  const iconBgClass = isViolet ? 'bg-violet-light' : 'bg-blue-light';
  const iconColorClass = isViolet ? 'text-accent' : 'text-primary';
  const boldColorClass = isViolet ? 'text-accent font-semibold' : 'text-primary font-semibold';

  const Icon = iconMap[icon];

  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <div 
    // style={{
    //   background: 'var(--color-surface)',
    //   border: '0.5px solid var(--color-separator)',
    //   borderRadius: '14px',
    //   padding: '14px 16px',
    //   display: 'flex',
    //   alignItems: 'flex-start',
    //   gap: '14px',
    // }}
    className="bg-surface border-[0.5px] border-separator rounded-[14px] px-4 py-[14px] flex items-start gap-[14px]"
    >
      {Icon && (
        <div 
        // style={{
        //   width: '38px',
        //   height: '38px',
        //   borderRadius: '10px',
        //   background: iconBg,
        //   display: 'flex',
        //   alignItems: 'center',
        //   justifyContent: 'center',
        //   flexShrink: 0,
        //   marginTop: '1px',
        // }}
        className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-[2px] ${iconBgClass}`}
        /* style = {{ backgroundColor: iconBg }} */
        >
          <Icon size={18} strokeWidth={2} className={iconColorClass} /* color={iconColor} */ />
        </div>
      )}
      <p 
      // style={{
      //   fontSize: '0.875rem',
      //   lineHeight: 1.55,
      //   color: 'var(--color-label-secondary)',
      //   margin: 0,
      //   paddingTop: '2px',
      // }}
      className="text-sm leading-[1.55] text-label-secondary m-0 pt-0.5"
      >
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong 
                key={i} 
                className={boldColorClass}
                /* style={{ color: boldColor, fontWeight: 600 }} */
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    </div>
  );
}
