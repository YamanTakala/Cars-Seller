# نشر منصة السيارات على Render

## الخطوات المطلوبة للنشر

### 1. إعداد قاعدة البيانات السحابية (MongoDB Atlas)

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/atlas)
2. أنشئ حساب جديد أو سجل الدخول
3. أنشئ cluster جديد (اختر المجاني M0)
4. أنشئ مستخدم جديد لقاعدة البيانات
5. أضف IP Address الخاص بك (أو 0.0.0.0/0 للوصول من أي مكان)
6. احصل على Connection String من صفحة Connect

### 2. إعداد مستودع GitHub

1. أنشئ مستودع جديد على GitHub
2. ارفع جميع ملفات المشروع عدا مجلد `node_modules` و ملف `.env`
3. تأكد من وجود ملف `.gitignore` يحتوي على:

```
node_modules/
.env
.DS_Store
*.log
```

### 3. إعداد Render

1. اذهب إلى [Render.com](https://render.com)
2. أنشئ حساب جديد أو سجل الدخول
3. اضغط على "New" واختر "Web Service"
4. اربط حساب GitHub واختر المستودع
5. اختر الإعدادات التالية:
   - **Name**: car-marketplace
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 4. إعداد متغيرات البيئة في Render

أضف المتغيرات التالية في Render Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-marketplace
SESSION_SECRET=your-super-secret-session-key-for-production
NODE_ENV=production

# إعدادات Cloudinary للصور (مطلوبة!)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```

**مهم**: إعداد Cloudinary ضروري لعمل الصور على Render. راجع ملف `CLOUDINARY_SETUP.md` للتفاصيل.

### 5. النشر

1. اضغط على "Create Web Service"
2. انتظر حتى ينتهي النشر (قد يستغرق بضع دقائق)
3. ستحصل على رابط مجاني مثل: `https://car-marketplace.onrender.com`

## ملاحظات مهمة

- **المجال المجاني**: Render يوفر نطاق فرعي مجاني
- **وقت التوقف**: الخدمة المجانية قد تتوقف بعد فترة عدم نشاط
- **قاعدة البيانات**: استخدم MongoDB Atlas للحصول على قاعدة بيانات سحابية مجانية
- **الصور**: سيتم حفظها في مجلد `/public/uploads/` على الخادم

## نصائح للأداء

1. ضغط الصور قبل الرفع
2. استخدام CDN للصور (مثل Cloudinary)
3. إضافة فهارس لقاعدة البيانات
4. تحسين استعلامات MongoDB

## مراقبة الأداء

- استخدم Render Logs لمراقبة الأخطاء
- تفعيل التنبيهات للحصول على إشعارات عند حدوث مشاكل
- مراجعة استخدام الموارد بانتظام
