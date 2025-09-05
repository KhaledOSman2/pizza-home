import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  User, 
  MapPin, 
  Clock, 
  CreditCard, 
  LogOut,
  Edit,
  Eye,
  Package,
  Loader2,
  Phone,
  ShoppingBag,
  History
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useQueries";
import { useEffect, useState } from "react";
import { apiService, Order } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import OrderTrackingDialog from "@/components/admin/OrderTrackingDialog";

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // استخدام React Query لجلب الطلبات مع caching
  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useOrders();
  const orders = ordersResponse?.orders || [];
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // عرض خطأ إذا فشل في تحميل الطلبات
  useEffect(() => {
    if (ordersError) {
      toast({
        title: "خطأ في تحميل الطلبات",
        description: "فشل في تحميل قائمة الطلبات",
        variant: "destructive",
      });
    }
  }, [ordersError]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleTrackOrder = (order: Order) => {
    setTrackingOrder(order);
    setTrackingOpen(true);
  };

  const handleReorder = async (order: Order) => {
    // Implementation for reordering functionality
    toast({
      title: "إعادة الطلب",
      description: "سيتم إضافة العناصر إلى السلة قريباً",
    });
  };

  // Show loading or redirect if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍕</div>
          <p className="text-muted-foreground">جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "on_the_way":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "تم التوصيل";
      case "preparing":
        return "قيد التحضير";
      case "on_the_way":
        return "في الطريق";
      case "cancelled":
        return "ملغي";
      case "pending":
        return "في الانتظار";
      default:
        return "غير معروف";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-pizza-cream/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">لوحة التحكم</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            مرحباً، {user.name}
          </h1>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* User Info & Actions */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلومات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">الاسم</label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">البريد الإلكتروني</label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">الهاتف</label>
                    <p className="font-medium">{user.phone || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">تاريخ الانضمام</label>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    تعديل المعلومات
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MapPin className="h-4 w-4" />
                    إدارة العناوين
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CreditCard className="h-4 w-4" />
                    طرق الدفع
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Orders History */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    الطلبات السابقة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="mr-2">جاري تحميل الطلبات...</span>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order._id} 
                          className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">طلب {order.orderNumber || order._id.slice(-6)}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground text-sm">
                              {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {order.items.length} أصناف • {order.total} ج.م
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleTrackOrder(order)}
                              >
                                <History className="h-3 w-3 ml-1" />
                                تتبع
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-3 w-3 ml-1" />
                                عرض
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold mb-2">لا توجد طلبات سابقة</h3>
                      <p className="text-muted-foreground mb-6">
                        لم تقم بأي طلبات حتى الآن. ابدأ بطلبك الأول الآن!
                      </p>
                      <Link to="/categories">
                        <Button variant="hero">
                          ابدأ التسوق
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Statistics */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Card className="text-center p-6">
                  <div className="text-2xl font-bold text-pizza-red">
                    {orders.length}
                  </div>
                  <div className="text-muted-foreground">إجمالي الطلبات</div>
                </Card>
                
                <Card className="text-center p-6">
                  <div className="text-2xl font-bold text-pizza-orange">
                    {ordersLoading ? '--' : orders.filter(order => order.status === 'delivered').reduce((sum, order) => sum + order.total, 0)} ج.م
                  </div>
                  <div className="text-muted-foreground">إجمالي المدفوع</div>
                </Card>
                
                <Card className="text-center p-6">
                  <div className="text-2xl font-bold text-pizza-gold">
                    {ordersLoading ? '--' : orders.filter(order => order.status === "delivered").length}
                  </div>
                  <div className="text-muted-foreground">طلبات مكتملة</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              تفاصيل الطلب {selectedOrder ? (selectedOrder.orderNumber || selectedOrder._id.slice(-6)) : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status and Date */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  معلومات العميل
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">الاسم:</span>
                    <span>{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">الهاتف:</span>
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span className="font-medium">العنوان:</span>
                    <span className="flex-1">{selectedOrder.customer.address}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  عناصر الطلب
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.price} ج.م × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.price * item.quantity} ج.م</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Total */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{selectedOrder.subtotal} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم التوصيل:</span>
                  <span>{selectedOrder.deliveryFee} ج.م</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>المجموع الكلي:</span>
                  <span className="text-pizza-red">{selectedOrder.total} ج.م</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">طريقة الدفع:</span>
                <span>الدفع عند الاستلام</span>
              </div>

              {/* Notes if any */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <span className="font-medium">ملاحظات:</span>
                  <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {selectedOrder.status === "delivered" && (
                  <Button 
                    onClick={() => {
                      handleReorder(selectedOrder);
                      setOrderDetailsOpen(false);
                    }}
                    className="flex-1"
                  >
                    إعادة طلب نفس العناصر
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setOrderDetailsOpen(false)}
                  className="flex-1"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Tracking Dialog */}
      <OrderTrackingDialog
        order={trackingOrder}
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
      />

      {/* Footer */}
      <footer className="bg-pizza-brown text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">🍕 Pizza Home</div>
          <p className="text-white/80 mb-4">أشهى الأطباق من قلب المطبخ الشرقي والغربي</p>
          <div className="text-white/60 text-sm">
            جميع الحقوق محفوظة © 2024 Pizza Home
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;