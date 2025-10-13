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

connectDB();

app.get("/", (req, res) => res.json({ ok: true, name: "SimVova API", status: "running" }));
app.use("/auth", authRouter);
app.use("/services", servicesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
