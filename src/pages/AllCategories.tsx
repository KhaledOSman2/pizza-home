import Header from "@/components/Header";
import CategoryCard from "@/components/CategoryCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService, Category } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useQueries";

const AllCategories = () => {
  const { toast } = useToast();
  
  // استخدام React Query مع caching
  const { data: categoriesResponse, isLoading: loading, error } = useCategories();
  const categories = categoriesResponse?.categories || [];

  // عرض خطأ إذا فشل في تحميل الأقسام
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل الأقسام. يرجى المحاولة مرة أخرى.",
      });
    }
  }, [error, toast]);
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
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">جاري تحميل الأقسام...</div>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category) => (
                <Link key={category._id} to={`/category/${category.slug}`}>
                  <div className="group">
                    <CategoryCard
                      title={category.name}
                      image={category.image?.url || "/placeholder.svg?height=300&width=300"}
                    />
                    <p className="text-muted-foreground text-sm mt-3 px-2 group-hover:text-foreground transition-colors">
                      {category.description || "استكشف أشهى الأطباق في هذا القسم"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                لا توجد أقسام متاحة حالياً
              </h3>
              <p className="text-muted-foreground mb-6">
                يرجى المحاولة مرة أخرى لاحقاً
              </p>
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

export default AllCategories;