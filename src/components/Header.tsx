import { User, ShoppingCart, LogIn, LogOut, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminNotifications } from "@/contexts/AdminNotificationContext";

const Header = () => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { pendingOrdersCount } = useAdminNotifications();
  const totalItems = getTotalItems();
  
  const handleLogout = async () => {
    await logout();
  };
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Welcome */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-pizza-red">🍕 Pizza Home</div>
            </Link>
            <span className="text-muted-foreground hidden sm:block">مرحباً بك في بيت البيتزا</span>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* User Dropdown/Links */}
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Button>
                </Link>
                
                {/* Admin Dashboard Link */}
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2 relative">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">لوحة الإدارة</span>
                      {pendingOrdersCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg ring-2 ring-green-200">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </Button>
              </Link>
            )}
            
            <Link to="/categories">
              <Button variant="order" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">طلب جديد</span>
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="outline" size="sm" className="gap-2 relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">السلة</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pizza-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;