// client/src/context/MessageContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MessageContextType {
  globalUnreadCount: number;
  setGlobalUnreadCount: (count: number) => void;
  decrementUnreadCount: (amount: number) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);

  const decrementUnreadCount = (amount: number) => {
    setGlobalUnreadCount(prev => Math.max(0, prev - amount));
  };

  return (
    <MessageContext.Provider value={{ globalUnreadCount, setGlobalUnreadCount, decrementUnreadCount }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageSync = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error("useMessageSync must be used within a MessageProvider");
  return context;
};