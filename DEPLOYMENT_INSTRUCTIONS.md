# تعليمات نشر إصلاحات التوقيت

## المشكلة المُكتشفة
- الخادم الخلفي منشور على **Koyeb** وليس Vercel
- الخادم الحالي يستخدم UTC بدلاً من التوقيت المصري
- التحديثات الجديدة لإصلاح التوقيت غير منشورة بعد

## التحقق من المشكلة
```bash
# الخادم المحلي (يعمل بشكل صحيح)
curl http://localhost:5000/api/debug/time-debug

# خادم الإنتاج (يحتاج التحديثات)
curl https://spectacular-mouse-pizaahome-ee337475.koyeb.app/api/health
# النتيجة: {"status":"ok","time":"2025-09-05T07:46:23.944Z"} (UTC)
```

## خطوات النشر المطلوبة

### 1. نشر التحديثات إلى Koyeb
يجب نشر الملفات المُحدثة التالية إلى Koyeb:

#### الملفات الجديدة:
- `backend/src/utils/dateHelpers.js`
- `backend/src/routes/debugRoutes.js`
- `backend/vercel.json` (قد يحتاج تعديل لـ Koyeb)

#### الملفات المُحدثة:
- `backend/src/server.js` (إضافة إعداد المنطقة الزمنية)
- `backend/src/models/Order.js` (إصلاح التوقيت)
- `backend/src/controllers/orderController.js` (إصلاح التوقيت)
- `backend/src/app.js` (إضافة debug routes)

### 2. إعداد متغيرات البيئة في Koyeb
```bash
TZ=Africa/Cairo
NODE_ENV=production
MONGODB_URI=<your_mongodb_uri>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_key>
CLOUDINARY_API_SECRET=<your_cloudinary_secret>
```

### 3. التحقق بعد النشر
```bash
# يجب أن يعمل بعد النشر
curl https://spectacular-mouse-pizaahome-ee337475.koyeb.app/api/debug/time-debug

# النتيجة المتوقعة:
{
  "serverInfo": {
    "environment": "production",
    "timezone": "Africa/Cairo",
    "platform": "linux",
    "nodeVersion": "v18.x.x"
  },
  "timestamps": {
    "serverTime": {
      "iso": "2025-09-05T09:46:23.944Z",
      "formatted": "٥ سبتمبر ٢٠٢٥ في ١١:٤٦ ص"
    }
  }
}
```

## النتائج المتوقعة بعد النشر
- ✅ الطلبات الجديدة ستُنشأ بالتوقيت المصري الصحيح
- ✅ لن تظهر طلبات بتواريخ مستقبلية
- ✅ اتساق التوقيت بين بيئة التطوير والإنتاج
- ✅ إمكانية مراقبة التوقيت عبر endpoint التشخيص

## ملاحظات مهمة
1. **Koyeb** قد يحتاج إعدادات مختلفة عن Vercel
2. تأكد من إعداد `TZ=Africa/Cairo` في متغيرات البيئة
3. قد تحتاج إعادة تشغيل الخدمة بعد النشر
4. راقب السجلات للتأكد من عمل الإصلاحات

## أوامر Git للنشر (إذا كان Koyeb مُتصل بـ GitHub)
```bash
git add .
git commit -m "Fix timezone issues for production orders"
git push origin main
```

بعد ذلك، Koyeb سيقوم بإعادة النشر تلقائياً.
