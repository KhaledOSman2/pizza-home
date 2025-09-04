import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  Package, 
  Loader2, 
  Truck, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { Order } from "@/services/api";

interface OrderTrackingDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderTrackingDialog = ({ order, open, onOpenChange }: OrderTrackingDialogProps) => {
  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      case "preparing":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "on_the_way":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "في الانتظار";
      case "preparing":
        return "قيد التحضير";
      case "on_the_way":
        return "في الطريق";
      case "delivered":
        return "تم التوصيل";
      case "cancelled":
        return "ملغي";
      default:
        return "غير معروف";
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "on_the_way":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!order) return null;

  const statusHistory = order.statusHistory || [];
  // Sort by timestamp descending (newest first)
  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            تتبع الطلب {order.orderNumber || order._id.slice(-6)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <div className="font-medium">الحالة الحالية</div>
                <div className="text-sm text-muted-foreground">
                  {getStatusText(order.status)}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>

          <Separator />

          {/* Status History */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">سجل تغييرات الحالة</h3>
            
            {sortedHistory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>لا يوجد سجل لتغييرات الحالة</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4 relative">
                  {sortedHistory.map((entry, index) => (
                    <div key={index} className="flex gap-3 pb-4 relative">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1 relative z-10">
                        {getStatusIcon(entry.status)}
                      </div>
                      
                      {/* Timeline Line */}
                      {index < sortedHistory.length - 1 && (
                        <div className="absolute right-2.5 top-8 w-0.5 h-6 bg-border" />
                      )}
                      
                      {/* Status Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(entry.status)}`}
                          >
                            {getStatusText(entry.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>
                        
                        {entry.note && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingDialog;