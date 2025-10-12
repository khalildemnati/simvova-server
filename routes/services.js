import express from "express";
import fetch from "node-fetch";
const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;
const PROFIT_MULTIPLIER = parseFloat(process.env.PROFIT_MULTIPLIER || "3");

router.get("/", async (req, res) => {
  try {
    const url = "https://5sim.net/v1/guest/prices"; // fetch general prices
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });

    // if provider returns text or error, handle it
    if (!response.ok) {
      const txt = await response.text();
      console.error("5SIM prices fetch error:", txt);
      return res.status(502).json({ error: "Provider error", details: txt });
    }

    const data = await response.json();

    // multiply prices and force currency USD
    for (const serviceKey of Object.keys(data)) {
      const countryObj = data[serviceKey];
      for (const countryCode of Object.keys(countryObj)) {
        const item = countryObj[countryCode];
        const original = parseFloat(item.cost || item.price || 0) || 0;
        item.cost = parseFloat((original * PROFIT_MULTIPLIER).toFixed(2));
        item.currency = "USD";
      }
    }

    res.json({ success: true, currency: "USD", profitMultiplier: PROFIT_MULTIPLIER, services: data });
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

export default router;
