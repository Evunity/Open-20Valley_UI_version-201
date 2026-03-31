import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DropdownContextType {
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function DropdownProvider({ children }: { children: ReactNode }) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <DropdownContext.Provider value={{ activeDropdown, setActiveDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdownManager(id: string) {
  const context = useContext(DropdownContext);
  
  if (!context) {
    throw new Error('useDropdownManager must be used within a DropdownProvider');
  }

  const isOpen = context.activeDropdown === id;

  const open = useCallback(() => {
    context.setActiveDropdown(id);
  }, [context, id]);

  const close = useCallback(() => {
    if (context.activeDropdown === id) {
      context.setActiveDropdown(null);
    }
  }, [context, id]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return { isOpen, open, close, toggle };
}
