const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// إعداد Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('⚠️ Cloudinary not configured - using local storage');
}

// إعداد تخزين Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-marketplace/cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }]
  }
});

module.exports = {
  cloudinary,
  storage,
  isConfigured: !!process.env.CLOUDINARY_CLOUD_NAME
};
