import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../services/authService";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many login attempts, try again in 1 minute" },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many register attempts, try again in 1 minute" },
});

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      return;
    }
    const user = await register(email, password);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }
    const token = await login(email, password);
    res.json({ success: true, data: token });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

export default router;