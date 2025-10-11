import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import servicesRoutes from "./routes/services.js";
import ordersRoutes from "./routes/orders.js";
import walletRoutes from "./routes/wallet.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

app.get("/", (req, res) => res.send("Simvova API is running 🚀"));

app.use("/auth", authRoutes);
app.use("/services", servicesRoutes);
app.use("/orders", ordersRoutes);
app.use("/wallet", walletRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
