import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Loader2, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CreditCard,
  Filter,
  Download,
  Search,
  History,
  RefreshCw
} from "lucide-react";
import { apiService, Order } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useQueries";
import OrderTrackingDialog from "./OrderTrackingDialog";
import { 
  formatArabicDate, 
  formatCompactArabicDate, 
  getRelativeTimeArabic,
  sortOrdersByDate,
  isSuspiciousFutureDate,
  getDateWarningMessage
} from "@/utils/dateUtils";
import { syncWithServerTime } from "@/utils/serverTimeSync";

interface OrdersManagementProps {
  onOrderStatusChange?: () => void;
}

const OrdersManagement = ({ onOrderStatusChange }: OrdersManagementProps = {}) => {
  // استخدام React Query لجلب الطلبات مع caching
  const { data: ordersResponse, isLoading, error, refetch, isFetching } = useAdminOrders();
  const updateOrderMutation = useUpdateOrderStatus();
  
  const orders = ordersResponse?.orders || [];
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sync with server time on component mount
  useEffect(() => {
    syncWithServerTime();
  }, []);

  // Check if order is new (within last 24 hours) and has pending status
  const isNewOrder = (order: Order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24 && order.status === 'pending';
  };

  // عرض خطأ إذا فشل في تحميل الطلبات
  useEffect(() => {
    if (error) {
      toast({
        title: "خطأ في تحميل الطلبات",
        description: "فشل في تحميل قائمة الطلبات",
        variant: "destructive",
      });
    }
  }, [error]);

  // Filter and sort orders based on status and search
  useEffect(() => {
    // First sort orders properly (handling suspicious dates)
    let filtered = sortOrdersByDate(orders);
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in order ID
        if (order._id.toLowerCase().includes(searchLower)) return true;
        
        // Search in order number (numeric)
        if (order.orderNumber && order.orderNumber.includes(searchTerm)) return true;
        
        // Search in customer info
        if (order.customer.name.toLowerCase().includes(searchLower)) return true;
        if (order.customer.phone.includes(searchTerm)) return true;
        
        // Search in order items (safely)
        return order.items.some(item => {
          // Check if dish is populated with name property
          if (item.dish && typeof item.dish === 'object' && 'name' in item.dish) {
            return item.dish.name.toLowerCase().includes(searchLower);
          }
          // Fallback to item name if dish is not populated
          if (item.name) {
            return item.name.toLowerCase().includes(searchLower);
          }
          return false;
        });
      });
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

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

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    // استخدام React Query mutation مع التحديث التلقائي للـ cache
    updateOrderMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          // Update selected order if it's the same
          if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
          }
          
          // Trigger notification refresh if callback provided
          if (onOrderStatusChange) {
            onOrderStatusChange();
          }
        }
      }
    );
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    refetch();
    toast({
      title: "تم تحديث الطلبات",
      description: "جاري تحميل أحدث الطلبات...",
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleTrackOrder = (order: Order) => {
    setTrackingOrder(order);
    setTrackingOpen(true);
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      onTheWay: orders.filter(o => o.status === 'on_the_way').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const stats = getOrderStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>إدارة الطلبات</CardTitle>
          <div className="flex gap-3">
            <Button
              onClick={handleManualRefresh}
              disabled={isFetching}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'جاري التحديث...' : 'تحديث'}
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطلبات</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="preparing">قيد التحضير</SelectItem>
                <SelectItem value="on_the_way">في الطريق</SelectItem>
                <SelectItem value="delivered">تم التوصيل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">إجمالي</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">انتظار</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.preparing}</div>
            <div className="text-xs text-muted-foreground">تحضير</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.onTheWay}</div>
            <div className="text-xs text-muted-foreground">في الطريق</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.delivered}</div>
            <div className="text-xs text-muted-foreground">مكتمل</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">ملغي</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري تحميل الطلبات...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">طلب #{order.orderNumber || order._id.slice(-6)}</span>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    {isNewOrder(order) && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white ml-2 animate-pulse shadow-md font-bold">
                        جديد
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      {formatCompactArabicDate(order.createdAt)}
                      {isSuspiciousFutureDate(order.createdAt) && (
                        <span className="text-yellow-600" title={getDateWarningMessage(order.createdAt) || ""}>
                          ⚠️
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{order.customer.name}</span>
                      {order.user && (
                        <Badge variant="outline" className="text-xs">
                          مستخدم مسجل: {order.user.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{order.customer.phone}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.items.length} أصناف</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-pizza-red">{order.total} ج.م</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground line-clamp-2">{order.customer.address}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">تحديث الحالة:</span>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => handleStatusUpdate(order._id, value as Order["status"])}
                                              disabled={updateOrderMutation.isPending}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="preparing">قيد التحضير</SelectItem>
                        <SelectItem value="on_the_way">في الطريق</SelectItem>
                        <SelectItem value="delivered">تم التوصيل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                    {updateOrderMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleTrackOrder(order)}>
                      <History className="h-3 w-3 ml-1" />
                      تتبع الطلب
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-3 w-3 ml-1" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {statusFilter === "all" ? "لا توجد طلبات حالياً" : `لا توجد طلبات ${getStatusText(statusFilter as Order["status"])}`}
            </p>
          </div>
        )}
      </CardContent>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
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
                  <div className="flex items-center gap-2">
                    {formatArabicDate(selectedOrder.createdAt)}
                    {isSuspiciousFutureDate(selectedOrder.createdAt) && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        ⚠️
                        <span className="text-xs">
                          {getDateWarningMessage(selectedOrder.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
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
                        <div className="font-medium">{item.quantity}× {item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.price} ج.م 
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

              {/* Admin Actions */}
              <div className="flex gap-3 pt-4">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm">تحديث الحالة:</span>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value) => handleStatusUpdate(selectedOrder._id, value as Order["status"])}
                    disabled={updateOrderMutation.isPending}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">في الانتظار</SelectItem>
                      <SelectItem value="preparing">قيد التحضير</SelectItem>
                      <SelectItem value="on_the_way">في الطريق</SelectItem>
                      <SelectItem value="delivered">تم التوصيل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setOrderDetailsOpen(false)}
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
    </Card>
  );
};

export default OrdersManagement;