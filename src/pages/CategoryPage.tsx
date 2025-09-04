import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Plus, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService, Dish, Category } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchCategoryData();
    }
  }, [id]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      // Fetch dishes for this category using the slug
      const dishesResponse = await apiService.getDishes(id);
      const dishesData = dishesResponse as any; // The API returns the data directly
      setDishes(dishesData.dishes || []);
      
      // If we have dishes, get the category info from the first dish
      if (dishesData.dishes && dishesData.dishes.length > 0) {
        setCategory(dishesData.dishes[0].category);
      } else {
        // Try to fetch category directly if no dishes found
        try {
          const categoryResponse = await apiService.getCategory(id);
          const categoryData = categoryResponse as any;
          setCategory(categoryData.category);
        } catch (catError) {
          console.log('Category not found:', catError);
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات القسم. يرجى المحاولة مرة أخرى.",
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

  const categoryName = category?.name || "قسم غير معروف";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-pizza-cream/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/categories" className="text-muted-foreground hover:text-foreground">
              جميع الأقسام
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{categoryName}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-muted-foreground">
            اختر من بين أشهى الأطباق في هذا القسم
          </p>
        </div>
      </section>

      {/* Dishes Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">جاري تحميل الأطباق...</div>
            </div>
          ) : dishes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {dishes.map((dish) => (
                <Card key={dish._id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-0">
                    <Link to={`/dish/${dish._id}`}>
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img 
                          src={dish.image?.url || "/placeholder.svg?height=250&width=250"} 
                          alt={dish.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-pizza-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {dish.price} ج.م
                        </div>
                        <div className="absolute top-3 left-3 bg-white/90 text-foreground px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {dish.rating}
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
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                لا توجد أطباق في هذا القسم حالياً
              </h3>
              <p className="text-muted-foreground mb-6">
                يرجى المحاولة مرة أخرى لاحقاً أو تصفح الأقسام الأخرى
              </p>
              <Link to="/categories">
                <Button variant="outline">تصفح الأقسام الأخرى</Button>
              </Link>
            </div>
          )}
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

export default CategoryPage;