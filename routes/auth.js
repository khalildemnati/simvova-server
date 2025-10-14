import express from "express";
const router = express.Router();

// ✅ اختبار GET (اختياري للتأكد أن المسار يعمل)
router.get("/", (req, res) => {
  res.json({ message: "Auth route is active ✅" });
});

// ✅ مسار تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    // محاكاة تحقق من البيانات
    if (email === "test@example.com" && password === "123456") {
      return res.json({ success: true, message: "Login successful!" });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
