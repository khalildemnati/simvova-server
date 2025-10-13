import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import mongoose from "mongoose";
import connectDB from "./config/mongo.js";
import servicesRouter from "./routes/services.js";
import authRouter from "./routes/auth.js"; // ✅ تمت الإضافة

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// ✅ فحص السيرفر
app.get("/", (req, res) => {
  res.json({ ok: true, name: "SimVova API", status: "running" });
});

// ✅ اختبار IP
app.get("/test/ip", (req, res) => {
  res.json({ ip: req.clientIp });
});

// ✅ اختبار قاعدة البيانات
app.get("/test/mongo", async (req, res) => {
  try {
    const connected = mongoose.connection.readyState === 1;
    res.json({ connected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ربط المسارات
app.use("/auth", authRouter); // ✅ الآن /auth/login و /auth/register يعملان
app.use("/services", servicesRouter);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT} وMongoDB متصل`)
  );
});
