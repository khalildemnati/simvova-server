// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import connectDB from "./config/mongo.js";
import authRouter from "./routes/auth.js";
import servicesRouter from "./routes/services.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

// ✅ Health Check
app.get("/", (req, res) => {
  res.json({ ok: true, name: "SimVova API", status: "running" });
});

// ✅ Test routes (to verify everything is working from browser)
app.get("/test/ip", (req, res) => {
  res.json({ ip: req.clientIp || "unknown" });
});

app.get("/test/mongo", async (req, res) => {
  try {
    const mongoose = await import("mongoose");
    if (mongoose.connection.readyState === 1) {
      res.json({ mongo: "connected ✅" });
    } else {
      res.json({ mongo: "not connected ❌" });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/test/routes", (req, res) => {
  res.json({
    available_routes: [
      { route: "/auth/register", method: "POST" },
      { route: "/auth/login", method: "POST" },
      { route: "/auth/me", method: "GET (requires token)" },
      { route: "/services", method: "GET" },
      { route: "/services/buy", method: "POST" },
      { route: "/services/update", method: "PUT" },
      { route: "/services/delete/:id", method: "DELETE" },
      { route: "/test/ip", method: "GET" },
      { route: "/test/mongo", method: "GET" },
    ],
  });
});

// ✅ Register API Routes
app.use("/auth", authRouter);
app.use("/services", servicesRouter);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Connect to MongoDB then start server
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("✅ MongoDB connected successfully");
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
