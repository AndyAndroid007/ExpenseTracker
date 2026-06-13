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

import { AuthContext } from './context/AuthContext';

// function TabContent({ tab }) {
//   switch (tab) {
//     case 'log': return <ChatTab />;
//     case 'insights': return <InsightsTab />;
//     case 'history': return <HistoryTab />;
//     case 'settings': return <SettingsTab />;
//     default: return <ChatTab />;
//   }
// }

function AppShell() {
  const [tab, setTab] = useState('log');
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div 
        className="flex h-[100dvh] items-center justify-center bg-[var(--color-bg)] text-label-secondary text-sm font-semibold"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-2xl animate-pulse">⏳</span>
          <span>Syncing session details...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
    className="flex flex-col h-[100dvh] bg-[var(--color-bg)]"
    // style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--color-bg)' }}
    >
      <Header tab={tab} />
      <main
      //  style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      className="flex-1 min-h-0 overflow-hidden relative"
       >
        {/* <TabContent tab={tab} /> */}
        <div className={`absolute inset-0 w-full h-full flex flex-col ${tab === 'log' ? 'visible z-10' : 'invisible z-0 pointer-events-none'}`}>
          <ChatTab />
        </div>
        <div className={`absolute inset-0 w-full h-full flex flex-col ${tab === 'insights' ? 'visible z-10' : 'invisible z-0 pointer-events-none'}`}>
          <InsightsTab active={tab === 'insights'} />
        </div>
        <div className={`absolute inset-0 w-full h-full flex flex-col ${tab === 'history' ? 'visible z-10' : 'invisible z-0 pointer-events-none'}`}>
          <HistoryTab active={tab === 'history'} />
        </div>
        <div className={`absolute inset-0 w-full h-full flex flex-col ${tab === 'settings' ? 'visible z-10' : 'invisible z-0 pointer-events-none'}`}>
          <SettingsTab />
        </div>
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
