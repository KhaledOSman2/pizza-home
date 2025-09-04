import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Plus, Minus, Trash2, ShoppingCart, User, Phone, MapPin, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: ''
  });

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 50 ? 0 : 10;
  const total = subtotal + deliveryFee;

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يجب تسجيل الدخول أولاً لإتمام الطلب",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "معلومات مطلوبة",
        description: "يرجى ملء جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        items: cartItems.map(item => ({
          dish: item._id,
          quantity: item.quantity
        })),
        notes: customerInfo.notes,
        paymentMethod: 'cod' as const
      };

      const response = await apiService.createOrder(orderData);
      
      if (response.order) {
        toast({
          title: "تم إنشاء الطلب بنجاح",
          description: "سيتم التواصل معك قريباً لتأكيد الطلب",
        });
        
        clearCart();
        setIsCheckoutOpen(false);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: "فشل في إنشاء الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <section className="bg-pizza-cream/30 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">السلة</span>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              السلة فارغة
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              لم تقم بإضافة أي أطباق إلى السلة حتى الآن. ابدأ بتصفح أطباقنا اللذيذة
            </p>
            <Link to="/categories">
              <Button size="lg" variant="hero">
                <ShoppingCart className="h-5 w-5 ml-2" />
                ابدأ التسوق
              </Button>
            </Link>
          </div>
        </section>

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
  }

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
            <span className="text-foreground font-medium">السلة</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            سلة التسوق ({cartItems.length} أصناف)
          </h1>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id} className="p-6">
                  <div className="flex gap-4">
                    <img 
                      src={item.image?.url || "/placeholder.svg?height=100&width=100"} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-destructive hover:text-destructive/80 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {item.notes && (
                        <p className="text-muted-foreground text-sm mb-3">
                          ملاحظة: {item.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-left">
                          <div className="text-lg font-semibold text-pizza-red">
                            {item.price * item.quantity} ج.م
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {item.price} ج.م × {item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal} ج.م</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>رسوم التوصيل</span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "مجاني" : `${deliveryFee} ج.م`}
                    </span>
                  </div>
                  
                  {deliveryFee > 0 && (
                    <p className="text-muted-foreground text-sm">
                      احصل على توصيل مجاني للطلبات أكثر من 50 ج.م
                    </p>
                  )}
                  
                  <hr className="border-border" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الكلي</span>
                    <span className="text-pizza-red">{total} ج.م</span>
                  </div>
                  
                  <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" variant="hero" className="w-full text-lg py-6">
                        تأكيد الطلب
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>معلومات التوصيل</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            الاسم الكامل
                          </Label>
                          <Input
                            id="name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="أدخل اسمك الكامل"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            رقم الهاتف
                          </Label>
                          <Input
                            id="phone"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="أدخل رقم الهاتف"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            العنوان
                          </Label>
                          <Textarea
                            id="address"
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="أدخل عنوان التوصيل التفصيلي"
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                          <Textarea
                            id="notes"
                            value={customerInfo.notes}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="أي ملاحظات خاصة بالطلب..."
                            rows={2}
                          />
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>المجموع الفرعي:</span>
                            <span>{subtotal} ج.م</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>رسوم التوصيل:</span>
                            <span>{deliveryFee === 0 ? "مجاني" : `${deliveryFee} ج.م`}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>المجموع الكلي:</span>
                            <span className="text-pizza-red">{total} ج.م</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleCreateOrder} 
                          disabled={isSubmitting}
                          className="w-full" 
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              جاري إنشاء الطلب...
                            </>
                          ) : (
                            "تأكيد الطلب والدفع عند الاستلام"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Link to="/categories">
                    <Button variant="outline" className="w-full">
                      إضافة المزيد من الأطباق
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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

export default Cart;