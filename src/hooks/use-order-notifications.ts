import { useEffect, useRef } from 'react';
import { useAdminNotifications } from '@/contexts/AdminNotificationContext';
import { toast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { pendingOrdersCount } = useAdminNotifications();
  const previousCountRef = useRef(pendingOrdersCount);

  useEffect(() => {
    const previousCount = previousCountRef.current;
    
    // If pending orders increased, show notification
    if (pendingOrdersCount > previousCount && previousCount !== 0) {
      // Play notification sound
      try {
        const audio = new Audio('/src/assets/new-notification-021-370045.mp3');
        audio.volume = 0.3;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      }

      // Show toast notification
      toast({
        title: "طلب جديد! 🔔",
        description: `يوجد ${pendingOrdersCount} طلبات في الانتظار`,
        duration: 20000,
        className: "bg-green-50 border-green-200",
      });
    }

    previousCountRef.current = pendingOrdersCount;
  }, [pendingOrdersCount]);

  return { pendingOrdersCount };
};