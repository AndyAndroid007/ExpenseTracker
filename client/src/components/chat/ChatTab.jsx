import { useState, useContext, useEffect } from 'react';
import MessageThread from './MessageThread';
import InputBar from './InputBar';
import api from '../../utils/api';
import logger from '../../utils/logger';
import { AuthContext } from '../../context/AuthContext';

const WELCOME = [
  {
    sender: 'system',
    text: "Hey! 👋 I'm Spendly. Tell me what you spent today, or say 'no spend' if you didn't spend anything.",
  },
];

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const mapDbMessageToFrontend = (msg) => {
  // A confirmed card is rendered directly as its resolved plain text
  if (msg.type === 'confirm_card' && msg.isConfirmed) {
    const amount = msg.payload?.amount ?? '?';
    const category = msg.payload?.category ?? '?';
    return {
      sender: 'system',
      text: `✅ Logged ₹${amount} for ${category}.`,
      type: 'text'
    };
  }
  if (msg.type === 'confirm_card') {
    return {
      sender: msg.sender,
      text: msg.text,
      type: msg.type,
      parsed: msg.payload ? {
        id: msg.payload.id,
        type: msg.payload.type || 'expense',
        amount: Number(msg.payload.amount),
        category: msg.payload.category,
        dateLabel: 'Today',
        confidence: capitalize(msg.payload.confidence),
        streak: msg.payload.streak
      } : null
    };
  }
  if (msg.type === 'streak') {
    return {
      sender: msg.sender,
      text: msg.text,
      type: msg.type,
      days: msg.payload ? msg.payload.days : 0
    };
  }
  return {
    sender: msg.sender,
    text: msg.text,
    type: msg.type
  };
};

export default function ChatTab() {
  const [messages, setMessages] = useState(WELCOME);
  const { setCurrentStreak } = useContext(AuthContext);

  useEffect(() => {
    async function loadChatHistory() {
      try {
        logger.info('Fetching chat history from server...');
        const res = await api.get('/chat');
        const dbMessages = res.data || [];
        if (dbMessages.length > 0) {
          setMessages(dbMessages.map(mapDbMessageToFrontend));
        }
        logger.info({ count: dbMessages.length }, 'Successfully loaded chat history');
      } catch (err) {
        logger.error({ err }, 'Failed to load chat history, falling back to welcome message');
      }
    }
    loadChatHistory();
  }, []);

  function addMessage(msg) {
    setMessages(prev => [...prev, msg]);
  }

  async function handleSend(text) {
    if (!text.trim()) return;
    
    // Add user message optimistically
    addMessage({ sender: 'user', text, type: 'text' });

    try {
      logger.info({ rawText: text }, 'Posting raw text to server...');
      const response = await api.post('/entries', { rawText: text });
      const { streak, chatMessages } = response.data;

      logger.info('Entry created and chat messages received successfully');

      if (streak) {
        setCurrentStreak(streak.current_streak);
      }

      if (chatMessages && chatMessages.length > 0) {
        // Filter out the user message since we already added it optimistically
        const mapped = chatMessages.map(mapDbMessageToFrontend);
        const systemReplies = mapped.filter(m => m.sender === 'system');
        setMessages(prev => [...prev, ...systemReplies]);
      }
    } catch (err) {
      logger.error({ err }, 'Failed to parse or save entry on backend');
      const errorMsg = err.response?.data?.message || "Hmm, I couldn't catch that. Try: 'Spent 200 on food' or 'no spend today'.";
      addMessage({ sender: 'system', text: errorMsg, type: 'text' });
    }
  }

  async function handleConfirm(idx, updatedParsed, alreadyPatched = false) {
    const confirmed = updatedParsed || messages[idx].parsed;

    // If user hit the direct Confirm button (not coming from EditCardForm's Save),
    // we need to PATCH the backend to mark the message as confirmed.
    if (!alreadyPatched && confirmed?.id) {
      try {
        logger.info({ entryId: confirmed.id }, 'Direct confirm — calling PATCH to persist confirmation');
        await api.patch(`/entries/${confirmed.id}`, {
          amount: confirmed.amount,
          category: confirmed.category
        });
      } catch (err) {
        logger.error({ err }, 'Failed to persist direct confirm via PATCH');
      }
    }

    setMessages(prev => {
      const next = [...prev];
      next[idx] = { sender: 'system', text: `✅ Logged ₹${confirmed.amount} for ${confirmed.category}.`, type: 'text' };
      return next;
    });

    if (confirmed.streak) {
      setCurrentStreak(confirmed.streak.current_streak);
      if (confirmed.streak.updated) {
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'streak', days: confirmed.streak.current_streak }]);
        }, 100);
      }
    }
  }

  return (
    <div 
      className="flex flex-col h-full bg-bg"
      /* style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-bg)',
      }} */
    >
      <div 
        className="flex-1 flex flex-col min-h-0 w-full max-w-[720px] mx-auto px-lg"
        /* style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 clamp(0.75rem, 3vw, 1.5rem)',
        }} */
      >
        <MessageThread messages={messages} onConfirm={handleConfirm} />
      </div>
      <InputBar onSend={handleSend} />
    </div>
  );
}
