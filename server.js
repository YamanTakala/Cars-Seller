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
    maxAge: 1000 * 60 * 60 * 24, // 24 ساعة
    secure: false, // Set to true if using HTTPS
    httpOnly: true
  }
}));

// Flash messages (يجب أن يكون بعد sessions)
app.use(flash());

// إعدادات محرك القوالب
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// متغيرات عامة للقوالب
app.use((req, res, next) => {
  // التأكد من وجود session
  if (!req.session) {
    console.warn('Session not found in request');
    req.session = {};
  }
  
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash ? req.flash() : {};
  res.locals.currentPath = req.path;
  next();
});

// استيراد الـ routes
const indexRoutes = require('./routes/index');
const carRoutes = require('./routes/cars');
const userRoutes = require('./routes/users');

// مسار favicon
app.get('/favicon.ico', (req, res) => res.status(204));

// Health check endpoint لـ Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// استخدام الـ routes
app.use('/', indexRoutes);
app.use('/cars', carRoutes);
app.use('/users', userRoutes);

// معالجة الأخطاء 404
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'الصفحة غير موجودة',
    user: req.session ? req.session.user : null 
  });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  
  // في بيئة الإنتاج، لا نعرض تفاصيل الأخطاء
  if (process.env.NODE_ENV === 'production') {
    res.status(500).render('error', { 
      title: 'خطأ في الخادم',
      error: { message: 'حدث خطأ غير متوقع' },
      user: req.session ? req.session.user : null
    });
  } else {
    res.status(500).render('error', { 
      title: 'خطأ في الخادم',
      error: err,
      user: req.session ? req.session.user : null
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// معالجة إغلاق العملية بشكل صحيح
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
