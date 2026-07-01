import { useEffect, useState } from "react";
import {
  getRates,
  getChanges,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../services/currencyService";
import { logout } from "../services/authService";
import CurrencyChart from "../components/CurrencyChart";

// Full currency names mapped from ISO code
const CURRENCY_NAMES: Record<string, string> = {
  EUR: "Euro",
  USD: "US Dollar",
  GBP: "British Pound",
  CZK: "Czech Koruna",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  PLN: "Polish Złoty",
  CAD: "Canadian Dollar",
};

// Country flag emoji for each currency
const CURRENCY_FLAGS: Record<string, string> = {
  EUR: "🇪🇺",
  USD: "🇺🇸",
  GBP: "🇬🇧",
  CZK: "🇨🇿",
  JPY: "🇯🇵",
  CHF: "🇨🇭",
  PLN: "🇵🇱",
  CAD: "🇨🇦",
};

interface WatchlistItem {
  id: number;
  currencyCode: string;
}

interface Props {
  onLogout: () => void;
}

const DashboardPage = ({ onLogout }: Props) => {
  const [rates, setRates] = useState<Record<string, number>>({});
  // Weekly % change per currency (e.g. { USD: 0.42, GBP: -0.3 })
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  // Which currency row the user clicked to show the chart
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  // Search filter input value
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingCode, setAddingCode] = useState<string | null>(null);

  // Load all data on mount
  const fetchData = async () => {
    try {
      const [ratesRes, changesRes, watchlistRes] = await Promise.all([
        getRates(),
        getChanges(),
        getWatchlist(),
      ]);
      setRates(ratesRes.data ?? {});
      setChanges(changesRes.data ?? {});
      setWatchlist(watchlistRes.data ?? []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (code: string) => {
    setAddingCode(code);
    try {
      await addToWatchlist(code);
      const res = await getWatchlist();
      setWatchlist(res.data ?? []);
    } finally {
      setAddingCode(null);
    }
  };

  const handleRemove = async (id: number) => {
    await removeFromWatchlist(id);
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Filter currency list by search input
  const filteredCodes = Object.keys(rates).filter((code) => {
    const name = CURRENCY_NAMES[code] ?? "";
    const q = filter.toLowerCase();
    return code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  // Check if a currency is already on the watchlist
  const isWatched = (code: string) =>
    watchlist.some((item) => item.currencyCode === code);

  // Render the weekly % change badge with color
  const renderChange = (code: string) => {
    const pct = changes[code];
    if (pct === undefined) return null;
    const isPositive = pct > 0;
    const isZero = pct === 0;
    const color = isZero
      ? "text-slate-400"
      : isPositive
      ? "text-emerald-400"
      : "text-red-400";
    const sign = isPositive ? "+" : "";
    return (
      <span className={`text-xs font-medium ${color}`}>
        {sign}{pct.toFixed(2)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading rates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-slate-800 px-8 py-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-bold text-lg tracking-wide">FX Tracker</span>
          <span className="hidden sm:block text-slate-600 text-sm">/ Dashboard</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-white text-sm border border-slate-700 hover:border-slate-500 px-4 py-1.5 rounded-lg transition"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 p-6 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Exchange Rates</h1>
          <p className="text-slate-400 text-sm mt-1">
            Base currency: EUR · Updated on every page load · Weekly change shown
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Left column: rates table */}
          <div className="xl:col-span-2 space-y-4">
            <input
              type="text"
              placeholder="Search currency..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
            />

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="grid grid-cols-4 text-xs text-slate-500 uppercase tracking-wider px-5 py-3 border-b border-slate-800">
                <span className="col-span-2">Currency</span>
                <span>Rate</span>
                <span>7d change</span>
              </div>

              {filteredCodes.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-500 text-sm">
                  No currencies match "{filter}"
                </div>
              ) : (
                filteredCodes.map((code) => (
                  <div key={code}>
                    {/* Clickable row — toggles the chart below */}
                    <div
                      onClick={() =>
                        setSelectedCode(code === selectedCode ? null : code)
                      }
                      className={`grid grid-cols-4 items-center px-5 py-4 cursor-pointer border-b border-slate-800 last:border-0 transition group
                        ${selectedCode === code ? "bg-slate-800" : "hover:bg-slate-800/60"}`}
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <span className="text-xl">{CURRENCY_FLAGS[code] ?? "🏳"}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{code}</div>
                          <div className="text-slate-500 text-xs">
                            {CURRENCY_NAMES[code] ?? code}
                          </div>
                        </div>
                      </div>

                      <div className="text-white font-mono text-sm">
                        {Number(rates[code]).toFixed(4)}
                      </div>

                      <div className="flex items-center justify-between">
                        {renderChange(code)}
                        {/* Stop propagation so clicking the button doesn't open the chart */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isWatched(code)) handleAdd(code);
                          }}
                          disabled={isWatched(code) || addingCode === code}
                          className={`text-xs px-3 py-1 rounded-md transition
                            ${
                              isWatched(code)
                                ? "text-slate-600 bg-slate-800 cursor-default"
                                : "text-blue-400 bg-blue-900/30 hover:bg-blue-900/60"
                            }`}
                        >
                          {isWatched(code) ? "Watching" : addingCode === code ? "..." : "+ Watch"}
                        </button>
                      </div>
                    </div>

                    {/* Inline chart — expands when row is selected */}
                    {selectedCode === code && (
                      <div className="border-b border-slate-800">
                        <CurrencyChart code={code} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column: watchlist */}
          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden sticky top-6">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">My Watchlist</h2>
                <span className="text-xs text-slate-500">{watchlist.length} currencies</span>
              </div>

              {watchlist.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-slate-500 text-sm">Nothing here yet.</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Click "+ Watch" on any currency to track it.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {watchlist.map((item) => {
                    const rate = rates[item.currencyCode];
                    const pct = changes[item.currencyCode];
                    const isPos = pct > 0;
                    return (
                      <div
                        key={item.id}
                        className="px-5 py-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {CURRENCY_FLAGS[item.currencyCode] ?? "🏳"}
                          </span>
                          <div>
                            <div className="text-white text-sm font-medium">
                              {item.currencyCode}
                            </div>
                            {rate !== undefined && (
                              <div className="text-slate-500 text-xs font-mono">
                                {Number(rate).toFixed(4)}{" "}
                                {pct !== undefined && (
                                  <span
                                    className={
                                      pct === 0
                                        ? "text-slate-600"
                                        : isPos
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                    }
                                  >
                                    ({isPos ? "+" : ""}{pct.toFixed(2)}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-slate-600 hover:text-red-400 text-xs transition"
                          title="Remove from watchlist"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;