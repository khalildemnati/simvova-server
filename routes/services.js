// routes/services.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const API_KEY = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTE2Mjg5NDgsImlhdCI6MTc2MDA5Mjk0OCwicmF5IjoiYjkwOWI5ZTE1MjdhZmVjYjMzMzUwNTUxNGVkNjk1OTciLCJzdWIiOjE0NDU2MDV9.UAb1R4DZpbJ7WdvmcsDzNZCXam6YIgJs_PbSSnvkHu7eKtGAIm8AVFbA1kZrunUL8nNsjKaRaFeMcMTD5jwRytPnrXswdo35lYwYqMbWcY36RXNeSHYZNsXQchLy4sTCsjpQzKfY0BKGWN0ogdfl7fq94j774-O2Hu-wzvO-X1fQF5g5xdOxroivgu5-ZxEtL5561vTAMy3n93Obb1ttJ-lAOlq6LlzotUURELRqD3K3ztc_Oy6L8UnaXDyZKvgAyp7QHJRURe-11xEvmxgO1gtqydo7FZrm9dOZGoe2iullf8Fye0Gjq-vct0iBkcPnv-D-LXdkdZK3vPcAzHXs1A";
const PROFIT_MULTIPLIER = 3; // 200% profit (price × 3)

router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/prices?country=any", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const data = await response.json();

    // تعديل الأسعار وضبط العملة بالدولار
    Object.keys(data).forEach((service) => {
      Object.keys(data[service]).forEach((country) => {
        const originalPrice = parseFloat(data[service][country].cost || 0);
        const newPrice = (originalPrice * PROFIT_MULTIPLIER).toFixed(2);
        data[service][country].cost = newPrice;
        data[service][country].currency = "USD";
      });
    });

    res.json({
      currency: "USD",
      profitMultiplier: PROFIT_MULTIPLIER,
      services: data,
    });
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

export default router;
