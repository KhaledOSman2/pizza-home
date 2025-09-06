# إصلاح مشكلة المصادقة في بيئة الإنتاج

## 🚨 المشكلة
في بيئة الإنتاج، تسجيل الدخول يعمل (200 OK) لكن الطلبات اللاحقة تفشل بـ 401 Unauthorized.

## 🔍 سبب المشكلة
المشكلة تكمن في إعدادات الـ cookies عند التعامل مع domains مختلفة:
- **Backend**: `https://spectacular-mouse-pizaahome-ee337475.koyeb.app`
- **Frontend**: domain آخر (Vercel أو غيره)

الـ cookies مع `sameSite: 'none'` قد لا تُرسل بشكل صحيح في cross-origin requests.

## ✅ الحلول المطبقة

### 1. **تحسين إعدادات Cookie** (`backend/src/utils/token.js`)
```javascript
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    signed: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };
  
  // إضافة domain setting إذا كان محدد في متغيرات البيئة
  if (isProd && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }
  
  res.cookie('access_token', token, cookieOptions);
}
```

### 2. **إضافة Authorization Header كـ Backup** (`src/services/api.ts`)
```typescript
class ApiService {
  private authToken: string | null = null;

  // تخزين التوكن في localStorage و memory
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  // إضافة Authorization header تلقائياً
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // باقي المنطق...
  }
}
```

### 3. **حفظ التوكن عند Login/Signup**
```typescript
async login(credentials: LoginData): Promise<ApiResponse<User>> {
  const response = await this.makeRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  // حفظ التوكن للطلبات المستقبلية
  if (response.token) {
    this.setAuthToken(response.token);
  }
  
  return response;
}
```

### 4. **مسح التوكن عند Logout**
```typescript
async logout(): Promise<ApiResponse> {
  const response = await this.makeRequest('/auth/logout', {
    method: 'POST',
  });
  
  // مسح التوكن المحفوظ
  this.clearAuthToken();
  
  return response;
}
```

## 🎯 النتيجة المتوقعة

بعد هذه الإصلاحات:

### ✅ **المصادقة المزدوجة**:
1. **الأولوية الأولى**: Cookies (إذا عملت)
2. **الاحتياط**: Authorization Header

### ✅ **حل مشاكل Cross-Domain**:
- الـ Authorization Header يعمل مع أي domain
- الـ token محفوظ في localStorage للاستمرارية

### ✅ **استمرارية الجلسة**:
- التوكن يُحفظ حتى بعد إعادة تشغيل المتصفح
- يُرسل تلقائياً مع كل طلب API

## 🚀 التطبيق

1. **Deploy التحديثات** إلى بيئة الإنتاج
2. **اختبار تسجيل الدخول** مرة أخرى
3. **التحقق** من عمل API calls بعد Login

## 🔧 تخصيص إضافي (اختياري)

إذا كنت تريد تحديد domain محدد للـ cookies:
```env
COOKIE_DOMAIN=.yourdomain.com
```

---

هذا الحل يضمن عمل المصادقة في جميع البيئات والأنواع المختلفة من deployments.
