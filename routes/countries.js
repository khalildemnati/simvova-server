import express from "express";
import fetch from "node-fetch";
const router = express.Router();

const API_KEY = process.env.FIVESIM_API_KEY;

router.get("/", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing 5SIM API key in environment" });
    }

    const response = await fetch("https://5sim.net/v1/guest/countries/", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("5SIM API Error:", text);
      return res.status(response.status).json({
        error: "Failed to fetch from 5SIM API",
        details: text
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Fetch countries error:", error);
    return res.status(500).json({ error: "Internal server error while fetching countries" });
  }
});

export default router;
