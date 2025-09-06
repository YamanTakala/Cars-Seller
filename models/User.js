const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم يجب أن يكون أقل من 50 حرف']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف']
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true
  },
  location: {
    city: {
      type: String,
      required: [true, 'المدينة مطلوبة']
    },
    country: {
      type: String,
      required: [true, 'البلد مطلوب']
    }
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// فهرسة البريد الإلكتروني
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
