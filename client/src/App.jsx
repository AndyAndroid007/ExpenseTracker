import { useState, useContext } from 'react';
import { MaskProvider } from './context/MaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ChatTab from './components/chat/ChatTab';
import InsightsTab from './components/insights/InsightsTab';
import HistoryTab from './components/history/HistoryTab';
import SettingsTab from './components/settings/SettingsTab';

function TabContent({ tab }) {
  switch (tab) {
    case 'log': return <ChatTab />;
    case 'insights': return <InsightsTab />;
    case 'history': return <HistoryTab />;
    case 'settings': return <SettingsTab />;
    default: return <ChatTab />;
  }
}

function AppShell() {
  const [tab, setTab] = useState('log');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--color-bg)' }}>
      <Header tab={tab} />
      <main style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TabContent tab={tab} />
      </main>
      <BottomNav active={tab} onSelect={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MaskProvider>
          <AppShell />
        </MaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
