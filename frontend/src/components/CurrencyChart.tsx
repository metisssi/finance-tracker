import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getHistory } from "../services/currencyService";

interface HistoryItem {
  id: number;
  code: string;
  rate: number;
  createdAt: string;
}

interface Props {
  code: string;
}

const CurrencyChart = ({ code }: Props) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getHistory(code);
      setHistory(res.data.reverse());
    };
    fetch();
  }, [code]);

  const data = history.map((item) => ({
    time: new Date(item.createdAt).toLocaleTimeString(),
    rate: item.rate,
  }));

  return (
    <div className="bg-gray-800 rounded-2xl p-6 mt-4">
      <h3 className="text-white font-semibold mb-4">{code} Rate History</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="rate" stroke="#3b82f6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CurrencyChart;