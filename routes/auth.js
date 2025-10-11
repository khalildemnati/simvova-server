// routes/auth.js
import express from "express";
const router = express.Router();

// مسار تسجيل الدخول (تجريبي)
router.post("/login", (req, res) => {
  console.log("Login request received:", req.body);
  res.json({
    success: true,
    message: "Login simulation successful!",
    user: { id: 1, name: "Test User", email: req.body.email || "test@example.com" }
  });
});

// مسار إنشاء حساب جديد (تجريبي)
router.post("/register", (req, res) => {
  console.log("Register request received:", req.body);
  res.json({
    success: true,
    message: "Register simulation successful!",
    newUser: { id: 2, name: req.body.name || "New User", email: req.body.email || "new@example.com" }
  });
});

export default router;
