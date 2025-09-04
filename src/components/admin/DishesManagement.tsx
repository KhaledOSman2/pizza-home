import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Upload, Loader2, Star, Clock, Users, Search } from "lucide-react";
import { apiService, Dish, Category } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const DishesManagement = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    prepTimeMin: '',
    serves: '',
    ingredients: '',
    isAvailable: true,
    image: null as File | null
  });

  // Fetch dishes and categories
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dishesRes, categoriesRes] = await Promise.all([
        apiService.getDishes(),
        apiService.getCategories()
      ]);
      
      if (dishesRes.dishes) {
        setDishes(dishesRes.dishes);
        setFilteredDishes(dishesRes.dishes);
      }
      if (categoriesRes.categories) {
        setCategories(categoriesRes.categories);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "فشل في تحميل الأطباق والأصناف",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter dishes based on search and category
  useEffect(() => {
    let filtered = dishes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dish.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(dish => dish.category._id === categoryFilter);
    }

    setFilteredDishes(filtered);
  }, [dishes, searchTerm, categoryFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      prepTimeMin: '',
      serves: '',
      ingredients: '',
      isAvailable: true,
      image: null
    });
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى إدخال اسم الطبق",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast({
        title: "بيانات غير صحيحة",
        description: "يرجى إدخال سعر صحيح للطبق",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.category) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى اختيار صنف للطبق",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const buildFormData = () => {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('isAvailable', formData.isAvailable.toString());
    
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }
    if (formData.prepTimeMin) {
      formDataToSend.append('prepTimeMin', formData.prepTimeMin);
    }
    if (formData.serves) {
      formDataToSend.append('serves', formData.serves);
    }
    if (formData.ingredients) {
      const ingredientsArray = formData.ingredients.split(',').map(ing => ing.trim()).filter(Boolean);
      formDataToSend.append('ingredients', JSON.stringify(ingredientsArray));
    }
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    return formDataToSend;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = buildFormData();
      const response = await apiService.createDish(formDataToSend);
      
      if (response.dish) {
        toast({
          title: "تم إنشاء الطبق بنجاح",
          description: `تم إضافة طبق "${formData.name}" بنجاح`,
        });
        
        setDishes(prev => [response.dish, ...prev]);
        setIsCreateOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create dish:', error);
      toast({
        title: "فشل في إنشاء الطبق",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الطبق",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      category: dish.category._id,
      prepTimeMin: dish.prepTimeMin.toString(),
      serves: dish.serves.toString(),
      ingredients: dish.ingredients.join(', '),
      isAvailable: dish.isAvailable,
      image: null
    });
    setImagePreview(dish.image?.url || null);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingDish || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = buildFormData();
      const response = await apiService.updateDish(editingDish._id, formDataToSend);
      
      if (response.dish) {
        toast({
          title: "تم تحديث الطبق بنجاح",
          description: `تم تحديث طبق "${formData.name}" بنجاح`,
        });
        
        setDishes(prev => prev.map(dish => 
          dish._id === editingDish._id ? response.dish : dish
        ));
        setIsEditOpen(false);
        setEditingDish(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update dish:', error);
      toast({
        title: "فشل في تحديث الطبق",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الطبق",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dish: Dish) => {
    try {
      await apiService.deleteDish(dish._id);
      
      toast({
        title: "تم حذف الطبق بنجاح",
        description: `تم حذف طبق "${dish.name}" بنجاح`,
      });
      
      setDishes(prev => prev.filter(d => d._id !== dish._id));
    } catch (error) {
      console.error('Failed to delete dish:', error);
      toast({
        title: "فشل في حذف الطبق",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حذف الطبق",
        variant: "destructive",
      });
    }
  };

  const DishForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم الطبق *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="أدخل اسم الطبق"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">السعر (ج.م) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">الصنف *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الصنف" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="وصف الطبق (اختياري)"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prepTime">وقت التحضير (دقيقة)</Label>
          <Input
            id="prepTime"
            type="number"
            min="1"
            value={formData.prepTimeMin}
            onChange={(e) => setFormData(prev => ({ ...prev, prepTimeMin: e.target.value }))}
            placeholder="15"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="serves">يكفي لعدد</Label>
          <Input
            id="serves"
            type="number"
            min="1"
            value={formData.serves}
            onChange={(e) => setFormData(prev => ({ ...prev, serves: e.target.value }))}
            placeholder="2"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ingredients">المكونات (مفصولة بفاصلة)</Label>
        <Textarea
          id="ingredients"
          value={formData.ingredients}
          onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
          placeholder="طحين، طماطم، جبنة موتزاريلا، زيتون"
          rows={2}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="available"
          checked={formData.isAvailable}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
        />
        <Label htmlFor="available">متاح للطلب</Label>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">صورة الطبق</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1"
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      
      <Button 
        onClick={isEdit ? handleUpdate : handleCreate} 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
            {isEdit ? "جاري التحديث..." : "جاري الإنشاء..."}
          </>
        ) : (
          isEdit ? "حفظ التغييرات" : "إضافة الطبق"
        )}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>إدارة الأطباق</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الأطباق..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="فلترة حسب الصنف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأصناف</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة طبق جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة طبق جديد</DialogTitle>
                </DialogHeader>
                <DishForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري تحميل الأطباق...</span>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div className="grid gap-4">
            {filteredDishes.map((dish) => (
              <div key={dish._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {dish.image?.url && (
                    <img
                      src={dish.image.url}
                      alt={dish.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{dish.name}</h3>
                      <Badge variant={dish.isAvailable ? "default" : "secondary"}>
                        {dish.isAvailable ? "متاح" : "غير متاح"}
                      </Badge>
                    </div>
                    
                    {dish.description && (
                      <p className="text-muted-foreground text-sm mb-2">{dish.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-semibold text-pizza-red">{dish.price} ج.م</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {dish.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dish.prepTimeMin} د
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        يكفي {dish.serves}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      الصنف: {dish.category.name} • تم الإنشاء: {new Date(dish.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(dish)}
                  >
                    <Edit className="h-3 w-3 ml-1" />
                    تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3 ml-1" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف طبق "{dish.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(dish)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            {searchTerm || categoryFilter !== "all" ? (
              <>
                <p className="text-muted-foreground">لا توجد نتائج للبحث</p>
                <p className="text-sm text-muted-foreground">جرب بحث آخر أو قم بإزالة الفلاتر</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">لا توجد أطباق حالياً</p>
                <p className="text-sm text-muted-foreground">ابدأ بإضافة طبق جديد</p>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الطبق</DialogTitle>
          </DialogHeader>
          <DishForm isEdit />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DishesManagement;