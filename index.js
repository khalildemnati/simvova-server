import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import connectDB from "./config/mongo.js";

// Routers
import servicesRouter from "./routes/services.js";
import countriesRouter from "./routes/countries.js";
import buyRouter from "./routes/buy.js";
import statusRouter from "./routes/status.js";
import balanceRouter from "./routes/balance.js";
import authRouter from "./routes/auth.js";
import walletRouter from "./routes/wallet.js";
import ordersRouter from "./routes/orders.js";
import usersRouter from "./routes/users.js"; // ✅ Added missing users route

// Initialize
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Health Check Route
app.get("/", (req, res) => {
  res.json({ ok: true, name: "SimVova API", status: "running" });
});

// Register Routes
app.use("/auth", authRouter);
app.use("/users", usersRouter); // ✅ Added users route
app.use("/services", servicesRouter);
app.use("/countries", countriesRouter);
app.use("/buy", buyRouter);
app.use("/status", statusRouter);
app.use("/balance", balanceRouter);
app.use("/wallet", walletRouter);
app.use("/orders", ordersRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
