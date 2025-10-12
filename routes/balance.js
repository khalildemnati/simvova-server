import express from "express";
import fetch from "node-fetch";
const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;

router.get("/", async (req, res) => {
  try {
    const r = await fetch("https://5sim.net/v1/user/profile", {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: "Provider error", details: txt });
    }
    const data = await r.json();
    // return only balance and email maybe
    res.json({ balance: data.balance, email: data.email, locale: data.locale });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});
export default router;
