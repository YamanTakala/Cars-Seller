// اختبار الاتصال بقاعدة البيانات والجلسات
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

async function testDatabaseConnection() {
    try {
        console.log('🔄 اختبار الاتصال بـ MongoDB...');
        
        // الاتصال بقاعدة البيانات
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ نجح الاتصال بـ MongoDB');
        
        // اختبار العمليات الأساسية
        console.log('🔄 اختبار العمليات الأساسية...');
        
        // إنشاء schema اختبار
        const TestSchema = new mongoose.Schema({
            name: String,
            timestamp: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', TestSchema);
        
        // إنشاء document جديد
        const testDoc = new TestModel({ name: 'اختبار الاتصال' });
        await testDoc.save();
        console.log('✅ تم حفظ document جديد');
        
        // قراءة البيانات
        const foundDoc = await TestModel.findById(testDoc._id);
        console.log('✅ تم قراءة البيانات:', foundDoc.name);
        
        // حذف document الاختبار
        await TestModel.findByIdAndDelete(testDoc._id);
        console.log('✅ تم حذف document الاختبار');
        
        // اختبار Sessions Store
        console.log('🔄 اختبار MongoDB Session Store...');
        
        const store = MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            dbName: 'car-marketplace',
            collectionName: 'sessions'
        });
        
        console.log('✅ تم إنشاء Session Store بنجاح');
        
        // اختبار كتابة جلسة
        const sessionData = {
            user: {
                _id: '507f1f77bcf86cd799439011',
                firstName: 'أحمد',
                lastName: 'محمد',
                email: 'test@example.com'
            }
        };
        
        const sessionId = 'test-session-' + Date.now();
        
        await new Promise((resolve, reject) => {
            store.set(sessionId, sessionData, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('✅ تم حفظ الجلسة في MongoDB');
        
        // اختبار قراءة جلسة
        const retrievedSession = await new Promise((resolve, reject) => {
            store.get(sessionId, (err, session) => {
                if (err) reject(err);
                else resolve(session);
            });
        });
        
        console.log('✅ تم استرجاع الجلسة:', retrievedSession.user.firstName);
        
        // حذف الجلسة الاختبارية
        await new Promise((resolve, reject) => {
            store.destroy(sessionId, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('✅ تم حذف الجلسة الاختبارية');
        
        console.log('\n🎉 جميع الاختبارات نجحت! قاعدة البيانات والجلسات تعمل بشكل صحيح.');
        
    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
        console.error('تفاصيل الخطأ:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
        process.exit(0);
    }
}

// تشغيل الاختبار
testDatabaseConnection();
