import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يجب تسجيل الدخول أولاً للوصول إلى لوحة التحكم",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (user && user.role !== 'admin') {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية الوصول إلى لوحة تحكم الإدارة",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍕</div>
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated and is admin
  if (isAuthenticated && user && user.role === 'admin') {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};