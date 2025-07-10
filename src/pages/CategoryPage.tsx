import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Plus, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";

interface DishType {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  category: string;
}

const dishes: DishType[] = [
  {
    id: 1,
    name: "بيتزا زعتر وجبنة",
    price: 25,
    image: "/placeholder.svg?height=250&width=250",
    description: "بيتزا شرقية لذيذة مع الزعتر الطازج والجبنة البيضاء",
    rating: 4.8,
    category: "eastern-pizza"
  },
  {
    id: 2,
    name: "بيتزا شاورما",
    price: 35,
    image: "/placeholder.svg?height=250&width=250",
    description: "بيتزا مميزة محشوة بالشاورما والخضار",
    rating: 4.9,
    category: "eastern-pizza"
  },
  {
    id: 3,
    name: "بيتزا مارغريتا",
    price: 30,
    image: "/placeholder.svg?height=250&width=250",
    description: "البيتزا الكلاسيكية مع الطماطم والجبنة والريحان",
    rating: 4.7,
    category: "western-pizza"
  },
  {
    id: 4,
    name: "بيتزا بيبروني",
    price: 40,
    image: "/placeholder.svg?height=250&width=250",
    description: "بيتزا غربية مع شرائح البيبروني الحارة",
    rating: 4.6,
    category: "western-pizza"
  },
  {
    id: 5,
    name: "فطيرة سبانخ",
    price: 12,
    image: "/placeholder.svg?height=250&width=250",
    description: "فطيرة تقليدية محشوة بالسبانخ الطازج",
    rating: 4.5,
    category: "fatayer"
  },
  {
    id: 6,
    name: "فطيرة لحمة",
    price: 15,
    image: "/placeholder.svg?height=250&width=250",
    description: "فطيرة شهية محشوة باللحمة المفرومة والتوابل",
    rating: 4.8,
    category: "fatayer"
  }
];

const categoryNames: Record<string, string> = {
  "eastern-pizza": "بيتزا شرقي",
  "western-pizza": "بيتزا غربي",
  "fatayer": "الفطائر",
  "salads": "السلطات"
};

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const categoryName = id ? categoryNames[id] || "قسم غير معروف" : "قسم غير معروف";
  const categoryDishes = dishes.filter(dish => dish.category === id);

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
          {categoryDishes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categoryDishes.map((dish) => (
                <Card key={dish.id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-0">
                    <Link to={`/dish/${dish.id}`}>
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img 
                          src={dish.image} 
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
                      <Link to={`/dish/${dish.id}`}>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-pizza-red transition-colors">
                          {dish.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {dish.description}
                      </p>
                      
                      <Button className="w-full gap-2" variant="order">
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