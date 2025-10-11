// routes/services.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// استخدم مفتاح API من Environment Variable
const API_KEY = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTE2Mjg5NDgsImlhdCI6MTc2MDA5Mjk0OCwicmF5IjoiYjkwOWI5ZTE1MjdhZmVjYjMzMzUwNTUxNGVkNjk1OTciLCJzdWIiOjE0NDU2MDV9.UAb1R4DZpbJ7WdvmcsDzNZCXam6YIgJs_PbSSnvkHu7eKtGAIm8AVFbA1kZrunUL8nNsjKaRaFeMcMTD5jwRytPnrXswdo35lYwYqMbWcY36RXNeSHYZNsXQchLy4sTCsjpQzKfY0BKGWN0ogdfl7fq94j774-O2Hu-wzvO-X1fQF5g5xdOxroivgu5-ZxEtL5561vTAMy3n93Obb1ttJ-lAOlq6LlzotUURELRqD3K3ztc_Oy6L8UnaXDyZKvgAyp7QHJRURe-11xEvmxgO1gtqydo7FZrm9dOZGoe2iullf8Fye0Gjq-vct0iBkcPnv-D-LXdkdZK3vPcAzHXs1A";
const PROFIT_MULTIPLIER = 3; // 200% profit

if (!API_KEY) {
  console.warn("Warning: FIVESIM_API_KEY is not set in environment variables.");
}

router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/prices?country=usa", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`5SIM API error: ${text}`);
    }

    const data = await response.json();

    // تعديل الأسعار وضبط العملة بالدولار
    // وتحويل services من Object إلى Array لتجنب خطأ Google Studio
    const servicesArray = Object.keys(data.services || {}).map((countryKey) => {
      const countryServices = data.services[countryKey];
      
      // تعديل كل خدمة داخل كل مشغل
      for (const operator in countryServices) {
        const item = countryServices[operator];
        const originalPrice = parseFloat(item.cost || 0);
        item.cost = (originalPrice * PROFIT_MULTIPLIER).toFixed(2);
        item.currency = "USD";
      }

      return {
        country: countryKey,
        operators: countryServices,
      };
    });

    res.json({
      success: true,
      currency: "USD",
      profitMultiplier: PROFIT_MULTIPLIER,
      services: servicesArray,
    });
  } catch (err) {
    console.error("Error fetching services:", err.message);
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

export default router;
