const express = require('express');
const Car = require('../models/Car');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinaryConfig = require('../config/cloudinary');
const router = express.Router();

// إنشاء مجلد uploads للبيئة المحلية فقط
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'cars');
if (!cloudinaryConfig.isConfigured && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// إعدادات multer - تلقائياً يختار Cloudinary أو Local storage
let storage;

if (cloudinaryConfig.isConfigured) {
  // استخدام Cloudinary في الإنتاج
  storage = cloudinaryConfig.storage;
  console.log('Using Cloudinary storage for images');
} else {
  // استخدام التخزين المحلي في التطوير
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  console.log('Using local storage for images');
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بالصور (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// Middleware للتحقق من تسجيل الدخول
const requireAuth = (req, res, next) => {
  console.log('RequireAuth middleware - Session:', req.session);
  console.log('RequireAuth middleware - User:', req.session?.user);
  
  if (!req.session || !req.session.user) {
    console.log('Authentication failed - redirecting to login');
    if (req.flash) {
      req.flash('error', 'يجب تسجيل الدخول أولاً');
    }
    return res.status(401).redirect('/users/login');
  }
  console.log('Authentication successful');
  next();
};

// معالج أخطاء multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.flash('error', 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      req.flash('error', 'عدد كبير من الملفات. الحد الأقصى 10 صور');
    } else {
      req.flash('error', 'خطأ في رفع الملف');
    }
    return res.redirect('/cars/new/add');
  } else if (err) {
    req.flash('error', err.message);
    return res.redirect('/cars/new/add');
  }
  next();
};

// عرض جميع السيارات
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const cars = await Car.find({ status: 'متاح' })
      .populate('seller', 'name phone location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCars = await Car.countDocuments({ status: 'متاح' });
    const totalPages = Math.ceil(totalCars / limit);

    res.render('cars/index', {
      title: 'جميع السيارات',
      cars,
      currentPage: page,
      totalPages,
      totalCars
    });
  } catch (error) {
    console.error('Error loading cars:', error);
    res.status(500).render('error', {
      title: 'خطأ في تحميل السيارات',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// عرض تفاصيل سيارة محددة
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('seller', 'name email phone location joinDate');

    if (!car) {
      return res.status(404).render('404', {
        title: 'السيارة غير موجودة'
      });
    }

    // زيادة عدد المشاهدات
    await Car.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // احضار سيارات مشابهة
    const similarCars = await Car.find({
      _id: { $ne: car._id },
      brand: car.brand,
      status: 'متاح'
    })
      .populate('seller', 'name phone')
      .limit(4);

    res.render('cars/show', {
      title: car.title,
      car,
      similarCars
    });
  } catch (error) {
    console.error('Error loading car details:', error);
    res.status(500).render('error', {
      title: 'خطأ في تحميل تفاصيل السيارة',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// صفحة إضافة سيارة جديدة
router.get('/new/add', requireAuth, (req, res) => {
  res.render('cars/new', {
    title: 'إضافة سيارة جديدة'
  });
});

// إضافة سيارة جديدة
router.post('/new', requireAuth, upload.array('images', 10), handleUploadError, async (req, res) => {
  try {
    console.log('POST /cars/new - Starting car creation');
    console.log('User from session:', req.session.user);
    console.log('Request body:', req.body);
    console.log('Files uploaded:', req.files);

    const {
      title, description, brand, model, year, mileage, price, currency,
      condition, transmission, fuelType, engineSize, color,
      city, district, country, features
    } = req.body;

    console.log('Files uploaded:', req.files); // للتشخيص

    // التحقق من الصور
    if (!req.files || req.files.length === 0) {
      req.flash('error', 'يجب رفع صورة واحدة على الأقل');
      return res.redirect('/cars/new/add');
    }

    // تحضير بيانات الصور حسب نوع التخزين
    const images = req.files.map(file => {
      if (cloudinaryConfig.isConfigured) {
        // Cloudinary storage
        return {
          url: file.path, // Cloudinary يرجع الـ URL مباشرة
          publicId: file.filename,
          originalName: file.originalname
        };
      } else {
        // Local storage
        const imagePath = `/uploads/cars/${file.filename}`;
        console.log('Image path:', imagePath); // للتشخيص
        
        // التحقق من وجود الملف في البيئة المحلية
        const fullPath = path.join(__dirname, '..', 'public', imagePath);
        if (!fs.existsSync(fullPath)) {
          console.error('File not found:', fullPath);
        }
        
        return {
          url: imagePath,
          publicId: file.filename,
          originalName: file.originalname
        };
      }
    });

    console.log('Processed images:', images); // للتشخيص

    // تحضير المميزات
    let carFeatures = [];
    if (features) {
      carFeatures = Array.isArray(features) ? features : [features];
    }

    const newCar = new Car({
      title,
      description,
      brand,
      model,
      year: parseInt(year),
      mileage: parseInt(mileage),
      price: parseFloat(price),
      currency,
      condition,
      transmission,
      fuelType,
      engineSize,
      color,
      location: {
        city,
        district,
        country
      },
      images,
      features: carFeatures,
      seller: req.session.user._id
    });

    console.log('🚗 Attempting to save car to database...');
    console.log('Car object:', JSON.stringify(newCar, null, 2));
    
    // التحقق من validation قبل الحفظ
    const validationError = newCar.validateSync();
    if (validationError) {
      console.error('❌ Validation error:', validationError);
      req.flash('error', 'خطأ في البيانات: ' + Object.values(validationError.errors).map(e => e.message).join(', '));
      return res.redirect('/cars/new/add');
    }
    
    try {
      const savedCar = await newCar.save();
      console.log('✅ Car saved successfully with ID:', savedCar._id);
      req.flash('success', 'تم إضافة السيارة بنجاح');
      res.redirect(`/cars/${savedCar._id}`);
    } catch (saveError) {
      console.error('❌ Error saving car to database:', saveError);
      req.flash('error', 'خطأ في حفظ السيارة: ' + saveError.message);
      return res.redirect('/cars/new/add');
    }
  } catch (error) {
    console.error('Error adding car:', error);
    req.flash('error', 'حدث خطأ أثناء إضافة السيارة');
    res.redirect('/cars/new/add');
  }
});

// صفحة تعديل السيارة
router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).render('404', {
        title: 'السيارة غير موجودة'
      });
    }

    // التحقق من أن المستخدم هو صاحب السيارة
    if (car.seller.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'غير مسموح لك بتعديل هذه السيارة');
      return res.redirect(`/cars/${car._id}`);
    }

    res.render('cars/edit', {
      title: 'تعديل السيارة',
      car
    });
  } catch (error) {
    console.error('Error loading edit page:', error);
    res.status(500).render('error', {
      title: 'خطأ في تحميل صفحة التعديل',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// تحديث السيارة
router.put('/:id', requireAuth, upload.array('newImages', 10), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).render('404', {
        title: 'السيارة غير موجودة'
      });
    }

    // التحقق من أن المستخدم هو صاحب السيارة
    if (car.seller.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'غير مسموح لك بتعديل هذه السيارة');
      return res.redirect(`/cars/${car._id}`);
    }

    const {
      title, description, brand, model, year, mileage, price, currency,
      condition, transmission, fuelType, engineSize, color,
      city, district, country, features
    } = req.body;

    // تحضير الصور الجديدة إذا تم رفعها
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => ({
        url: `/uploads/cars/${file.filename}`,
        publicId: file.filename
      }));
    }

    // تحضير المميزات
    let carFeatures = [];
    if (features) {
      carFeatures = Array.isArray(features) ? features : [features];
    }

    // تحديث البيانات
    const updateData = {
      title,
      description,
      brand,
      model,
      year: parseInt(year),
      mileage: parseInt(mileage),
      price: parseFloat(price),
      currency,
      condition,
      transmission,
      fuelType,
      engineSize,
      color,
      location: {
        city,
        district,
        country
      },
      features: carFeatures
    };

    // إضافة الصور الجديدة إذا وجدت
    if (newImages.length > 0) {
      updateData.images = [...car.images, ...newImages];
    }

    await Car.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'تم تحديث السيارة بنجاح');
    res.redirect(`/cars/${req.params.id}`);
  } catch (error) {
    console.error('Error updating car:', error);
    req.flash('error', 'حدث خطأ أثناء تحديث السيارة');
    res.redirect(`/cars/${req.params.id}/edit`);
  }
});

// حذف السيارة
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ error: 'السيارة غير موجودة' });
    }

    // التحقق من أن المستخدم هو صاحب السيارة
    if (car.seller.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ error: 'غير مسموح لك بحذف هذه السيارة' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'تم حذف السيارة بنجاح' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف السيارة' });
  }
});

module.exports = router;
