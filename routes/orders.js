import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// fetch orders for a user (by token or query)
router.get("/", async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

export default router;
