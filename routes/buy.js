import express from "express";
import axios from "axios";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";

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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // fetch provider price
    const priceResp = await axios.get(`https://5sim.net/v1/user/prices?country=${encodeURIComponent(country)}`, {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });
    const prices = priceResp.data;
    // simple search for a matching price
    let providerPrice = 0;
    try {
      if (prices && prices[service] && prices[service][country]) {
        const entry = prices[service][country];
        if (Array.isArray(entry) && entry[0] && entry[0].cost) providerPrice = parseFloat(entry[0].cost);
        else if (entry.cost) providerPrice = parseFloat(entry.cost);
      } else {
        // fallback: find first numeric cost
        for (const s of Object.keys(prices || {})) {
          const cObj = prices[s][country];
          if (cObj) {
            if (Array.isArray(cObj) && cObj[0] && cObj[0].cost) { providerPrice = parseFloat(cObj[0].cost); break; }
            else if (cObj.cost) { providerPrice = parseFloat(cObj.cost); break; }
          }
        }
      }
    } catch (e) {
      providerPrice = 0;
    }

    if (!providerPrice || providerPrice <= 0) return res.status(400).json({ error: "Provider price not found" });

    // convert to USD (reuse exchangerate.host)
    const conv = await axios.get(`https://api.exchangerate.host/convert?from=RUB&to=USD&amount=${encodeURIComponent(providerPrice)}`);
    const providerUSD = conv.data?.result ?? (providerPrice * 0.011);

    const sellPrice = Number((providerUSD * PROFIT_MULTIPLIER).toFixed(2));

    if (user.balance < sellPrice) return res.status(402).json({ error: "Insufficient balance", needed: sellPrice, current: user.balance });

    // deduct
    user.balance = Number((user.balance - sellPrice).toFixed(2));
    await user.save();
    await Transaction.create({ userId: user._id, type: "purchase", amount: sellPrice, meta: { country, service } });

    // create order
    const order = await Order.create({ userId: user._id, country, service, operator, providerPrice, sellPrice, status: "pending" });

    // call provider buy endpoint (user buy)
    const buyResp = await axios.get(`https://5sim.net/v1/user/buy/activation/${encodeURIComponent(country)}/${encodeURIComponent(operator)}/${encodeURIComponent(service)}`, {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
    });

    if (buyResp.status !== 200) {
      // refund
      user.balance = Number((user.balance + sellPrice).toFixed(2));
      await user.save();
      await Transaction.create({ userId: user._id, type: "refund", amount: sellPrice, meta: { reason: buyResp.data } });
      order.status = "failed";
      await order.save();
      return res.status(502).json({ error: "Provider buy failed", details: buyResp.data });
    }

    order.status = "success";
    order.providerResponse = buyResp.data;
    await order.save();

    res.json({ success: true, orderId: order._id, provider: buyResp.data, newBalance: user.balance });
  } catch (err) {
    console.error("Buy error:", err.response?.data || err.message);
    res.status(500).json({ error: "Server error during buy", details: err.response?.data || err.message });
  }
});

export default router;
