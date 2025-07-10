import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-pizza-cream/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">تسجيل الدخول</span>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-pizza-cream">
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">🍕</div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  تسجيل الدخول
                </CardTitle>
                <p className="text-muted-foreground">
                  أهلاً بعودتك! سجل دخولك لتستمتع بأطباقك المفضلة
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form className="space-y-4">
                  {/* Email or Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="emailOrPhone" className="text-foreground font-medium">
                      البريد الإلكتروني أو رقم الهاتف
                    </Label>
                    <div className="relative">
                      <Input
                        id="emailOrPhone"
                        type="text"
                        placeholder="example@email.com أو 01xxxxxxxxx"
                        className="pl-10"
                        dir="ltr"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        className="pl-10 pr-10"
                        dir="ltr"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="text-left">
                    <Link 
                      to="/forgot-password" 
                      className="text-pizza-red hover:text-pizza-orange text-sm transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    variant="hero" 
                    className="w-full text-lg py-6"
                  >
                    تسجيل الدخول
                  </Button>
                </form>

                {/* Divider */}
                <div className="text-center text-muted-foreground">
                  <span>أو</span>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-muted-foreground">
                    ليس لديك حساب؟{" "}
                    <Link 
                      to="/signup" 
                      className="text-pizza-red hover:text-pizza-orange font-medium transition-colors"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </p>
                </div>

                {/* Guest Continue */}
                <div className="text-center pt-4 border-t border-border">
                  <p className="text-muted-foreground mb-3">أو متابعة كضيف</p>
                  <Link to="/categories">
                    <Button variant="outline" className="w-full">
                      تصفح الأطباق بدون تسجيل
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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

export default Login;