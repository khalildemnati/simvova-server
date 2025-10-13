import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;

// ✅ جلب كل الخدمات من 5SIM
router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/products", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ 5SIM API Error:", text);
      return res.status(response.status).json({
        error: "5SIM API Error",
        details: text,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("⚠️ Error fetching services:", err.message);
    res.status(500).json({
      error: "Failed to fetch from 5SIM API",
    });
  }
});

export default router;
