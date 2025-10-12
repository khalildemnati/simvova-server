import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const BASE_URL = "https://5sim.net/v1/user"; // ✅ endpoint الصحيح
const API_KEY = process.env.FIVESIM_API_KEY;

// تحويل السعر من روبل إلى دولار مع ربح 200%
function convertPrice(rubPrice) {
  const RUB_TO_USD = 100; // 100 روبل ≈ 1 دولار
  const baseUSD = rubPrice / RUB_TO_USD;
  const finalPrice = baseUSD * 3; // 200% ربح
  return Number(finalPrice.toFixed(2));
}

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/prices`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const data = response.data;
    const services = [];

    for (const country in data) {
      for (const service in data[country]) {
        const info = data[country][service][0];
        const costRub = info?.cost || 0;
        const costUsd = convertPrice(costRub);

        services.push({
          country,
          service,
          cost: costUsd,
          currency: "USD",
        });
      }
    }

    res.json({ success: true, services });
  } catch (error) {
    console.error("❌ 5SIM API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch from 5SIM API" });
  }
});

export default router;
