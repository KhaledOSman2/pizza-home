import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  notes?: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "بيتزا زعتر وجبنة",
      price: 25,
      image: "/placeholder.svg?height=100&width=100",
      quantity: 2,
      notes: "بدون بصل"
    },
    {
      id: 2,
      name: "فطيرة سبانخ",
      price: 12,
      image: "/placeholder.svg?height=100&width=100",
      quantity: 1
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 50 ? 0 : 10;
  const total = subtotal + deliveryFee;

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
                <Card key={item.id} className="p-6">
                  <div className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                  
                  <Button size="lg" variant="hero" className="w-full text-lg py-6">
                    تأكيد الطلب
                  </Button>
                  
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