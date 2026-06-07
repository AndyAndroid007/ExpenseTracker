import React from 'react';

export const ThemeContext = React.createContext({ theme: 'light', setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState('light');
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
