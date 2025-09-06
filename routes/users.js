const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Car = require('../models/Car');
const router = express.Router();

// صفحة تسجيل الدخول
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('users/login', {
    title: 'تسجيل الدخول'
  });
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return res.redirect('/users/login');
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return res.redirect('/users/login');
    }

    // حفظ بيانات المستخدم في الجلسة
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    req.flash('success', `مرحباً بك ${user.firstName} ${user.lastName}`);
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'حدث خطأ أثناء تسجيل الدخول');
    res.redirect('/users/login');
  }
});

// صفحة التسجيل
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('users/register', {
    title: 'إنشاء حساب جديد'
  });
});

// إنشاء حساب جديد
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone, city, country } = req.body;

    // التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
      req.flash('error', 'كلمات المرور غير متطابقة');
      return res.redirect('/users/register');
    }

    // التحقق من وجود المستخدم مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'البريد الإلكتروني مُستخدم مسبقاً');
      return res.redirect('/users/register');
    }

    // تشفير كلمة المرور
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // إنشاء المستخدم الجديد
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      location: {
        city,
        country
      }
    });

    await newUser.save();

    // تسجيل الدخول تلقائياً
    req.session.user = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email
    };

    req.flash('success', 'تم إنشاء الحساب بنجاح، مرحباً بك!');
    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'حدث خطأ أثناء إنشاء الحساب');
    res.redirect('/users/register');
  }
});

// تسجيل الخروج
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      req.flash('error', 'حدث خطأ أثناء تسجيل الخروج');
    } else {
      req.flash('success', 'تم تسجيل الخروج بنجاح');
    }
    res.redirect('/');
  });
});

// صفحة الملف الشخصي
router.get('/profile', async (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'يجب تسجيل الدخول أولاً');
    return res.redirect('/users/login');
  }

  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      req.flash('error', 'المستخدم غير موجود');
      return res.redirect('/users/login');
    }

    // احضار سيارات المستخدم
    const userCars = await Car.find({ seller: user._id })
      .sort({ createdAt: -1 });

    res.render('users/profile', {
      title: 'الملف الشخصي',
      user,
      userCars
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', {
      title: 'خطأ في تحميل الملف الشخصي',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// صفحة تعديل الملف الشخصي
router.get('/profile/edit', async (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'يجب تسجيل الدخول أولاً');
    return res.redirect('/users/login');
  }

  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      req.flash('error', 'المستخدم غير موجود');
      return res.redirect('/users/login');
    }

    res.render('users/edit-profile', {
      title: 'تعديل الملف الشخصي',
      user
    });
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).render('error', {
      title: 'خطأ في تحميل صفحة التعديل',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// تحديث الملف الشخصي
router.put('/profile', async (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'يجب تسجيل الدخول أولاً');
    return res.redirect('/users/login');
  }

  try {
    const { firstName, lastName, phone, whatsapp, city, country } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      {
        firstName,
        lastName,
        phone,
        whatsapp,
        location: {
          city,
          country
        }
      },
      { new: true }
    );

    // تحديث بيانات الجلسة
    req.session.user.firstName = updatedUser.firstName;
    req.session.user.lastName = updatedUser.lastName;

    req.flash('success', 'تم تحديث الملف الشخصي بنجاح');
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Update profile error:', error);
    req.flash('error', 'حدث خطأ أثناء تحديث الملف الشخصي');
    res.redirect('/users/profile/edit');
  }
});

// عرض ملف مستخدم آخر
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).render('404', {
        title: 'المستخدم غير موجود'
      });
    }

    // احضار سيارات المستخدم المتاحة
    const userCars = await Car.find({ 
      seller: user._id, 
      status: 'متاح' 
    }).sort({ createdAt: -1 });

    res.render('users/show', {
      title: `ملف ${user.name}`,
      profileUser: user,
      userCars
    });
  } catch (error) {
    console.error('Show user error:', error);
    res.status(500).render('error', {
      title: 'خطأ في تحميل ملف المستخدم',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;
