import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const BASE_URL = "https://5sim.net/v1/guest"; // يمكنك تغييره إلى /v1/user لو أردت تفاصيل أدق
const API_KEY = process.env.FIVESIM_API_KEY;

// helper function to convert rubles to USD + add 200% profit
function convertPrice(rubPrice) {
  const RUB_TO_USD = 100; // تقريباً 100 روبل = 1 دولار
  const baseUSD = rubPrice / RUB_TO_USD;
  const finalPrice = baseUSD * 3; // السعر الأصلي + 200% ربح
  return Number(finalPrice.toFixed(2));
}

// GET all services
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/prices?country=any`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const data = response.data;
    const services = [];

    // convert data to array
    for (const country in data) {
      for (const service in data[country]) {
        const info = data[country][service][0]; // first entry
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

    res.json(services);
  } catch (error) {
    console.error("❌ Failed to fetch from 5SIM API:", error.message);
    res.status(500).json({ error: "Failed to fetch from 5SIM API" });
  }
});

export default router;
