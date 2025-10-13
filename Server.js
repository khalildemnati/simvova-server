import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ 5SIM API Key
const API_KEY = process.env.FIVESIM_API_KEY;

// ✅ دالة تحويل من روبل روسي إلى دولار (تقريبًا)
function rubToUSD(rub) {
  const rate = 0.011; // 1 RUB ≈ 0.011 USD
  return rub * rate;
}

// ✅ الصفحة الرئيسية
app.get("/", (req, res) => {
  res.json({ ok: true, message: "SimVova API is running 🚀" });
});

// ✅ countries route
app.get("/countries", async (req, res) => {
  try {
    const { data } = await axios.get("https://5sim.net/v1/guest/countries", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/json",
      },
    });
    res.json(data);
  } catch (err) {
    console.error("5SIM countries error:", err.response?.data || err.message);
    res.status(502).json({ error: "Failed to fetch countries from 5SIM" });
  }
});

// ✅ services route (مع مضاعفة الأسعار 200%)
app.get("/services", async (req, res) => {
  try {
    const { data } = await axios.get("https://5sim.net/v1/guest/services", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/json",
      },
    });

    const updated = {};

    // تحويل الأسعار وضربها ×2 ثم تحويلها إلى USD
    for (const [country, services] of Object.entries(data)) {
      updated[country] = {};
      for (const [service, price] of Object.entries(services)) {
        const priceUSD = rubToUSD(price) * 2; // تحويل + ربح 200%
        updated[country][service] = Number(priceUSD.toFixed(3));
      }
    }

    res.json(updated);
  } catch (err) {
    console.error("5SIM services error:", err.response?.data || err.message);
    res.status(502).json({ error: "Failed to fetch services from 5SIM" });
  }
});

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
