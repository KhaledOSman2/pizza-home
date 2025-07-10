import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryCard from "@/components/CategoryCard";
import PopularDishes from "@/components/PopularDishes";
import OffersSection from "@/components/OffersSection";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import pizzaEastern from "@/assets/pizza-eastern.jpg";
import pizzaWestern from "@/assets/pizza-western.jpg";
import fatayer from "@/assets/fatayer.jpg";
import salads from "@/assets/salads.jpg";

const categories = [
  {
    id: 1,
    title: "بيتزا شرقي",
    image: pizzaEastern
  },
  {
    id: 2,
    title: "بيتزا غربي", 
    image: pizzaWestern
  },
  {
    id: 3,
    title: "الفطائر",
    image: fatayer
  },
  {
    id: 4,
    title: "السلطات",
    image: salads
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Order Now Button */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Link to="/categories">
            <Button 
              size="lg" 
              variant="hero" 
              className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="h-6 w-6 ml-2" />
              اطلب الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-12 bg-pizza-cream/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            الأقسام الرئيسية
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.id}`}>
                <CategoryCard
                  title={category.title}
                  image={category.image}
                />
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to="/categories">
              <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-3">
                عرض جميع الأقسام
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <PopularDishes />

      {/* Second Order Button */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Link to="/categories">
            <Button 
              size="lg" 
              variant="order" 
              className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="h-6 w-6 ml-2" />
              اطلب الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Current Offers */}
      <OffersSection />

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

export default Index;
