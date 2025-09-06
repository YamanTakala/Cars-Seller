const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();

// إعدادات الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.log('تحذير: لا توجد قاعدة بيانات متصلة. يرجى إعداد MONGODB_URI في ملف .env');
      console.log('الخادم سيعمل بدون قاعدة بيانات للاختبار فقط.');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('الخادم سيعمل بدون قاعدة بيانات للاختبار فقط.');
  }
};

// الاتصال بقاعدة البيانات
connectDB();

// إعدادات الـ middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// إعدادات الجلسات
app.use(session({
  secret: process.env.SESSION_SECRET || 'car-marketplace-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/car-marketplace'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 ساعة
  }
}));

app.use(flash());

// إعدادات محرك القوالب
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// متغيرات عامة للقوالب
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  next();
});

// استيراد الـ routes
const indexRoutes = require('./routes/index');
const carRoutes = require('./routes/cars');
const userRoutes = require('./routes/users');

// مسار favicon
app.get('/favicon.ico', (req, res) => res.status(204));

// استخدام الـ routes
app.use('/', indexRoutes);
app.use('/cars', carRoutes);
app.use('/users', userRoutes);

// معالجة الأخطاء 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'الصفحة غير موجودة' });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
