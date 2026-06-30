import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = process.env.FRANKFURTER_API_URL || "https://api.frankfurter.app";

export const fetchAndSaveRates = async () => {

    const response = await axios.get(`${BASE_URL}/latest?from=EUR&to=USD,GBP,CZK,JPY,CHF,PLN,CAD`);

    const rates = { EUR: 1, ...response.data.rates };

    for (const [code, rate] of Object.entries(rates)) {
        await prisma.currency.upsert({
            where: { code },
            update: { rate: rate as number },
            create: { code, name: code, rate: rate as number },
        });

        await prisma.currencyHistory.create({
            data: { code, rate: rate as number },
        });
    }

    return rates;
};

export const seedHistoricalRates = async () => {
    const existing = await prisma.currencyHistory.count();
    if (existing > 0) return;

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const response = await axios.get(
        `${BASE_URL}/${fmt(start)}..${fmt(end)}?from=EUR&to=USD,GBP,CZK,JPY,CHF,PLN,CAD`
    );

    const { rates: dailyRates } = response.data;

    for (const [date, rates] of Object.entries(dailyRates) as [string, Record<string, number>][]) {
        const allRates = { EUR: 1, ...rates };
        for (const [code, rate] of Object.entries(allRates)) {
            await prisma.currencyHistory.create({
                data: { code, rate, createdAt: new Date(date) },
            });
        }
    }
};