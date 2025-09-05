import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { apiService, Order } from '@/services/api';
import { useAuth } from './AuthContext';

interface AdminNotificationContextType {
  pendingOrdersCount: number;
  refreshNotifications: (skipTableUpdate?: boolean) => Promise<void>;
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
  const isStatusUpdateRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);

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

  const refreshNotifications = async (skipTableUpdate = false) => {
    if (!user || user.role !== 'admin') return;

    // تجنب الطلبات المتكررة - انتظار 15 ثانية على الأقل بين الطلبات
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch < 15000 && !skipTableUpdate) { // 15 ثانية
      console.log('Skipping refresh - too soon since last fetch');
      return;
    }

    try {
      setIsLoading(true);
      lastFetchTimeRef.current = now;
      const response = await apiService.getAllOrdersAdmin(); // استخدام دالة الأدمن المخصصة
      const orders = response.orders || [];
      const pendingCount = orders.filter(order => order.status === 'pending').length;
      const currentOrdersJSON = JSON.stringify(orders);
      const previousOrdersJSON = previousOrdersRef.current;

      // تحقق من وجود تغييرات في الطلبات
      if (currentOrdersJSON !== previousOrdersJSON) {
        console.log('Orders have changed');
        
        // تحديث الجدول فقط إذا لم نطلب تخطيه
        if (!skipTableUpdate) {
          console.log('Updating table');
          notifyOrderTableUpdate();
        } else {
          console.log('Skipping table update');
        }
        
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
      
      // Set up interval for real-time updates (every 30 seconds for admin responsiveness)
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

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (context === undefined) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
};