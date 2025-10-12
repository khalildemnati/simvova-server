import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Initialize
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.FIVESIM_API_KEY;

// Root route
app.get("/", (req, res) => {
  res.json({ ok: true, service: "SimVova API", version: "1.0.0" });
});

// ✅ Route: Get countries
app.get("/countries", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/countries", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("5SIM API Error:", text);
      return res.status(response.status).json({ error: "5SIM API Error", details: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching countries:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Route: Get services (with +200% markup)
app.get("/services", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/services", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("5SIM API Error:", text);
      return res.status(response.status).json({ error: "5SIM API Error", details: text });
    }

    const data = await response.json();

    // Multiply each price ×2 for profit margin
    const updated = {};
    for (const [country, services] of Object.entries(data)) {
      updated[country] = {};
      for (const [serviceName, price] of Object.entries(services)) {
        updated[country][serviceName] = Number((price * 2).toFixed(2));
      }
    }

    res.json(updated);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 SimVova API running on port ${PORT}`));
