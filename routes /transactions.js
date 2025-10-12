import express from "express";
const router = express.Router();

// Simple test route
router.get("/", (req, res) => {
  res.json({ message: "Transactions API working!" });
});

export default router;
