import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService, User } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';
import { useCurrentUser } from '@/hooks/useQueries';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userResponse, isLoading, error } = useCurrentUser();
  
  const user = userResponse?.user || null;
  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.user) {
        // تحديث الـ cache مع بيانات المستخدم الجديدة
        queryClient.setQueryData(queryKeys.currentUser, response);
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بعودتك ${response.user.name}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في تسجيل الدخول';
      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string; 
  }): Promise<void> => {
    try {
      const response = await apiService.signup(userData);
      
      if (response.user) {
        // تحديث الـ cache مع بيانات المستخدم الجديدة
        queryClient.setQueryData(queryKeys.currentUser, response);
        
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: `مرحباً بك ${response.user.name}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في إنشاء الحساب';
      toast({
        title: "خطأ في إنشاء الحساب",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
      
      // مسح التوكن
      apiService.clearAuthToken();
      
      // مسح query للمستخدم الحالي بشكل محدد
      queryClient.setQueryData(queryKeys.currentUser, null);
      
      // مسح جميع البيانات من الـ cache عند تسجيل الخروج
      queryClient.clear();
      
      // إجبار refetch للمستخدم الحالي
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
      
      // إعادة التوجه لصفحة تسجيل الدخول
      setTimeout(() => navigate('/login', { replace: true }), 100);
      
    } catch (error) {
      // حتى لو فشل تسجيل الخروج على الخادم، امسح البيانات المحلية
      apiService.clearAuthToken();
      
      // مسح query للمستخدم الحالي
      queryClient.setQueryData(queryKeys.currentUser, null);
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
      
      // إعادة التوجه لصفحة تسجيل الدخول
      setTimeout(() => navigate('/login', { replace: true }), 100);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};