import React, { createContext, useContext } from 'react';
import { useLowStock } from '@/hooks/useLowStock';

interface NotificationContextValue {
  lowStockCount: number;
  lowStockItems: ReturnType<typeof useLowStock>['data'];
}

const NotificationContext = createContext<NotificationContextValue>({
  lowStockCount: 0,
  lowStockItems: [],
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: lowStockItems = [] } = useLowStock();

  return (
    <NotificationContext.Provider
      value={{ lowStockCount: lowStockItems.length, lowStockItems }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
