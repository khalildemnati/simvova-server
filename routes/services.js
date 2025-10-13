import express from "express";
import axios from "axios";

const router = express.Router();
const API_KEY = process.env.FIVESIM_API_KEY;
const PROFIT_MULTIPLIER = parseFloat(process.env.PROFIT_MULTIPLIER || "3");

// currency conversion helper: use exchangerate.host free endpoint
async function convertToUSD(amount, fromCurrency = "RUB") {
  try {
    if (fromCurrency === "USD") return amount;
    const r = await axios.get(`https://api.exchangerate.host/convert?from=${encodeURIComponent(fromCurrency)}&to=USD&amount=${encodeURIComponent(amount)}`);
    if (r.data && r.data.result != null) return r.data.result;
  } catch (e) {
    console.error("Exchange rate error:", e.message);
  }
  // fallback: assume RUB->USD ~ 0.011
  return fromCurrency === "RUB" ? amount * 0.011 : amount;
}

function flattenServices(raw) {
  const arr = [];
  // try different shapes robustly
  for (const svcKey of Object.keys(raw || {})) {
    const countryObj = raw[svcKey];
    if (!countryObj || typeof countryObj !== "object") continue;
    for (const countryCode of Object.keys(countryObj)) {
      const entry = countryObj[countryCode];
      // entry might be object or array or number
      if (Array.isArray(entry)) {
        // array of operators/items
        for (const op of entry) {
          const cost = parseFloat(op.cost || op.price || 0);
          arr.push({ service: svcKey, country: countryCode, operator: op.operator || null, providerPrice: cost, providerCurrency: op.currency || null });
        }
      } else if (typeof entry === "object") {
        // object of operators or a single item
        for (const opKey of Object.keys(entry)) {
          const item = entry[opKey];
          if (typeof item === "object") {
            const cost = parseFloat(item.cost || item.price || 0);
            arr.push({ service: svcKey, country: countryCode, operator: opKey, providerPrice: cost, providerCurrency: item.currency || null });
          } else if (!isNaN(item)) {
            arr.push({ service: svcKey, country: countryCode, operator: opKey, providerPrice: parseFloat(item), providerCurrency: null });
          }
        }
      } else if (!isNaN(entry)) {
        arr.push({ service: svcKey, country: countryCode, operator: null, providerPrice: parseFloat(entry), providerCurrency: null });
      }
    }
  }
  return arr;
}

router.get("/", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Missing FIVESIM_API_KEY env" });

    // call 5sim user prices endpoint (requires API key)
    const endpoint = "https://5sim.net/v1/user/prices";
    const r = await axios.get(endpoint, { headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json", "User-Agent": "SimVova/1.0" } });

    const raw = r.data;
    const flat = flattenServices(raw);

    // convert and apply profit
    const out = [];
    for (const item of flat) {
      const providerCurrency = item.providerCurrency || "RUB";
      const usd = await convertToUSD(item.providerPrice || 0, providerCurrency);
      const final = Number((usd * PROFIT_MULTIPLIER).toFixed(2));
      out.push({
        service: item.service,
        country: item.country,
        operator: item.operator,
        providerPrice: item.providerPrice,
        providerCurrency,
        priceUSD: Number(usd.toFixed(4)),
        sellPriceUSD: final,
        currency: "USD"
      });
    }

    res.json({ success: true, services: out });
  } catch (err) {
    console.error("services error:", err.response?.data || err.message);
    res.status(502).json({ error: "Failed to fetch services from 5SIM", details: err.response?.data || err.message });
  }
});

export default router;
