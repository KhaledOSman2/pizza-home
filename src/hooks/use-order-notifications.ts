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
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaChOD0fPTfykGKYDJ8t2MVA0'
        );
        audio.volume = 0.3;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      }

      // Show toast notification
      toast({
        title: "طلب جديد! 🔔",
        description: `يوجد ${pendingOrdersCount} طلبات في الانتظار`,
        duration: 5000,
        className: "bg-green-50 border-green-200",
      });
    }

    previousCountRef.current = pendingOrdersCount;
  }, [pendingOrdersCount]);

  return { pendingOrdersCount };
};