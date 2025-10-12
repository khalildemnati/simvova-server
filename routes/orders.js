import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/user/:userId", async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = 20;
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
  res.json({ page, orders });
});

export default router;
