import express from "express";
import axios from "axios";

const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;

router.get("/:id", async (req, res) => {
  try {
    const r = await axios.get(`https://5sim.net/v1/user/check/${encodeURIComponent(req.params.id)}`, {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });
    res.json(r.data);
  } catch (e) {
    console.error("status error:", e.response?.data || e.message);
    res.status(502).json({ error: "Failed to fetch status", details: e.response?.data || e.message });
  }
});

export default router;
