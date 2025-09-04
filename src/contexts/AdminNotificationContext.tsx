import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  const previousOrdersRef = useRef<string>("");

  const notifyOrderTableUpdate = () => {
    console.log('notifyOrderTableUpdate: Event dispatched');
    const event = new CustomEvent('updateOrderTable');
    window.dispatchEvent(event);
  };

  const playNotificationSound = () => {
    const audio = new Audio('/assets/new-notification-021-370045.mp3');
    audio.play().catch((error) => {
      console.error('Failed to play notification sound:', error);
      // محاولة ثانية باستخدام مسار بديل
      const fallbackAudio = new Audio(new URL('/assets/new-notification-021-370045.mp3', window.location.origin));
      fallbackAudio.volume = 0.3;
      fallbackAudio.play().catch(console.error);
    });
  };

  const refreshNotifications = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      setIsLoading(true);
      const response = await apiService.getUserOrders(); // For admin, this returns all orders
      const orders = response.orders || [];
      const pendingCount = orders.filter(order => order.status === 'pending').length;
      const currentOrdersJSON = JSON.stringify(orders);
      const previousOrdersJSON = previousOrdersRef.current;

      // تحقق من وجود تغييرات في الطلبات
      if (currentOrdersJSON !== previousOrdersJSON) {
        console.log('Orders have changed, updating table');
        notifyOrderTableUpdate();
        
        // تحقق من وجود طلبات جديدة
        if (pendingCount > pendingOrdersCount) {
          playNotificationSound();
        }
      }

      setPendingOrdersCount(pendingCount);
      previousOrdersRef.current = currentOrdersJSON;
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