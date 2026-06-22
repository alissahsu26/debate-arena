import { createContext, useCallback, useContext, useState } from 'react';

const FollowUpContext = createContext(null);

export function FollowUpProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSeed, setPendingSeed] = useState(null);

  const openFollowUp = useCallback((seedQuery = null) => {
    setIsOpen(true);
    if (seedQuery) setPendingSeed(seedQuery);
  }, []);

  const closeFollowUp = useCallback(() => setIsOpen(false), []);

  const clearPendingSeed = useCallback(() => setPendingSeed(null), []);

  return (
    <FollowUpContext.Provider
      value={{ isOpen, pendingSeed, openFollowUp, closeFollowUp, clearPendingSeed }}
    >
      {children}
    </FollowUpContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFollowUp() {
  const context = useContext(FollowUpContext);
  if (!context) {
    throw new Error('useFollowUp must be used within a FollowUpProvider');
  }
  return context;
}
