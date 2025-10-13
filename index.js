// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import mongoose from "mongoose";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// ✅ اتصال بقاعدة بيانات MongoDB
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log("⚠️ لا يوجد MONGO_URI في البيئة (Render)");
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح");
  } catch (err) {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", err.message);
  }
}

// ✅ الصفحة الرئيسية
app.get("/", (req, res) => {
  res.json({ ok: true, name: "SimVova API", status: "running" });
});

// ✅ اختبار عنوان IP
app.get("/test/ip", (req, res) => {
  res.json({ ip: req.clientIp });
});

// ✅ اختبار MongoDB
app.get("/test/mongo", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const connected = state === 1;
    res.json({
      connected,
      message: connected
        ? "✅ MongoDB متصل بنجاح"
        : "❌ MongoDB غير متصل حالياً",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ API لجلب الخدمات من 5SIM مع ربح 200٪
app.get("/services", async (req, res) => {
  const API_KEY = process.env.FIVESIM_API_KEY;
  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "FIVESIM_API_KEY غير موجود في ملف البيئة" });
  }

  try {
    const response = await axios.get("https://5sim.net/v1/guest/products", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    // معالجة البيانات + إضافة 200٪ ربح
    const data = response.data;
    const result = {};

    for (const country in data) {
      result[country] = {};
      for (const operator in data[country]) {
        result[country][operator] = Object.entries(data[country][operator]).map(
          ([service, details]) => ({
            service,
            originalPrice: details.cost,
            priceWithProfit: (details.cost * 3).toFixed(2), // +200%
            count: details.qty,
          })
        );
      }
    }

    res.json(result);
  } catch (err) {
    console.error("❌ خطأ في جلب البيانات من 5SIM:", err.message);
    res.status(500).json({
      error: "فشل في الاتصال بـ 5SIM API",
      details: err.message,
    });
  }
});

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT} وMongoDB متصل`)
  );
});
