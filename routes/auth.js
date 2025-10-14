import express from "express";
const router = express.Router();

// مسار تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // هنا ضع منطق التحقق من المستخدم (اختياري الآن)
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // محاكاة تسجيل دخول ناجح
    res.json({ success: true, message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
