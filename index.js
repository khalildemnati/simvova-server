import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import servicesRouter from "./routes/services.js";
import countriesRouter from "./routes/countries.js";
import buyRouter from "./routes/buy.js";
import statusRouter from "./routes/status.js";
import balanceRouter from "./routes/balance.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// المسارات الرئيسية
app.use("/services", servicesRouter);
app.use("/countries", countriesRouter);
app.use("/buy", buyRouter);
app.use("/status", statusRouter);
app.use("/balance", balanceRouter);

app.get("/", (req, res) => {
  res.send("🚀 SimVova Server is Running Successfully!");
});

const PORT = process.env.PORT || 3000;
// صفحة رئيسية بسيطة للـ API
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: Arial; text-align: center; padding: 40px;">
      <h1>🚀 Simvova API Server is Running</h1>
      <p>Everything looks good!<br>
      You can now connect this backend to your <strong>Google Studio</strong> app.</p>
      <hr>
      <p>Available endpoints:</p>
      <ul style="list-style:none;">
        <li>➡️ /api/services — Get available services</li>
        <li>➡️ /api/orders — Manage orders (coming soon)</li>
        <li>➡️ /api/wallet — Wallet system (coming soon)</li>
      </ul>
    </div>
  `);
});
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
