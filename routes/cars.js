const express = require('express');
const Car = require('../models/Car');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// إعدادات multer للصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/cars/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
  if (!req.session.user) {
    req.flash('error', 'يجب تسجيل الدخول أولاً');
    return res.redirect('/users/login');
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
router.post('/', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title, description, brand, model, year, mileage, price, currency,
      condition, transmission, fuelType, engineSize, color,
      city, district, country, features
    } = req.body;

    // التحقق من الصور
    if (!req.files || req.files.length === 0) {
      req.flash('error', 'يجب رفع صورة واحدة على الأقل');
      return res.redirect('/cars/new/add');
    }

    // تحضير بيانات الصور
    const images = req.files.map(file => ({
      url: `/uploads/cars/${file.filename}`,
      publicId: file.filename
    }));

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

    await newCar.save();
    req.flash('success', 'تم إضافة السيارة بنجاح');
    res.redirect(`/cars/${newCar._id}`);
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
    req.flash('success', 'تم حذف السيارة بنجاح');
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Error deleting car:', error);
    req.flash('error', 'حدث خطأ أثناء حذف السيارة');
    res.redirect(`/cars/${req.params.id}`);
  }
});

module.exports = router;
