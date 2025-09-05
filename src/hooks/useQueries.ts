import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Order, Category, Dish, User } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

// Auth Queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiService.getCurrentUser(),
    staleTime: 30 * 60 * 1000, // 30 minutes for user data
    retry: false, // لا نعيد المحاولة للمصادقة
    refetchOnMount: false, // منع إعادة التحميل عند mount
  });
};

// Orders Queries
export const useOrders = () => {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => apiService.getUserOrders(),
    staleTime: 60 * 1000, // 1 minute for user orders (تحديث أسرع)
    refetchOnMount: 'always', // دائماً تحديث للطلبات
    refetchInterval: 60000, // تحديث كل دقيقة تلقائياً
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: queryKeys.adminOrders,
    queryFn: () => apiService.getAllOrdersAdmin(),
    staleTime: 30 * 1000, // 30 seconds for admin orders (استجابة سريعة)
    refetchOnMount: 'always', // دائماً تحديث للطلبات الإدارية
    refetchInterval: 30000, // تحديث كل 30 ثانية تلقائياً
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => apiService.getOrder(id),
    enabled: !!id, // فقط إذا كان لدينا ID
  });
};

// Categories Queries
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => apiService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes for categories (تتغير نادراً جداً)
    refetchOnMount: false, // منع إعادة التحميل عند mount
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => apiService.getCategory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false, // منع إعادة التحميل عند mount
  });
};

// Dishes Queries
export const useDishes = (categorySlug?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: categorySlug || searchQuery 
      ? ['dishes', { category: categorySlug, search: searchQuery }]
      : queryKeys.dishes,
    queryFn: () => apiService.getDishes(categorySlug, searchQuery),
    staleTime: 15 * 60 * 1000, // 15 minutes for dishes (تتغير بشكل متوسط)
    refetchOnMount: false, // منع إعادة التحميل عند mount
  });
};

export const useDish = (id: string) => {
  return useQuery({
    queryKey: queryKeys.dish(id),
    queryFn: () => apiService.getDish(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false, // منع إعادة التحميل عند mount
  });
};

// Users Queries (Admin)
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiService.getAllUsers(),
    staleTime: 3 * 60 * 1000, // 3 minutes for users
  });
};

// Mutations with Cache Updates
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) => 
      apiService.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      // تحديث الطلب المحدد في الـ cache
      queryClient.setQueryData(queryKeys.order(variables.orderId), data);
      
      // تحديث قائمة الطلبات
      queryClient.setQueryData(queryKeys.orders, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.map((order: Order) => 
            order._id === variables.orderId ? data.order : order
          )
        };
      });
      
      // تحديث قائمة طلبات الأدمن
      queryClient.setQueryData(queryKeys.adminOrders, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.map((order: Order) => 
            order._id === variables.orderId ? data.order : order
          )
        };
      });
      
      toast({
        title: "تم تحديث حالة الطلب",
        description: "تم تحديث حالة الطلب بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: any) => apiService.createOrder(orderData),
    onSuccess: () => {
      // إعادة تحميل قوائم الطلبات عند إنشاء طلب جديد
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
      
      toast({
        title: "تم إنشاء الطلب",
        description: "تم إرسال طلبك بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });
};

// دالة مساعدة لتحديث البيانات يدوياً
export const useRefreshData = () => {
  const queryClient = useQueryClient();
  
  return {
    refreshOrders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
    refreshAdminOrders: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders }),
    refreshCategories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
    refreshDishes: () => queryClient.invalidateQueries({ queryKey: queryKeys.dishes }),
    refreshUsers: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    refreshAll: () => queryClient.invalidateQueries(),
  };
};
