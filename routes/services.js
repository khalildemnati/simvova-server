import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const FIVESIM_API_KEY = process.env.FIVESIM_API_KEY;
const PROFIT_MULTIPLIER = 3; // 200% profit
const BASE_URL = "https://5sim.net/v1/guest";
const EXCHANGE_API = "https://api.exchangerate-api.com/v4/latest/RUB";

// 🪙 Get RUB to USD rate once at startup (you can refresh it later if needed)
let rubToUsdRate = 0;
async function fetchExchangeRate() {
  try {
    const res = await fetch(EXCHANGE_API);
    const data = await res.json();
    rubToUsdRate = data.rates.USD;
    console.log(`💱 1 RUB = ${rubToUsdRate} USD`);
  } catch (err) {
    console.error("⚠️ Failed to fetch exchange rate:", err);
    rubToUsdRate = 0.011; // fallback default
  }
}
fetchExchangeRate();

// 🧩 Fetch services from 5SIM and convert prices
router.get("/", async (req, res) => {
  try {
    // Get services from 5SIM API
    const response = await fetch(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${FIVESIM_API_KEY}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("5SIM API Error:", text);
      return res.status(response.status).json({ error: "Failed to fetch from 5SIM API" });
    }

    const data = await response.json();
    const results = [];

    // Convert to your pricing structure
    for (const country in data) {
      for (const service in data[country]) {
        const originalCostRUB = data[country][service];
        if (!originalCostRUB || isNaN(originalCostRUB)) continue;

        const costUSD = originalCostRUB * rubToUsdRate;
        const finalPrice = (costUSD * PROFIT_MULTIPLIER).toFixed(3);

        results.push({
          service,
          country,
          cost: parseFloat(finalPrice),
          currency: "USD",
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("🔥 Error fetching services:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
