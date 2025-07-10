import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  User, 
  MapPin, 
  Clock, 
  CreditCard, 
  LogOut,
  Edit,
  Eye,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  date: string;
  total: number;
  status: "delivered" | "preparing" | "on-way" | "cancelled";
  items: number;
}

const Dashboard = () => {
  const user = {
    name: "أحمد محمد",
    email: "ahmed@example.com",
    phone: "01234567890",
    joinDate: "2024-01-15"
  };

  const orders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-01-20",
      total: 75,
      status: "delivered",
      items: 3
    },
    {
      id: "ORD-002", 
      date: "2024-01-18",
      total: 45,
      status: "preparing",
      items: 2
    },
    {
      id: "ORD-003",
      date: "2024-01-15",
      total: 90,
      status: "delivered",
      items: 4
    }
  ];

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "on-way":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
      case "on-way":
        return "في الطريق";
      case "cancelled":
        return "ملغي";
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
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">تاريخ الانضمام</label>
                    <p className="font-medium">{user.joinDate}</p>
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
                  <Button variant="destructive" className="w-full justify-start gap-2">
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
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">طلب #{order.id}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground text-sm">
                              {order.date}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {order.items} أصناف • {order.total} ج.م
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 ml-1" />
                                عرض
                              </Button>
                              {order.status === "delivered" && (
                                <Button size="sm" variant="order">
                                  إعادة الطلب
                                </Button>
                              )}
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
                    {orders.reduce((sum, order) => sum + order.total, 0)} ج.م
                  </div>
                  <div className="text-muted-foreground">إجمالي المبلغ</div>
                </Card>
                
                <Card className="text-center p-6">
                  <div className="text-2xl font-bold text-pizza-gold">
                    {orders.filter(order => order.status === "delivered").length}
                  </div>
                  <div className="text-muted-foreground">طلبات مكتملة</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

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