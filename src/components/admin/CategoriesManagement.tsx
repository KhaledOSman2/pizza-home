import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Upload, Loader2, Search } from "lucide-react";
import { apiService, Category } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCategories();
      if (response.categories) {
        setCategories(response.categories);
        setFilteredCategories(response.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast({
        title: "خطأ في تحميل الأصناف",
        description: "فشل في تحميل قائمة الأصناف",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categories, searchTerm]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
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

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى إدخال اسم الصنف",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await apiService.createCategory(formDataToSend);
      
      if (response.category) {
        toast({
          title: "تم إنشاء الصنف بنجاح",
          description: `تم إضافة صنف "${formData.name}" بنجاح`,
        });
        
        setCategories(prev => [response.category, ...prev]);
        setIsCreateOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast({
        title: "فشل في إنشاء الصنف",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الصنف",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: null
    });
    setImagePreview(category.image?.url || null);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى إدخال اسم الصنف",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await apiService.updateCategory(editingCategory._id, formDataToSend);
      
      if (response.category) {
        toast({
          title: "تم تحديث الصنف بنجاح",
          description: `تم تحديث صنف "${formData.name}" بنجاح`,
        });
        
        setCategories(prev => prev.map(cat => 
          cat._id === editingCategory._id ? response.category : cat
        ));
        setIsEditOpen(false);
        setEditingCategory(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: "فشل في تحديث الصنف",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الصنف",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      await apiService.deleteCategory(category._id);
      
      toast({
        title: "تم حذف الصنف بنجاح",
        description: `تم حذف صنف "${category.name}" بنجاح`,
      });
      
      setCategories(prev => prev.filter(cat => cat._id !== category._id));
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: "فشل في حذف الصنف",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حذف الصنف",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>إدارة الأصناف</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الأصناف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة صنف جديد
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة صنف جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الصنف *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم الصنف"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف الصنف (اختياري)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">صورة الصنف</Label>
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
                  onClick={handleCreate} 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    "إضافة الصنف"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري تحميل الأصناف...</span>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid gap-4">
            {filteredCategories.map((category) => (
              <div key={category._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {category.image?.url && (
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      تم الإنشاء: {new Date(category.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
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
                          هل أنت متأكد من حذف صنف "{category.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category)}>
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
            <p className="text-muted-foreground">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أصناف حالياً"}
            </p>
            {!searchTerm && (
              <p className="text-sm text-muted-foreground">ابدأ بإضافة صنف جديد</p>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الصنف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم الصنف *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسم الصنف"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">الوصف</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف الصنف (اختياري)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-image">صورة الصنف</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="edit-image"
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
              onClick={handleUpdate} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري التحديث...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CategoriesManagement;