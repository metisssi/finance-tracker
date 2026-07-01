import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
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

// Custom tooltip shown on hover over the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="text-white font-mono font-semibold">
        {Number(payload[0].value).toFixed(4)}
      </div>
    </div>
  );
};

const CurrencyChart = ({ code }: Props) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getHistory(code);
        // API returns newest first, reverse to get chronological order
        setHistory((res.data ?? []).reverse());
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [code]);

  // Shape history into what recharts expects: { time, rate }
  const data = history.map((item) => ({
    time: new Date(item.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    rate: item.rate,
  }));

  // Calculate min/max for Y axis so the chart isn't flat
  const rates = data.map((d) => d.rate);
  const minRate = rates.length ? Math.min(...rates) : 0;
  const maxRate = rates.length ? Math.max(...rates) : 1;
  const padding = (maxRate - minRate) * 0.1 || 0.01;

  return (
    <div className="px-5 py-5 bg-slate-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-white text-sm font-semibold">{code} / EUR</span>
          <span className="text-slate-500 text-xs ml-2">30-day history</span>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-600 text-xs">
          Loading chart...
        </div>
      ) : data.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-slate-600 text-xs">
          Not enough data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#334155"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#334155"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[minRate - padding, maxRate + padding]}
              tickFormatter={(v) => Number(v).toFixed(3)}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CurrencyChart;