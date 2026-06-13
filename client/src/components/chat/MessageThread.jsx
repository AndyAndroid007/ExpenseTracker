import { useEffect, useRef } from 'react';
import ConfirmCard from './ConfirmCard';
import StreakToast from './StreakToast';
import MaskedAmount from '../MaskedAmount';

export default function MessageThread({ messages, onConfirm, onEdit }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      ref={bottomRef} 
      className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 scrollbar-none"
      // style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      {messages.map((msg, i) => {
        if (msg.type === 'streak') {
          return <StreakToast key={i} days={msg.days} />;
        }

        if (msg.type === 'confirm_card') {
          return (
            <div 
              key={i} 
              className="max-w-[80%] self-start"
              // style={{ maxWidth: '80%', alignSelf: 'flex-start' }}
            >
              <ConfirmCard parsed={msg.parsed} onConfirm={(updated, alreadyPatched) => onConfirm(i, updated, alreadyPatched)} />
            </div>
          );
        }

        const isUser = msg.sender === 'user';

        return (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-1.5 text-[13px] leading-[1.4] ${
              isUser 
                ? 'self-end bg-[#0b83fe] text-white rounded-[18px] rounded-tr-[4px]' 
                : 'self-start bg-[#e4e6ea] dark:bg-[#2c2c2e] text-label-primary rounded-[18px] rounded-tl-[4px]'
            }`}
            /* style={{
              maxWidth: '80%',
              padding: '0.5rem 0.75rem',
              fontSize: '15px',
              lineHeight: 1.4,
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              background: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
              color: isUser ? '#fff' : 'var(--color-label-primary)',
              border: isUser ? 'none' : '0.5px solid #e5e5ea',
              borderRadius: isUser
                ? '1.125rem 0.25rem 1.125rem 1.125rem'
                : '0.25rem 1.125rem 1.125rem 1.125rem',
            }} */
          >
            {msg.text}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
