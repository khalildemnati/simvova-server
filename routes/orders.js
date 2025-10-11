import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, orders });
});

router.post("/", async (req, res) => {
  const { userId, service, cost } = req.body;
  const order = new Order({ userId, service, cost });
  await order.save();
  res.json({ success: true, order });
});

export default router;
