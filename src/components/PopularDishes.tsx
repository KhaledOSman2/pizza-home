import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService, Dish } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

const PopularDishes = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchPopularDishes();
  }, []);

  const fetchPopularDishes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDishes();
      const dishesData = response as any; // The API returns the data directly
      // Get the first 4 dishes as popular dishes
      setDishes((dishesData.dishes || []).slice(0, 4));
    } catch (error) {
      console.error('Error fetching popular dishes:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل الأطباق الشعبية.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (dish: Dish) => {
    addToCart({
      _id: dish._id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
    });
  };
  return (
    <section className="py-12 bg-pizza-cream/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">
          الأصناف الأشهر
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg text-muted-foreground">جاري تحميل الأطباق الشعبية...</div>
          </div>
        ) : dishes.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
              {dishes.map((dish) => (
                <Card key={dish._id} className="min-w-[280px] hover:shadow-lg transition-all duration-300 bg-card border border-border group">
                  <CardContent className="p-0">
                    <Link to={`/dish/${dish._id}`}>
                      <div className="relative">
                        <img 
                          src={dish.image?.url || "/placeholder.svg?height=200&width=200"} 
                          alt={dish.name}
                          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-pizza-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {dish.price} ج.م
                        </div>
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <Link to={`/dish/${dish._id}`}>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-pizza-red transition-colors">
                          {dish.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {dish.description || "طبق لذيذ ومميز"}
                      </p>
                      
                      <Button 
                        className="w-full gap-2" 
                        variant="order"
                        onClick={() => handleAddToCart(dish)}
                      >
                        <Plus className="h-4 w-4" />
                        أضف للسلة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-lg text-muted-foreground">لا توجد أطباق متاحة حالياً</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularDishes;