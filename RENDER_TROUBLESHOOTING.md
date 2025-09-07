# حل مشكلة Bad Gateway في Render

## الأسباب المحتملة:

### 1. **متغيرات البيئة**
تأكد من إعداد المتغيرات التالية في Render Dashboard:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-marketplace
SESSION_SECRET=your-secret-key-here
NODE_ENV=production
```

### 2. **إعدادات الخدمة**
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 16.x أو أحدث

### 3. **فحص الصحة**
الخدمة تحتوي على endpoint للفحص:
```
GET /health
```

### 4. **إعدادات البورت**
التطبيق يستخدم `process.env.PORT` تلقائياً.

## خطوات الإصلاح:

### الخطوة 1: إعداد متغيرات البيئة
1. انتقل إلى Render Dashboard
2. اختر خدمتك
3. انتقل إلى **Environment**
4. أضف المتغيرات المطلوبة

### الخطوة 2: إعادة النشر
1. انتقل إلى **Manual Deploy**
2. اضغط **Deploy latest commit**

### الخطوة 3: فحص السجلات
1. انتقل إلى **Logs**
2. ابحث عن رسائل الخطأ

### الخطوة 4: اختبار محلي
```bash
# تشغيل محلي
npm start

# اختبار health check
curl http://localhost:3000/health
```

## رسائل خطأ شائعة:

### "Connection refused"
- تحقق من MONGODB_URI
- تأكد من أن قاعدة البيانات متاحة

### "Port already in use"
- Render يحدد البورت تلقائياً
- تأكد من استخدام `process.env.PORT`

### "Module not found"
- تحقق من package.json
- تأكد من تشغيل `npm install`

## اتصل بالدعم:
إذا استمرت المشكلة، تحقق من:
1. Render Status Page
2. MongoDB Atlas Status
3. سجلات الخادم في Render Dashboard
