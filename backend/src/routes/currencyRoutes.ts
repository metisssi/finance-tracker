import { Router } from "express";
import { fetchAndSaveRates } from "../services/currencyService"
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();


router.get("/rates", async (req, res) => {
    try {
        const rates = await fetchAndSaveRates();
        res.json({ success: true, data: rates }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch rates" });
    }
});

// Добавить валюту в watchlist
router.post("/watchlist", async (req, res) => {
  try {
    const { currencyCode } = req.body;
    const item = await prisma.watchlist.create({
      data: { currencyCode }
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add to watchlist" });
  }
});

// Получить watchlist
router.get("/watchlist", async (req, res) => {
  try {
    const items = await prisma.watchlist.findMany();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get watchlist" });
  }
});







export default router;