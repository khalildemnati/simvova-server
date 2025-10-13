import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "20");
    const userId = req.query.userId;
    const q = userId ? { userId } : {};
    const orders = await Order.find(q).sort({ createdAt: -1 }).limit(limit);
    res.json({ orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
