// اختبار بسيط للاتصال
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('الاتصال بـ MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB متصل بنجاح');
        
        // اختبار العثور على مستخدمين
        const User = require('./models/User');
        const users = await User.find().limit(5);
        console.log(`✅ عدد المستخدمين في قاعدة البيانات: ${users.length}`);
        
        if (users.length > 0) {
            console.log('أول مستخدم:', users[0].firstName, users[0].lastName);
        }
        
        // اختبار العثور على سيارات
        const Car = require('./models/Car');
        const cars = await Car.find().limit(5);
        console.log(`✅ عدد السيارات في قاعدة البيانات: ${cars.length}`);
        
        await mongoose.disconnect();
        console.log('✅ تم قطع الاتصال');
        
    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
}

testConnection();
