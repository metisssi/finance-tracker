import express from "express";
import dotenv from "dotenv"
import currencyRoutes from "./routes/currencyRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Finance Tracker API is running!" });
})

app.use("/api/currencies", currencyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})