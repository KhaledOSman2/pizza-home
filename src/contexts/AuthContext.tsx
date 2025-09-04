import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, User } from '@/services/api';
import { toast } from '@/hooks/use-toast';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentUser();
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.user) {
        setUser(response.user);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string; 
  }): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.signup(userData);
      
      if (response.user) {
        setUser(response.user);
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
      setUser(null);
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}