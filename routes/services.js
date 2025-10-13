// routes/services.js
import express from "express";
import axios from "axios";

const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;
const PROFIT_MULTIPLIER = 3; // +200%

// ✅ جلب الخدمات من 5SIM
router.get("/", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing FIVESIM_API_KEY in environment." });
    }

    const response = await axios.get("https://5sim.net/v1/guest/prices?country=any", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    // ✅ تأكيد أن البيانات استلمت بشكل صحيح
    if (!response.data || typeof response.data !== "object") {
      return res.status(500).json({ error: "Invalid response from 5SIM API." });
    }

    const data = response.data;
    const converted = {};

    // ✅ تعديل الأسعار وضبطها بالدولار
    for (const serviceName in data) {
      converted[serviceName] = {};

      for (const country in data[serviceName]) {
        const countryData = data[serviceName][country];
        const originalPrice = parseFloat(countryData.cost || 0);

        // تحويل السعر + ربح 200%
        const newPrice = (originalPrice * PROFIT_MULTIPLIER).toFixed(2);

        converted[serviceName][country] = {
          ...countryData,
          cost: newPrice,
          currency: "USD",
        };
      }
    }

    return res.json({
      success: true,
      currency: "USD",
      profitMultiplier: PROFIT_MULTIPLIER,
      services: converted,
    });
  } catch (error) {
    console.error("❌ 5SIM API Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "5SIM API Error",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
