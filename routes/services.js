import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const API_KEY = process.env.API_KEY;
const PROFIT_MULTIPLIER = 3;

router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/prices?country=any", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const data = await response.json();

    if (data.success === false || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid data from 5sim" });
    }

    Object.keys(data).forEach((service) => {
      Object.keys(data[service]).forEach((country) => {
        const originalPrice = parseFloat(data[service][country].cost || 0);
        const newPrice = (originalPrice * PROFIT_MULTIPLIER).toFixed(2);
        data[service][country].cost = newPrice;
        data[service][country].currency = "USD";
      });
    });

    res.json({
      success: true,
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
