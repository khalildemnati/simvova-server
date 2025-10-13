import express from "express";
import axios from "axios";

const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;

router.get("/", async (req, res) => {
  try {
    const r = await axios.get("https://5sim.net/v1/user/profile", {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });
    // return only key info
    res.json({ balance: r.data.balance, email: r.data.email });
  } catch (e) {
    console.error("balance error:", e.response?.data || e.message);
    res.status(502).json({ error: "Failed to fetch balance", details: e.response?.data || e.message });
  }
});

export default router;
