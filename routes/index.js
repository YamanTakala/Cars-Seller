const express = require('express');
const Car = require('../models/Car');
const router = express.Router();

// صفحة التشخيص
router.get('/debug', (req, res) => {
  res.render('debug', {
    title: 'اختبار الجلسات والمصادقة'
  });
});

// الصفحة الرئيسية
router.get('/', async (req, res) => {
  try {
    // احضار آخر السيارات المضافة
    const latestCars = await Car.find({ status: 'متاح' })
      .populate('seller', 'name phone location')
      .sort({ createdAt: -1 })
      .limit(8);

    // احضار السيارات المميزة
    const featuredCars = await Car.find({ 
      status: 'متاح', 
      featured: true 
    })
      .populate('seller', 'name phone location')
      .limit(6);

    // إحصائيات سريعة
    const totalCars = await Car.countDocuments({ status: 'متاح' });
    const totalBrands = await Car.distinct('brand').then(brands => brands.length);

    res.render('index', {
      title: 'منصة السيارات - الصفحة الرئيسية',
      latestCars,
      featuredCars,
      totalCars,
      totalBrands
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.status(500).render('error', {
      title: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// صفحة البحث
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      brand,
      minPrice,
      maxPrice,
      year,
      condition,
      transmission,
      fuelType,
      city,
      page = 1
    } = req.query;

    // بناء استعلام البحث
    let query = { status: 'متاح' };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } }
      ];
    }

    if (brand && brand !== 'الكل') {
      query.brand = brand;
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: parseInt(minPrice) };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: parseInt(maxPrice) };
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (condition && condition !== 'الكل') {
      query.condition = condition;
    }

    if (transmission && transmission !== 'الكل') {
      query.transmission = transmission;
    }

    if (fuelType && fuelType !== 'الكل') {
      query.fuelType = fuelType;
    }

    if (city && city !== 'الكل') {
      query['location.city'] = city;
    }

    // إعدادات الصفحات
    const limit = 12;
    const skip = (page - 1) * limit;

    // تنفيذ البحث
    const cars = await Car.find(query)
      .populate('seller', 'name phone location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCars = await Car.countDocuments(query);
    const totalPages = Math.ceil(totalCars / limit);

    // بيانات للفلاتر
    const brands = await Car.distinct('brand');
    const cities = await Car.distinct('location.city');

    res.render('search', {
      title: 'البحث عن السيارات',
      cars,
      query: req.query,
      currentPage: parseInt(page),
      totalPages,
      totalCars,
      brands,
      cities,
      hasResults: cars.length > 0
    });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).render('error', {
      title: 'خطأ في البحث',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// صفحة حول الموقع
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'حول الموقع'
  });
});

// صفحة الاتصال
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'اتصل بنا'
  });
});

module.exports = router;
