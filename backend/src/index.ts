import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import currencyRoutes from "./routes/currencyRoutes";
import authRoutes from "./routes/authRoutes";
import { seedHistoricalRates } from "./services/currencyService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Finance Tracker API is running!" });
});

app.use("/api/currencies", currencyRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedHistoricalRates()
    .then(() => console.log("Seed completed"))
    .catch((err) => console.error("Seed failed:", err));
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});