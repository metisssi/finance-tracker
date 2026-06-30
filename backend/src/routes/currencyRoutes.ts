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
    if (!currencyCode) {
      res.status(400).json({ success: false, message: "currencyCode is required" });
      return;
    }
    const item = await prisma.watchlist.create({
      data: { currencyCode: currencyCode.toUpperCase() }
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add to watchlist" });
  }
});

// Get watchlist
router.get("/watchlist", async (req, res) => {
  try {
    const items = await prisma.watchlist.findMany();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get watchlist" });
  }
});


// Remove from watchlist
router.delete("/watchlist/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ success: false, message: "Valid id is required" });
      return;
    }

  
    await prisma.watchlist.delete({
      where: { id: Number(id) }
    });


    res.json({ success: true, message: "Deleted successfully"  });
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


export default router;