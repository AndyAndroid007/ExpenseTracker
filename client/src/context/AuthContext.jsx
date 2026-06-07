import React from 'react';

export const AuthContext = React.createContext({ loggedIn: false, setLoggedIn: () => {} });

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = React.useState(false);
  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
