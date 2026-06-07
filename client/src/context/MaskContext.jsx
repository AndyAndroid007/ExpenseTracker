import React from 'react';

export const MaskContext = React.createContext({ masked: false, toggle: () => {} });

export function MaskProvider({ children }) {
  const [masked, setMasked] = React.useState(false);
  return (
    <MaskContext.Provider value={{ masked, toggle: () => setMasked(m => !m) }}>
      {children}
    </MaskContext.Provider>
  );
}
