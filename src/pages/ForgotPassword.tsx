import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ForgotPassword = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: backend API integration will be added later
    alert("سيتم تفعيل استعادة كلمة المرور قريباً.\nPassword reset coming soon.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-md">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-2xl">استعادة كلمة المرور</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
              <Button type="submit" className="w-full">إرسال رابط الاستعادة</Button>
            </form>
            <div className="text-sm text-muted-foreground mt-4 text-center">
              تذكرت كلمة المرور؟ <Link className="text-pizza-red hover:underline" to="/login">تسجيل الدخول</Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ForgotPassword;
