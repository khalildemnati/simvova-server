import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Endpoint رئيسي
app.get("/", (req, res) => {
  res.send("Simvova API is running successfully 🚀");
});

// ✅ Endpoint لجلب الخدمات
app.get("/services", async (req, res) => {
  try {
    const response = await fetch("https://5sim.net/v1/guest/prices");
    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("Invalid data from 5sim API");
    }

    // نحول الكائن إلى Array ليتناسب مع frontend
    const servicesArray = Object.keys(data).map((country) => ({
      country,
      services: data[country],
    }));

    res.json({ success: true, services: servicesArray });
  } catch (error) {
    console.error("Error fetching services:", error.message);
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

// ✅ Endpoints مؤقتة للـ Orders و Transactions حتى لا تظهر أخطاء
app.get("/orders", (req, res) => {
  res.json({
    success: true,
    orders: [
      { id: 1, service: "WhatsApp", cost: 1.2, status: "completed" },
      { id: 2, service: "Telegram", cost: 0.9, status: "pending" },
    ],
  });
});

app.get("/transactions", (req, res) => {
  res.json({
    success: true,
    transactions: [
      { id: 101, type: "deposit", amount: 10, currency: "USD" },
      { id: 102, type: "purchase", amount: -1.2, currency: "USD" },
    ],
  });
});

// ✅ بدء السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
