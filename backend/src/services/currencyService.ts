import axios from "axios"
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const fetchAndSaveRates = async () => {
    const response = await axios.get(
         `http://api.exchangeratesapi.io/v1/latest?access_key=${process.env.EXCHANGE_API_KEY}&symbols=USD,EUR,GBP,CZK`
    );

    const rates = response.data.rates;

    for (const [code, rate] of Object.entries(rates)) {
        await prisma.currency.upsert({
            where: { code },
            update: {rate: rate as number }, 
            create: { code, name: code, rate: rate as number}
        })
    }

    return rates;
}