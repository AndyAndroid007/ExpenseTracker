import { useState } from 'react';
import MessageThread from './MessageThread';
import InputBar from './InputBar';
import { parseInput } from '../../utils/parser';

const WELCOME = [
  {
    sender: 'system',
    text: "Hey! 👋 I'm Spendly. Tell me what you spent today, or say 'no spend' if you didn't spend anything.",
  },
];

export default function ChatTab() {
  const [messages, setMessages] = useState(WELCOME);

  function addMessage(msg) {
    setMessages(prev => [...prev, msg]);
  }

  function handleSend(text) {
    if (!text.trim()) return;
    addMessage({ sender: 'user', text });

    const parsed = parseInput(text);

    if (parsed.type === 'no_spend') {
      setTimeout(() => {
        addMessage({ sender: 'system', text: "✅ Got it — no spend today! Great job keeping it zero." });
        addMessage({ type: 'streak', days: 7 });
      }, 300);
      return;
    }

    if (parsed.type === 'save_day') {
      setTimeout(() => {
        addMessage({ sender: 'system', text: "🎉 Marked as a saving day! Keep it up." });
        addMessage({ type: 'streak', days: 7 });
      }, 300);
      return;
    }

    if (parsed.type === 'expense' && parsed.amount) {
      setTimeout(() => {
        addMessage({ type: 'confirm_card', parsed });
      }, 300);
      return;
    }

    setTimeout(() => {
      addMessage({ sender: 'system', text: "Hmm, I couldn't catch that. Try something like 'Swiggy 280' or 'no spend today'." });
    }, 300);
  }

  function handleConfirm(idx) {
    const confirmed = messages[idx];
    setMessages(prev => {
      const next = [...prev];
      next[idx] = { sender: 'system', text: `✅ Logged ₹${confirmed.parsed.amount} for ${confirmed.parsed.category}.` };
      return next;
    });
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'streak', days: 7 }]);
    }, 100);
  }

  function handleEdit(idx) {
    setMessages(prev => {
      const next = [...prev];
      next[idx] = { sender: 'system', text: "No problem! Just retype the expense with the correct details." };
      return next;
    });
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '0 clamp(0.75rem, 3vw, 1.5rem)',
      }}>
        <MessageThread messages={messages} onConfirm={handleConfirm} onEdit={handleEdit} />
      </div>
      <InputBar onSend={handleSend} />
    </div>
  );
}
