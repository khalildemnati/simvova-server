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

    // تحقق من أن data.services موجودة وأنها كائن
    const servicesObject = data.services && typeof data.services === "object" ? data.services : {};

    // تحويل services من Object إلى Array مع حماية ضد الحقول المفقودة
    const servicesArray = Object.keys(servicesObject).map((countryKey) => {
      const countryServices = servicesObject[countryKey] || {};

      // تعديل كل خدمة داخل كل مشغل مع حماية ضد القيم الفارغة
      for (const operator in countryServices) {
        const item = countryServices[operator] || {};
        const originalPrice = parseFloat(item.cost || 0);
        item.cost = (originalPrice * PROFIT_MULTIPLIER).toFixed(2);
        item.currency = "USD";

        // حماية إضافية لأي حقل ناقص
        item.name = item.name || "Unknown";
        item.creation_date = item.creation_date || "1970-01-01T00:00:00Z";
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
