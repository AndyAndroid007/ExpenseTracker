import { useState } from 'react';
import { IconArrowUp } from '@tabler/icons-react';

export default function InputBar({ onSend }) {
  const [value, setValue] = useState('');

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
    <div style={{ width: '100%', background: 'var(--color-surface)', borderTop: '0.5px solid var(--color-separator)' }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '0.5rem clamp(0.75rem, 3vw, 1.5rem)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Swiggy 280, no spend today…"
          style={{
            flex: 1,
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            fontSize: '15px',
            outline: 'none',
            background: 'var(--color-bg)',
            color: 'var(--color-label-primary)',
            border: '1px solid var(--color-separator)',
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <IconArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
