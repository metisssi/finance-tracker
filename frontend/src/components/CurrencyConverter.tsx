import { useState } from "react";

interface Props {
  rates: { [key: string]: number };
}

const CurrencyConverter = ({ rates }: Props) => {
  const [amount, setAmount] = useState<string>("");
  const [from, setFrom] = useState<string>("EUR");
  const [to, setTo] = useState<string>("USD");

  const currencies = Object.keys(rates);

  const convert = () => {
    const num = parseFloat(amount);
    if (isNaN(num)) return null;
    const inEur = num / rates[from];
    return (inEur * rates[to]).toFixed(4);
  };

  const result = convert();

  return (
    <div className="bg-gray-800 rounded-2xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Currency Converter</h2>
      <div className="flex gap-3 items-center flex-wrap">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg w-36 outline-none"
        />
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg outline-none"
        >
          {currencies.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span className="text-gray-400">→</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg outline-none"
        >
          {currencies.map((c) => <option key={c}>{c}</option>)}
        </select>
        {result && (
          <span className="text-green-400 font-semibold text-lg">
            = {result} {to}
          </span>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;