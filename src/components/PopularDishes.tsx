import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface DishProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

const dishes: DishProps[] = [
  {
    id: 1,
    name: "بيتزا مارغريتا",
    price: 25,
    image: "/placeholder.svg?height=200&width=200",
    description: "طماطم طازجة وجبنة موزاريلا وريحان"
  },
  {
    id: 2,
    name: "فطيرة سبانخ",
    price: 12,
    image: "/placeholder.svg?height=200&width=200",
    description: "سبانخ طازج مع البصل والتوابل"
  },
  {
    id: 3,
    name: "بيتزا شرقي",
    price: 30,
    image: "/placeholder.svg?height=200&width=200",
    description: "زعتر وجبنة وطماطم وزيتون"
  },
  {
    id: 4,
    name: "سلطة فتوش",
    price: 15,
    image: "/placeholder.svg?height=200&width=200",
    description: "خضار طازجة مع الخبز المحمص"
  }
];

const PopularDishes = () => {
  return (
    <section className="py-12 bg-pizza-cream/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">
          الأصناف الأشهر
        </h2>
        
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
            {dishes.map((dish) => (
              <Card key={dish.id} className="min-w-[280px] hover:shadow-lg transition-all duration-300 bg-card border border-border">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={dish.image} 
                      alt={dish.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 right-3 bg-pizza-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {dish.price} ج.م
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {dish.name}
                    </h3>
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
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;