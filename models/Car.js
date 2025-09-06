const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان الإعلان مطلوب'],
    trim: true,
    maxlength: [100, 'العنوان يجب أن يكون أقل من 100 حرف']
  },
  description: {
    type: String,
    required: [true, 'وصف السيارة مطلوب'],
    maxlength: [1000, 'الوصف يجب أن يكون أقل من 1000 حرف']
  },
  brand: {
    type: String,
    required: [true, 'ماركة السيارة مطلوبة'],
    enum: ['تويوتا', 'هوندا', 'نيسان', 'هيونداي', 'كيا', 'مرسيدس', 'BMW', 'أودي', 'فولكس واجن', 'فورد', 'شيفروليه', 'مازدا', 'ميتسوبيشي', 'سوزوكي', 'أخرى']
  },
  model: {
    type: String,
    required: [true, 'موديل السيارة مطلوب'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'سنة الصنع مطلوبة'],
    min: [1990, 'سنة الصنع يجب أن تكون 1990 أو أحدث'],
    max: [new Date().getFullYear() + 1, 'سنة الصنع غير صحيحة']
  },
  mileage: {
    type: Number,
    required: [true, 'المسافة المقطوعة مطلوبة'],
    min: [0, 'المسافة المقطوعة لا يمكن أن تكون سالبة']
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: [0, 'السعر لا يمكن أن يكون سالباً']
  },
  currency: {
    type: String,
    default: 'ريال سعودي',
    enum: ['ريال سعودي', 'درهم إماراتي', 'دينار كويتي', 'دولار أمريكي', 'يورو']
  },
  condition: {
    type: String,
    required: [true, 'حالة السيارة مطلوبة'],
    enum: ['جديدة', 'مستعملة - ممتازة', 'مستعملة - جيدة جداً', 'مستعملة - جيدة', 'مستعملة - متوسطة']
  },
  transmission: {
    type: String,
    required: [true, 'نوع ناقل الحركة مطلوب'],
    enum: ['أوتوماتيك', 'مانوال', 'CVT']
  },
  fuelType: {
    type: String,
    required: [true, 'نوع الوقود مطلوب'],
    enum: ['بنزين', 'ديزل', 'هايبرد', 'كهربائي']
  },
  engineSize: {
    type: String,
    required: [true, 'حجم المحرك مطلوب']
  },
  color: {
    type: String,
    required: [true, 'لون السيارة مطلوب']
  },
  location: {
    city: {
      type: String,
      required: [true, 'المدينة مطلوبة']
    },
    district: {
      type: String,
      required: [true, 'الحي مطلوب']
    },
    country: {
      type: String,
      required: [true, 'البلد مطلوب']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  features: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'متاح',
    enum: ['متاح', 'محجوز', 'مباع', 'مخفي']
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// فهارس لتحسين الأداء
carSchema.index({ brand: 1, model: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: -1 });
carSchema.index({ 'location.city': 1 });
carSchema.index({ seller: 1 });
carSchema.index({ status: 1 });
carSchema.index({ createdAt: -1 });

// Middleware لتحديث updatedAt
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Car', carSchema);
