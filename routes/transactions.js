// routes/transactions.js
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json({
    success: true,
    transactions: [],
    limit
  });
});

export default router;
