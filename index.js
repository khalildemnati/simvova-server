import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import connectDB from "./config/mongo.js";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import servicesRouter from "./routes/services.js";
import buyRouter from "./routes/buy.js";
import statusRouter from "./routes/status.js";
import balanceRouter from "./routes/balance.js";
import walletRouter from "./routes/wallet.js";
import ordersRouter from "./routes/orders.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Health
app.get("/", (req, res) => res.json({ ok: true, name: "SimVova API" }));

// Routes
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/services", servicesRouter);
app.use("/buy", buyRouter);
app.use("/status", statusRouter);
app.use("/balance", balanceRouter);
app.use("/wallet", walletRouter);
app.use("/orders", ordersRouter);

// Generic error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
