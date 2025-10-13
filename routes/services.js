import express from "express";
import axios from "axios";

const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://5sim.net/v1/guest/prices", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    // تحويل الأسعار من RUB إلى USD وضربها ×3 (ربح 200%)
    const RUB_TO_USD = 0.011; // تقريبياً
    const data = response.data;
    const services = {};

    for (const country in data) {
      services[country] = {};
      for (const service in data[country]) {
        const item = data[country][service];
        const priceUSD = (item.cost * RUB_TO_USD * 3).toFixed(2);
        services[country][service] = { ...item, cost_usd: priceUSD };
      }
    }

    res.json({ success: true, services });
  } catch (error) {
    console.error("5SIM API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch from 5SIM API" });
  }
});

export default router;
