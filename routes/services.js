import express from "express";

const router = express.Router();

// ✅ جلب كل الخدمات
router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "eSIM Activation", price: 9.99 },
    { id: 2, name: "Data Plan 5GB", price: 19.99 },
    { id: 3, name: "Unlimited Calls", price: 14.99 },
  ]);
});

// ✅ اختبار الخدمة حسب ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id, name: `Service ${id}`, price: 9.99 });
});

export default router;
