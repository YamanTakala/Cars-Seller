# منصة السيارات - Car Marketplace

منصة إلكترونية شاملة لعرض وبيع السيارات الجديدة والمستعملة، مطورة باستخدام Node.js وMongoDB.

## المميزات

- ✅ عرض السيارات بتفاصيل شاملة
- ✅ نظام تسجيل المستخدمين وتسجيل الدخول
- ✅ إضافة وتعديل إعلانات السيارات
- ✅ البحث المتقدم والفلترة
- ✅ رفع صور متعددة للسيارات
- ✅ صفحات شخصية للمستخدمين
- ✅ تصميم متجاوب يدعم الأجهزة المحمولة
- ✅ واجهة باللغة العربية مع دعم RTL

## التقنيات المستخدمة

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Template Engine**: EJS
- **Styling**: Bootstrap 5 RTL
- **File Upload**: Multer
- **Authentication**: Express Session + bcryptjs
- **Icons**: Font Awesome

## التثبيت والتشغيل

### المتطلبات
- Node.js (الإصدار 14 أو أحدث)
- MongoDB (محلي أو سحابي)

### خطوات التثبيت

1. **استنساخ المشروع**
   ```bash
   git clone <repository-url>
   cd car-marketplace
   ```

2. **تثبيت الحزم**
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة**
   ```bash
   cp .env.example .env
   ```
   
   ثم قم بتحرير ملف `.env` وإضافة:
   ```
   MONGODB_URI=mongodb://localhost:27017/car-marketplace
   SESSION_SECRET=your-secret-key
   PORT=3000
   NODE_ENV=development
   ```

4. **تشغيل المشروع**
   ```bash
   # للتطوير
   npm run dev
   
   # للإنتاج
   npm start
   ```

5. **فتح التطبيق**
   افتح المتصفح وانتقل إلى `http://localhost:3000`

## هيكل المشروع

```
car-marketplace/
├── models/          # نماذج قاعدة البيانات
│   ├── User.js      # نموذج المستخدم
│   └── Car.js       # نموذج السيارة
├── routes/          # مسارات التطبيق
│   ├── index.js     # الصفحة الرئيسية والبحث
│   ├── cars.js      # مسارات السيارات
│   └── users.js     # مسارات المستخدمين
├── views/           # قوالب العرض
│   ├── partials/    # أجزاء القوالب المشتركة
│   ├── cars/        # صفحات السيارات
│   ├── users/       # صفحات المستخدمين
│   └── index.ejs    # الصفحة الرئيسية
├── public/          # الملفات الثابتة
│   ├── uploads/     # الصور المرفوعة
│   └── images/      # الصور الثابتة
├── server.js        # نقطة دخول التطبيق
└── package.json     # إعدادات المشروع
```

## الاستضافة على Render

### خطوات النشر

1. **إنشاء حساب على Render**
   - اذهب إلى [render.com](https://render.com)
   - قم بإنشاء حساب جديد

2. **ربط المشروع بـ GitHub**
   - ارفع المشروع إلى GitHub
   - في Render، اختر "New Web Service"
   - اربط حساب GitHub واختر المستودع

3. **إعداد الخدمة**
   ```
   Name: car-marketplace
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **إعداد متغيرات البيئة**
   أضف المتغيرات التالية في Render:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   SESSION_SECRET=<your-session-secret>
   NODE_ENV=production
   ```

5. **قاعدة البيانات السحابية**
   - قم بإنشاء حساب في [MongoDB Atlas](https://www.mongodb.com/atlas)
   - أنشئ cluster جديد
   - احصل على connection string
   - أضفه كمتغير بيئة في Render

### نصائح للاستضافة

- تأكد من أن جميع المسارات تستخدم متغير `PORT` من البيئة
- استخدم قاعدة بيانات MongoDB سحابية (Atlas)
- قم بضغط الصور قبل الرفع لتوفير مساحة التخزين
- فعّل HTTPS في الإنتاج

## المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch جديد للميزة
3. Commit التغييرات
4. Push إلى Branch
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك اقتراحات، يرجى فتح issue في GitHub.

---

تم تطوير هذا المشروع بـ ❤️ لخدمة المجتمع العربي
