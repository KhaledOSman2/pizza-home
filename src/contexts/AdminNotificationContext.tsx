import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, Order } from '@/services/api';
import { useAuth } from './AuthContext';

interface AdminNotificationContextType {
  pendingOrdersCount: number;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

interface AdminNotificationProviderProps {
  children: ReactNode;
}

export const AdminNotificationProvider: React.FC<AdminNotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNotifications = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getUserOrders(); // For admin, this returns all orders
      const orders = response.orders || [];
      const pendingCount = orders.filter(order => order.status === 'pending').length;
      setPendingOrdersCount(pendingCount);
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (user && user.role === 'admin') {
      // Initial fetch
      refreshNotifications();
      
      // Set up interval for real-time updates (every 30 seconds)
      interval = setInterval(refreshNotifications, 30000);
    } else {
      // Reset count if not admin
      setPendingOrdersCount(0);
    }

    // Cleanup interval on unmount or role change
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user]);

  const value = {
    pendingOrdersCount,
    refreshNotifications,
    isLoading,
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = (): AdminNotificationContextType => {
  const context = useContext(AdminNotificationContext);
  if (context === undefined) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
};