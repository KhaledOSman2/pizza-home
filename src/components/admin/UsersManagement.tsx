import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Edit, 
  Trash2, 
  Loader2, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Search,
  ShoppingBag
} from "lucide-react";
import { apiService, User as UserType } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import UserOrdersDialog from "./UserOrdersDialog";

const UsersManagement = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<UserType | null>(null);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'customer' as 'customer' | 'admin'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllUsers();
      if (response.users) {
        setUsers(response.users);
        setFilteredUsers(response.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: "فشل في تحميل قائمة المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'customer'
    });
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role as 'customer' | 'admin'
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingUser || !formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى إدخال الاسم والبريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role
      });
      
      if (response.user) {
        toast({
          title: "تم تحديث المستخدم بنجاح",
          description: `تم تحديث بيانات "${formData.name}" بنجاح`,
        });
        
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? response.user : user
        ));
        setIsEditOpen(false);
        setEditingUser(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: "فشل في تحديث المستخدم",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: UserType) => {
    try {
      await apiService.deleteUser(user.id);
      
      toast({
        title: "تم حذف المستخدم بنجاح",
        description: `تم حذف المستخدم "${user.name}" بنجاح`,
      });
      
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: "فشل في حذف المستخدم",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  const getUserStats = () => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      customers: users.filter(u => u.role === 'customer').length,
    };
  };

  const stats = getUserStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>إدارة المستخدمين</CardTitle>
          
          {/* Search and Filter Controls */}
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="فلترة حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستخدمين</SelectItem>
                <SelectItem value="admin">المديرين</SelectItem>
                <SelectItem value="customer">العملاء</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">إجمالي المستخدمين</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.admins}</div>
            <div className="text-xs text-muted-foreground">المديرين</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.customers}</div>
            <div className="text-xs text-muted-foreground">العملاء</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري تحميل المستخدمين...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {user.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                          <Shield className="h-3 w-3 ml-1" />
                          {user.role === 'admin' ? 'مدير' : 'عميل'}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>انضم {new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {user.role === 'customer' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUserForOrders(user);
                          setIsOrdersDialogOpen(true);
                        }}
                      >
                        <ShoppingBag className="h-3 w-3 ml-1" />
                        عرض الطلبات
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
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
                            هل أنت متأكد من حذف المستخدم "{user.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== "all" 
                ? "لا توجد نتائج للبحث" 
                : "لا توجد مستخدمين حالياً"
              }
            </p>
          </div>
        )}
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">الاسم *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل الاسم"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">البريد الإلكتروني *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">العنوان</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="أدخل العنوان"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">الدور</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'customer' | 'admin' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">عميل</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                </SelectContent>
              </Select>
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

      {/* User Orders Dialog */}
      {selectedUserForOrders && (
        <UserOrdersDialog
          user={selectedUserForOrders}
          open={isOrdersDialogOpen}
          onOpenChange={(open) => {
            setIsOrdersDialogOpen(open);
            if (!open) {
              setSelectedUserForOrders(null);
            }
          }}
        />
      )}
    </Card>
  );
};

export default UsersManagement;