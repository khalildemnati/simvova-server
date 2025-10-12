import express from "express";
import fetch from "node-fetch";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;
const APP_KEY = process.env.APP_KEY || "simvova_app_key_change_me";
const PROFIT_MULTIPLIER = parseFloat(process.env.PROFIT_MULTIPLIER || "3");

function requireAppKey(req, res, next) {
  const key = req.headers["x-app-key"];
  if (!key || key !== APP_KEY) return res.status(401).json({ error: "Unauthorized - invalid app key" });
  next();
}

router.post("/", requireAppKey, async (req, res) => {
  try {
    const { userId, country, service, operator = "any" } = req.body;
    if (!userId || !country || !service) return res.status(400).json({ error: "userId, country and service required" });

    // fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // get provider price (guest prices by country)
    const pr = await fetch(`https://5sim.net/v1/guest/prices?country=${encodeURIComponent(country)}`, {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });
    const prices = await pr.json();
    // find provider price for given service
    let providerPrice = 0;
    try {
      // try common shapes
      if (prices && prices[service] && prices[service][country] && prices[service][country].cost) {
        providerPrice = parseFloat(prices[service][country].cost) || 0;
      } else {
        // fallback: search first numeric cost
        for (const s of Object.keys(prices || {})) {
          const cObj = prices[s][country];
          if (cObj && cObj.cost) { providerPrice = parseFloat(cObj.cost); break; }
        }
      }
    } catch (e) { providerPrice = 0; }

    if (!providerPrice || providerPrice <= 0) return res.status(400).json({ error: "Provider price not found" });

    const sellPrice = parseFloat((providerPrice * PROFIT_MULTIPLIER).toFixed(2));

    if (user.balance < sellPrice) return res.status(402).json({ error: "Insufficient balance", needed: sellPrice, current: user.balance });

    // deduct balance
    user.balance = parseFloat((user.balance - sellPrice).toFixed(2));
    await user.save();
    await Transaction.create({ userId: user._id, type: "purchase", amount: sellPrice, meta: { country, service } });

    // create order record
    const order = await Order.create({ userId: user._id, country, service, operator, providerPrice, sellPrice, status: "pending" });

    // call provider buy
    const buyResp = await fetch(`https://5sim.net/v1/user/buy/activation/${encodeURIComponent(country)}/${encodeURIComponent(operator)}/${encodeURIComponent(service)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });

    if (!buyResp.ok) {
      const txt = await buyResp.text();
      // refund
      user.balance = parseFloat((user.balance + sellPrice).toFixed(2));
      await user.save();
      await Transaction.create({ userId: user._id, type: "refund", amount: sellPrice, meta: { reason: txt } });
      order.status = "failed";
      await order.save();
      return res.status(502).json({ error: "Provider buy failed", details: txt });
    }

    const buyData = await buyResp.json();
    order.status = "success";
    order.providerResponse = buyData;
    await order.save();

    res.json({ success: true, orderId: order._id, provider: buyData, newBalance: user.balance });
  } catch (err) {
    console.error("Buy error:", err);
    res.status(500).json({ error: "Server error during buy", details: err.message });
  }
});

export default router;
