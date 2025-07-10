import { User, ShoppingCart, LogIn } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Welcome */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-pizza-red">🍕 Pizza Home</div>
            <span className="text-muted-foreground hidden sm:block">مرحباً بك في بيت البيتزا</span>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </Button>
            
            <Button variant="order" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">طلب جديد</span>
            </Button>

            <Button variant="outline" size="sm" className="gap-2 relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">السلة</span>
              <span className="absolute -top-2 -right-2 bg-pizza-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;