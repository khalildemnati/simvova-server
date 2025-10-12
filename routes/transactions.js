import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const tx = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ transactions: tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load transactions" });
  }
});

export default router;
