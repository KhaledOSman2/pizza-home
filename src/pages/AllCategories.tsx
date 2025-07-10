import Header from "@/components/Header";
import CategoryCard from "@/components/CategoryCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import pizzaEastern from "@/assets/pizza-eastern.jpg";
import pizzaWestern from "@/assets/pizza-western.jpg";
import fatayer from "@/assets/fatayer.jpg";
import salads from "@/assets/salads.jpg";

const allCategories = [
  {
    id: "eastern-pizza",
    title: "بيتزا شرقي",
    image: pizzaEastern,
    description: "بيتزا بنكهات شرقية أصيلة مع الزعتر والجبنة"
  },
  {
    id: "western-pizza",
    title: "بيتزا غربي", 
    image: pizzaWestern,
    description: "بيتزا كلاسيكية مع الطماطم والجبنة والريحان"
  },
  {
    id: "fatayer",
    title: "الفطائر",
    image: fatayer,
    description: "فطائر شرقية محشوة بالسبانخ واللحمة والجبنة"
  },
  {
    id: "salads",
    title: "السلطات",
    image: salads,
    description: "سلطات طازجة ومتنوعة لوجبة صحية"
  },
  {
    id: "appetizers",
    title: "المقبلات",
    image: "/placeholder.svg?height=300&width=300",
    description: "مقبلات شهية لبداية مثالية لوجبتك"
  },
  {
    id: "desserts",
    title: "الحلويات",
    image: "/placeholder.svg?height=300&width=300",
    description: "حلويات شرقية وغربية لخاتمة حلوة"
  },
  {
    id: "beverages",
    title: "المشروبات",
    image: "/placeholder.svg?height=300&width=300",
    description: "مشروبات طازجة وعصائر طبيعية"
  },
  {
    id: "breakfast",
    title: "الإفطار",
    image: "/placeholder.svg?height=300&width=300",
    description: "وجبات إفطار شهية لبداية يوم مميز"
  }
];

const AllCategories = () => {
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
            <span className="text-foreground font-medium">جميع الأقسام</span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            جميع أقسام الطعام
          </h1>
          <p className="text-xl text-muted-foreground">
            اختر من بين مجموعة متنوعة من الأطباق الشهية
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allCategories.map((category) => (
              <Link key={category.id} to={`/category/${category.id}`}>
                <div className="group">
                  <CategoryCard
                    title={category.title}
                    image={category.image}
                  />
                  <p className="text-muted-foreground text-sm mt-3 px-2 group-hover:text-foreground transition-colors">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
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

export default AllCategories;