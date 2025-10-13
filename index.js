// ✅ index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import mongoose from "mongoose";
import connectDB from "./config/mongo.js";
import servicesRouter from "./routes/services.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// ✅ الصفحة الرئيسية (اختبار السيرفر)
app.get("/", (req, res) => {
  res.json({ ok: true, name: "SimVova API", status: "running" });
});

// ✅ اختبار IP
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

// ✅ ربط الراوتر الخاص بالخدمات (5SIM)
app.use("/services", servicesRouter);

// ✅ تشغيل السيرفر بعد الاتصال بقاعدة البيانات
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 السيرفر يعمل على المنفذ ${PORT} وMongoDB متصل`);
    });
  })
  .catch((err) => {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", err.message);
    process.exit(1);
  });
