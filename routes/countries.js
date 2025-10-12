import express from "express";
import fetch from "node-fetch";
const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;

router.get("/", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/countries", {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });
    if (!response.ok) {
      const txt = await response.text();
      return res.status(502).json({ error: "Provider error", details: txt });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});
export default router;
