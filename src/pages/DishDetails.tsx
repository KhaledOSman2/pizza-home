import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Minus, Star, Clock, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

interface DishDetailsType {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  prepTime: string;
  serves: number;
  ingredients: string[];
  category: string;
  reviews: {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

const dishDetails: Record<string, DishDetailsType> = {
  "1": {
    id: 1,
    name: "بيتزا زعتر وجبنة",
    price: 25,
    image: "/placeholder.svg?height=400&width=400",
    description: "بيتزا شرقية أصيلة مُحضرة بعجينة طازجة ومغطاة بزعتر عالي الجودة وجبنة بيضاء كريمية. تُقدم ساخنة مع لمسة من زيت الزيتون البكر.",
    rating: 4.8,
    prepTime: "15-20 دقيقة",
    serves: 2,
    ingredients: [
      "عجينة بيتزا طازجة",
      "زعتر طبيعي",
      "جبنة بيضاء",
      "زيت زيتون بكر",
      "طماطم طازجة",
      "بصل أحمر"
    ],
    category: "بيتزا شرقي",
    reviews: [
      {
        id: 1,
        user: "أحمد محمد",
        rating: 5,
        comment: "بيتزا رائعة بطعم أصيل، العجينة طرية والزعتر طازج جداً",
        date: "2024-01-15"
      },
      {
        id: 2,
        user: "فاطمة علي",
        rating: 4,
        comment: "طعم جميل لكن أتمنى لو كانت الجبنة أكثر",
        date: "2024-01-10"
      }
    ]
  }
};

const DishDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  
  const dish = id ? dishDetails[id] : null;

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

  const totalPrice = dish.price * quantity;

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
            <span className="text-muted-foreground">{dish.category}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{dish.name}</span>
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
                  src={dish.image} 
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
                    <span className="text-muted-foreground">({dish.reviews.length} تقييم)</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{dish.prepTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>يكفي {dish.serves} أشخاص</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  {dish.description}
                </p>
              </div>

              {/* Ingredients */}
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

              {/* Quantity and Add to Cart */}
              <Card className="p-6 bg-pizza-cream/20">
                <div className="space-y-4">
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

                  <Button size="lg" variant="order" className="w-full text-lg py-6">
                    <Plus className="h-5 w-5" />
                    أضف للسلة ({quantity})
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">تقييمات العملاء</h2>
            
            <div className="space-y-6">
              {dish.reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{review.user}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < review.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm">{review.date}</span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </Card>
              ))}
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

export default DishDetails;