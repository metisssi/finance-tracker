import { Router } from "express";
import { fetchAndSaveRates } from "../services/currencyService"
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();


// Get all exchange rates
router.get("/rates", async (req, res) => {
    try {
        const rates = await fetchAndSaveRates();
        res.json({ success: true, data: rates }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch rates" });
    }
});


// Get the exchange rate for a specific currency
router.get("/rates/:code", async (req, res) => {
  try{
    const { code } = req.params;
    const currency = await prisma.currency.findUnique({
      where: { code: code.toUpperCase() }
    });
    if(!currency) {
      res.status(404).json({ success: false, message: "Currency not found"});
      return;
    }
      res.json({ success: true, data: currency}); 
  } catch(error){
      res.status(500).json({ success: false, message: "Failed to fetch currency" });
  }
})


// Add value in watchlist
router.post("/watchlist", authMiddleware, async (req, res) => {
  try {
    const { currencyCode } = req.body;
    const userId = (req as any).userId;
    if (!currencyCode) {
      res.status(400).json({ success: false, message: "currencyCode is required" });
      return;
    }
    const item = await prisma.watchlist.create({
      data: { currencyCode: currencyCode.toUpperCase(), userId }
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add to watchlist" });
  }
});


// Get watchlist
router.get("/watchlist", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const items = await prisma.watchlist.findMany({ where: { userId } });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get watchlist" });
  }
});

// Remove from watchlist
router.delete("/watchlist/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Valid id is required" });
      return;
    }

    await prisma.watchlist.delete({
      where: { id: Number(id), userId }
    });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove from watchlist" });
  }
});


// Exchange rate history for a specific currency
router.get("/history/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const history = await prisma.currencyHistory.findMany({
      where: { code: code.toUpperCase() },
      orderBy: { createdAt: "asc" },
      take: 30
    });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get history" });
  }
});

// Get last change percentage for all currencies
router.get("/changes", async (req, res) => {
  try {
    const currencies = ["EUR", "USD", "GBP", "CZK", "JPY", "CHF", "PLN", "CAD"];
    const changes: { [key: string]: number } = {};

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekAgoStart = new Date(todayStart);
    weekAgoStart.setDate(weekAgoStart.getDate() - 7);
    const weekAgoEnd = new Date(weekAgoStart);
    weekAgoEnd.setDate(weekAgoEnd.getDate() + 1);

    for (const code of currencies) {
      const todayRecord = await prisma.currencyHistory.findFirst({
        where: { code, createdAt: { gte: todayStart } },
        orderBy: { createdAt: "desc" },
      });

      const weekAgoRecord = await prisma.currencyHistory.findFirst({
        where: { code, createdAt: { gte: weekAgoStart, lt: weekAgoEnd } },
        orderBy: { createdAt: "desc" },
      });

      if (todayRecord && weekAgoRecord) {
        const current = todayRecord.rate;
        const previous = weekAgoRecord.rate;
        changes[code] = parseFloat((((current - previous) / previous) * 100).toFixed(2));
      } else {
        changes[code] = 0;
      }
    }

    res.json({ success: true, data: changes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get changes" });
  }
});


export default router;