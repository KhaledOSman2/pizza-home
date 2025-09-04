import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  ShoppingBag, 
  Clock, 
  Calendar,
  MapPin,
  Phone,
  User as UserIcon
} from "lucide-react";
import { apiService, Order, User } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface UserOrdersDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserOrdersDialog = ({ user, open, onOpenChange }: UserOrdersDialogProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserOrders = async () => {
    if (!user || !open) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getUserOrders(user.id);
      if (response.orders) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
      toast({
        title: "خطأ في تحميل الطلبات",
        description: "فشل في تحميل طلبات المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user, open]);

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

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ج.م`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            طلبات العميل: {user.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري تحميل الطلبات...</span>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border rounded-lg p-4 space-y-3">
                  {/* Order Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">طلب #{order._id.slice(-6)}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleString('ar-EG')}
                    </div>
                  </div>
                  
                  {/* Customer Info */}
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-muted-foreground" />
                      <span>{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{order.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{order.customer.address}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.dish.image?.url && (
                            <img
                              src={item.dish.image.url}
                              alt={item.dish.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <span>{item.dish.name}</span>
                          <Badge variant="outline">×{item.quantity}</Badge>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.dish.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Order Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>وقت التحضير: {order.estimatedDeliveryTime || 'غير محدد'}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      المجموع: {formatPrice(order.total)}
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <strong>ملاحظات:</strong> {order.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات لهذا العميل</p>
            </div>
          )}
        </ScrollArea>
        
        {orders.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{orders.length}</div>
                <div className="text-xs text-muted-foreground">إجمالي الطلبات</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-xs text-muted-foreground">مكتملة</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {orders.filter(o => o.status === 'cancelled').length}
                </div>
                <div className="text-xs text-muted-foreground">ملغية</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(orders.reduce((sum, order) => 
                    order.status === 'delivered' ? sum + order.total : sum, 0
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">إجمالي المبيعات</div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserOrdersDialog;