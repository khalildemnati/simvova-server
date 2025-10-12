import express from "express";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// get wallet balance
router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ balance: user.balance });
});

// add funds (voucher code simple) -- in prod use proper payment integration
router.post("/add", async (req, res) => {
  const { userId, code, amount } = req.body;
  // simple demo: accept a code "SIMVOVA100" to add amount
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (code !== "SIMVOVA100" && !amount) return res.status(400).json({ error: "Invalid code or amount" });

  const add = amount ? parseFloat(amount) : 100;
  user.balance = parseFloat((user.balance + add).toFixed(2));
  await user.save();
  await Transaction.create({ userId: user._id, type: "deposit", amount: add, meta: { code } });
  res.json({ success: true, newBalance: user.balance });
});

export default router;
