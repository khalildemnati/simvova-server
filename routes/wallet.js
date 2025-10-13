import express from "express";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// get balance
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ balance: user.balance });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// add funds (voucher code or amount)
router.post("/add", async (req, res) => {
  try {
    const { userId, code, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const add = amount ? Number(amount) : (code === "SIMVOVA100" ? 100 : 0);
    if (!add) return res.status(400).json({ error: "Invalid code or amount" });
    user.balance = Number((user.balance + add).toFixed(2));
    await user.save();
    await Transaction.create({ userId: user._id, type: "deposit", amount: add, meta: { code } });
    res.json({ success: true, newBalance: user.balance });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
