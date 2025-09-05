import { QueryClient } from '@tanstack/react-query';

// إنشاء Query Client مع إعدادات Caching متقدمة
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache البيانات لمدة 10 دقائق
      staleTime: 10 * 60 * 1000, // 10 minutes
      // الاحتفاظ بالبيانات في الذاكرة لمدة 30 دقيقة
      gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
      // إعادة التحميل عند العودة للنافذة
      refetchOnWindowFocus: false,
      // إعادة التحميل عند الاتصال بالإنترنت مرة أخرى
      refetchOnReconnect: true,
      // منع إعادة التحميل عند mount إذا كانت البيانات fresh
      refetchOnMount: false,
      // عدد مرات إعادة المحاولة عند الفشل
      retry: 2,
      // تأخير إعادة المحاولة
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // إعادة المحاولة للطفرات عند الفشل
      retry: 1,
    },
  },
});

// مفاتيح الاستعلام الثابتة لتنظيم أفضل
export const queryKeys = {
  // Authentication
  currentUser: ['auth', 'current-user'] as const,
  
  // Orders
  orders: ['orders'] as const,
  adminOrders: ['orders', 'admin'] as const,
  userOrders: (userId?: string) => ['orders', 'user', userId] as const,
  order: (id: string) => ['orders', id] as const,
  
  // Categories
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
  
  // Dishes
  dishes: ['dishes'] as const,
  dish: (id: string) => ['dishes', id] as const,
  dishesByCategory: (categoryId: string) => ['dishes', 'category', categoryId] as const,
  
  // Users (Admin)
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  
  // Statistics
  adminStats: ['admin', 'stats'] as const,
} as const;
