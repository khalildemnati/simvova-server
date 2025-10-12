// استيراد المكتبات الضرورية
const express = require('express');
const axios = require('axios');
const cors = require('cors');
// لا نحتاج إلى dotenv هنا لأن Render يتولى تحميل متغيرات البيئة تلقائيًا
// لكن تركه في package.json لا يضر إذا أردت الاختبار محليًا

const app = express();
const port = process.env.PORT || 3000; // Render سيستخدم متغير PORT الخاص به

// قراءة مفتاح API من متغيرات البيئة في Render
const API_KEY = process.env.FIVE_SIM_API_KEY; 

// يجب أن تكون قيمة الزيادة 2.0 (أي ضرب السعر الأساسي في 3 لزيادة 200%)
// السعر النهائي = السعر الأساسي * (1 + نسبة الزيادة) => السعر الأساسي * 3
const MARKUP_FACTOR = 3.0; 

// Middleware
app.use(cors()); // السماح بالوصول من تطبيقك (مفيد لتطبيقات الويب والجوال)
app.use(express.json()); // تحليل (Parse) JSON في الطلبات

// التحقق من مفتاح API عند بدء التشغيل
if (!API_KEY) {
    console.error("FIVE_SIM_API_KEY is not set. Check your Render Environment Variables.");
    process.exit(1); // إيقاف الخادم إذا لم يتم العثور على المفتاح
}

// الرابط الأساسي لـ 5sim API
const FIVE_SIM_BASE_URL = 'https://api.5sim.net/v1/user/';

// دالة مساعدة لإنشاء رأس (Header) التفويض
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/json'
});

// ----------------------------------------------------------------------
// نقطة النهاية 1: جلب الخدمات والأسعار مع تطبيق الزيادة (200%)
// مثال: GET /api/prices
// ----------------------------------------------------------------------
app.get('/api/prices', async (req, res) => {
    try {
        // الاتصال بـ 5sim لجلب الأسعار الأصلية
        const response = await axios.get(`${FIVE_SIM_BASE_URL}prices`, {
            headers: getAuthHeaders()
        });

        const originalPrices = response.data;
        const markedUpPrices = {};

        // تطبيق منطق الزيادة 200% على جميع الأسعار
        for (const country in originalPrices) {
            markedUpPrices[country] = {};
            for (const service in originalPrices[country]) {
                const priceData = originalPrices[country][service];
                // تطبيق الزيادة على سعر الشراء
                const newPrice = priceData.Cost * MARKUP_FACTOR;
                
                markedUpPrices[country][service] = {
                    ...priceData,
                    // إرجاع السعر النهائي الذي سيراه المستخدم في تطبيقك
                    FinalPrice: newPrice.toFixed(2), 
                    // يمكنك أيضاً إرجاع السعر الأصلي لغرض التحقق الداخلي
                    OriginalPrice: priceData.Cost 
                };
            }
        }

        res.json(markedUpPrices);
    } catch (error) {
        console.error("Error fetching or marking up prices:", error.message);
        // إرجاع رسالة خطأ قياسية للمستخدم
        res.status(500).json({ 
            error: 'Failed to fetch prices from 5sim.net', 
            details: error.response?.data || 'Server error' 
        });
    }
});

// ----------------------------------------------------------------------
// نقطة النهاية 2: طلب رقم جديد
// مثال: POST /api/buy_number
// الجسم المتوقع: { country: 'russia', service: 'telegram' }
// ----------------------------------------------------------------------
app.post('/api/buy_number', async (req, res) => {
    // ملاحظة: يُفترض أن تطبيقك قد قام بالفعل بتحصيل الدفع من المستخدم في هذه المرحلة.
    const { country, service } = req.body;

    if (!country || !service) {
        return res.status(400).json({ error: 'Missing country or service in request.' });
    }

    try {
        // الاتصال بـ 5sim لطلب شراء رقم (يتم خصم المبلغ الأساسي من رصيدك في 5sim)
        const response = await axios.get(
            `${FIVE_SIM_BASE_URL}buy/activation/${country}/${service}`, 
            { headers: getAuthHeaders() }
        );

        // إرجاع بيانات الطلب بالكامل إلى تطبيقك (بما في ذلك id ورقم الهاتف)
        res.json(response.data); 

    } catch (error) {
        console.error(`Error buying number for ${service} in ${country}:`, error.message);
        // إرجاع رسالة خطأ واضحة في حال فشل الشراء (مثلاً، عدم وجود رصيد كافٍ في 5sim)
        res.status(500).json({ 
            error: 'Failed to purchase number from 5sim.net. Check 5sim balance/API key.', 
            details: error.response?.data || 'Server error' 
        });
    }
});


// ----------------------------------------------------------------------
// نقطة النهاية 3: جلب حالة الطلب (الحصول على الكود)
// مثال: GET /api/check_status/:id
// ----------------------------------------------------------------------
app.get('/api/check_status/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        // الاتصال بـ 5sim للتحقق من حالة الطلب
        const response = await axios.get(
            `${FIVE_SIM_BASE_URL}check/${orderId}`, 
            { headers: getAuthHeaders() }
        );

        // إرجاع حالة الطلب (التي قد تحتوي على كود التفعيل 'sms')
        res.json(response.data);
    } catch (error) {
        console.error(`Error checking status for order ${orderId}:`, error.message);
        res.status(500).json({ 
            error: 'Failed to check order status on 5sim.net', 
            details: error.response?.data || 'Server error' 
        });
    }
});


// ----------------------------------------------------------------------
// نقطة النهاية 4: جلب الرصيد الحالي لحسابك في 5sim (لإظهاره داخليًا في التطبيق)
// مثال: GET /api/balance
// ----------------------------------------------------------------------
app.get('/api/balance', async (req, res) => {
    try {
        const response = await axios.get(
            `${FIVE_SIM_BASE_URL}profile`, 
            { headers: getAuthHeaders() }
        );

        // إرجاع الرصيد فقط (الذي سيخصم منه سعر 5sim الأساسي)
        res.json({ balance: response.data.balance });
    } catch (error) {
        console.error("Error fetching balance:", error.message);
        res.status(500).json({ error: 'Failed to fetch 5sim balance' });
    }
});


// بدء تشغيل الخادم
app.listen(port, () => {
    console.log(`5sim Reseller Proxy running on port ${port}`);
});
