import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Settings
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { apiService, Order, Category, Dish, User } from "@/services/api";
import { toast } from "@/hooks/use-toast";

// Import admin components
import { CategoriesManagement, DishesManagement, OrdersManagement, UsersManagement } from "@/components/admin";

const AdminDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCategories: 0,
    totalDishes: 0,
    totalUsers: 0,
    revenue: 0,
    pendingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user && user.role !== 'admin') {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية الوصول إلى لوحة التحكم",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !user || user.role !== 'admin') return;
      
      try {
        setIsLoading(true);
        
        // Fetch data in parallel
        const [ordersRes, categoriesRes, dishesRes] = await Promise.all([
          apiService.getUserOrders(), // For admin, this returns all orders
          apiService.getCategories(),
          apiService.getDishes()
        ]);

        const orders = ordersRes.orders || [];
        const categories = categoriesRes.categories || [];
        const dishes = dishesRes.dishes || [];

        setStats({
          totalOrders: orders.length,
          totalCategories: categories.length,
          totalDishes: dishes.length,
          totalUsers: 0, // Will implement user count later
          revenue: orders.reduce((sum, order) => sum + order.total, 0),
          pendingOrders: orders.filter(order => order.status === 'pending').length
        });
        
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        toast({
          title: "خطأ في تحميل الإحصائيات",
          description: "فشل في تحميل إحصائيات لوحة التحكم",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Show loading or redirect if user is not available
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍕</div>
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-pizza-cream/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Link to="/" className="text-muted-foreground hover:text-foreground">
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">لوحة تحكم الإدارة</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                مرحباً، {user.name}
              </h1>
              <p className="text-muted-foreground">إدارة شاملة لمطعم Pizza Home</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <Eye className="h-4 w-4 ml-2" />
                عرض الموقع
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-pizza-red">
                      {isLoading ? '--' : stats.totalOrders}
                    </p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-pizza-red" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">الأصناف</p>
                    <p className="text-2xl font-bold text-pizza-orange">
                      {isLoading ? '--' : stats.totalCategories}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-pizza-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">الأطباق</p>
                    <p className="text-2xl font-bold text-pizza-gold">
                      {isLoading ? '--' : stats.totalDishes}
                    </p>
                  </div>
                  <Settings className="h-8 w-8 text-pizza-gold" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-green-600">
                      {isLoading ? '--' : `${stats.revenue} ج.م`}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                إدارة الطلبات
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                إدارة الأصناف
              </TabsTrigger>
              <TabsTrigger value="dishes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                إدارة الأطباق
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                إدارة المستخدمين
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <OrdersManagement />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesManagement />
            </TabsContent>

            <TabsContent value="dishes">
              <DishesManagement />
            </TabsContent>

            <TabsContent value="users">
              <UsersManagement />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pizza-brown text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">🍕 Pizza Home Admin</div>
          <p className="text-white/80 mb-4">لوحة تحكم إدارة المطعم</p>
          <div className="text-white/60 text-sm">
            جميع الحقوق محفوظة © 2024 Pizza Home
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;