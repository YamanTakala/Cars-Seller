# إعداد Cloudinary للصور

## 1. إنشاء حساب Cloudinary

1. اذهب إلى [Cloudinary](https://cloudinary.com)
2. أنشئ حساب مجاني
3. احصل على:
   - Cloud Name
   - API Key  
   - API Secret

## 2. إعداد متغيرات البيئة على Render

في dashboard الـ Render، أضف هذه المتغيرات:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 3. فوائد Cloudinary

- ✅ الصور محفوظة بشكل دائم
- ✅ تحسين تلقائي للصور
- ✅ CDN سريع
- ✅ يعمل على Render بدون مشاكل

## 4. البيئة المحلية

- بدون Cloudinary: الصور تُحفظ في `public/uploads/cars/`
- مع Cloudinary: الصور تُرفع للسحابة

## 5. كيفية الحصول على بيانات Cloudinary

1. سجل دخول إلى [Cloudinary Console](https://console.cloudinary.com)
2. في الـ Dashboard ستجد:
   - **Cloud name**: اسم السحابة الخاص بك
   - **API Key**: مفتاح API
   - **API Secret**: المفتاح السري (اضغط على العين لإظهاره)

## 6. إضافة المتغيرات في Render

1. اذهب إلى Render Dashboard
2. اختر الـ service الخاص بك
3. اذهب إلى Environment
4. أضف المتغيرات الثلاثة
5. احفظ واعد deploy

بعد هذا ستعمل الصور على Render بشكل طبيعي! 🎉
