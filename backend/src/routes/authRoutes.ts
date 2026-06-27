import { Router } from "express";
import { register, login } from "../services/authService";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }
    const user = await register(email, password);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
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