// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router();

// ✅ نموذج المستخدم (User Schema)
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ✅ تسجيل مستخدم جديد
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "الرجاء إدخال البريد وكلمة المرور" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "تم إنشاء الحساب بنجاح ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "يرجى إدخال البريد وكلمة المرور" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "الحساب غير موجود" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "كلمة المرور غير صحيحة" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    res.json({ message: "تم تسجيل الدخول بنجاح ✅", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ جلب بيانات المستخدم
router.get("/me", async (req, res) => {
  res.json({ message: "تم الوصول إلى بيانات المستخدم بنجاح ✅" });
});

export default router;
