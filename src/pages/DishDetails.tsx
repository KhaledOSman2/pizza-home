import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Minus, Star, Clock, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService, Dish } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

const DishDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchDish();
    }
  }, [id]);

  const fetchDish = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDish(id!);
      const dishData = response as any; // The API returns the data directly
      setDish(dishData.dish);
    } catch (error) {
      console.error('Error fetching dish:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات الطبق. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-lg text-muted-foreground">جاري تحميل بيانات الطبق...</div>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold mb-4">الطبق غير موجود</h2>
          <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على هذا الطبق</p>
          <Link to="/categories">
            <Button>العودة للأقسام</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (dish) {
      addToCart({
        _id: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
      }, quantity);
      
      // Reset quantity after adding to cart
      setQuantity(1);
    }
  };

  const totalPrice = dish ? dish.price * quantity : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <section className="bg-pizza-cream/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/categories" className="text-muted-foreground hover:text-foreground">
              الأقسام
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{dish?.category?.name || "قسم غير معروف"}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{dish?.name}</span>
          </div>
        </div>
      </section>

      {/* Dish Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={dish.image?.url || "/placeholder.svg?height=400&width=400"} 
                  alt={dish.name}
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-pizza-red text-white">
                    {dish.price} ج.م
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {dish.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{dish.rating}</span>
                    <span className="text-muted-foreground">(تقييم ممتاز)</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{dish.prepTimeMin || 15}-{(dish.prepTimeMin || 15) + 5} دقيقة</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>يكفي {dish.serves || 1} أشخاص</span>
                  </div>
                  
                  {/* Availability Status */}
                  <Badge 
                    variant={dish.isAvailable ? "default" : "destructive"}
                    className={dish.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {dish.isAvailable ? "متاح" : "غير متاح"}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  {dish.description || "طبق لذيذ ومميز محضر بعناية ومكونات طازجة"}
                </p>
              </div>

              {/* Ingredients */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">المكونات</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {dish.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pizza-red rounded-full"></div>
                        <span className="text-muted-foreground">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <Card className="p-6 bg-pizza-cream/20">
                <div className="space-y-4">
                  {dish.isAvailable ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">الكمية</span>
                        <div className="flex items-center gap-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xl font-bold">
                        <span>المجموع</span>
                        <span className="text-pizza-red">{totalPrice} ج.م</span>
                      </div>

                      <Button 
                        size="lg" 
                        variant="order" 
                        className="w-full text-lg py-6"
                        onClick={handleAddToCart}
                      >
                        <Plus className="h-5 w-5" />
                        أضف للسلة ({quantity})
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-lg font-semibold text-red-600 mb-2">
                        هذا الطبق غير متاح حالياً
                      </div>
                      <p className="text-muted-foreground mb-4">
                        يرجى العودة لاحقاً أو تصفح الأطباق الأخرى
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.history.back()}
                      >
                        العودة للخلف
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* No reviews section for now - can be added later when we have real reviews */}
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

export default DishDetails;