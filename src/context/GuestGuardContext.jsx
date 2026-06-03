import React, { createContext, useContext, useState, useCallback } from 'react';

// Stores the "intent" so after login we can redirect back and complete the action
const GuestGuardContext = createContext(null);

export function GuestGuardProvider({ children }) {
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
  // e.g. { path: '/product/3', action: 'cart' }  or  { path: '/checkout', action: 'checkout' }

  const setIntent = useCallback((path, action) => {
    setRedirectAfterLogin({ path, action });
  }, []);

  const clearIntent = useCallback(() => {
    setRedirectAfterLogin(null);
  }, []);

  return (
    <GuestGuardContext.Provider value={{ redirectAfterLogin, setIntent, clearIntent }}>
      {children}
    </GuestGuardContext.Provider>
  );
}

export const useGuestGuard = () => {
  const ctx = useContext(GuestGuardContext);
  if (!ctx) throw new Error('useGuestGuard must be used within GuestGuardProvider');
  return ctx;
};
