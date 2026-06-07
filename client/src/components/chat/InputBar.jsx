import { useState, useRef, useLayoutEffect } from 'react';
import { IconArrowUp } from '@tabler/icons-react';

export default function InputBar({ onSend }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div 
      className="w-full bg-surface border-t-[0.5px] border-[var(--color-separator)]"
      // style={{ width: '100%', background: 'var(--color-surface)', borderTop: '0.5px solid var(--color-separator)' }}
    >
      <form 
        onSubmit={e => { e.preventDefault(); handleSend(); }}
        className="max-w-[720px] mx-auto py-1.5 px-lg flex items-center gap-2"
        // style={{
        //   maxWidth: '720px',
        //   margin: '0 auto',
        //   padding: '0.5rem clamp(0.75rem, 3vw, 1.5rem)',
        //   display: 'flex',
        //   alignItems: 'center',
        //   gap: '0.5rem',
        // }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Swiggy 280, no spend today…"
          className="flex-1 rounded-2xl px-3.5 py-1.5 text-[13px] outline-none bg-bg text-label-primary border border-[var(--color-separator)] resize-none align-middle max-h-32 overflow-y-auto scrollbar-none"
          /* style={{
            flex: 1,
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            fontSize: '15px',
            outline: 'none',
            background: 'var(--color-bg)',
            color: 'var(--color-label-primary)',
            border: '1px solid var(--color-separator)',
          }} */
        />
        <button
          type="submit"
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#0b83fe] text-white border-none cursor-pointer hover:opacity-90"
          // style={{
          //   width: '2.25rem',
          //   height: '2.25rem',
          //   borderRadius: '9999px',
          //   display: 'flex',
          //   alignItems: 'center',
          //   justifyContent: 'center',
          //   flexShrink: 0,
          //   background: 'var(--color-primary)',
          //   color: '#fff',
          //   border: 'none',
          //   cursor: 'pointer',
          // }}
        >
          <IconArrowUp size={15} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
