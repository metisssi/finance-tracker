import { useEffect, useState } from "react";
import { getRates, getWatchlist, addToWatchlist, removeFromWatchlist } from "../services/currencyService";
import { logout } from "../services/authService";
import CurrencyChart from "../components/CurrencyChart";
import CurrencyConverter from "../components/CurrencyConverter";
import CurrencyFilter, { getSelectedCurrencies } from "../components/CurrencyFilter";

interface Rate {
  [key: string]: number;
}

interface WatchlistItem {
  id: number;
  currencyCode: string;
  createdAt: string;
}

interface Props {
  onLogout: () => void;
}

const DashboardPage = ({ onLogout }: Props) => {
  const [rates, setRates] = useState<Rate>({});
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(getSelectedCurrencies());

  const fetchData = async () => {
    setLoading(true);
    const ratesRes = await getRates();
    const watchlistRes = await getWatchlist();
    setRates(ratesRes.data);
    setWatchlist(watchlistRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (code: string) => {
    await addToWatchlist(code);
    fetchData();
  };

  const handleRemove = async (id: number) => {
    await removeFromWatchlist(id);
    fetchData();
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Finance Tracker</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <CurrencyConverter rates={rates} />

            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Exchange Rates</h2>
              <CurrencyFilter selected={selectedCurrencies} onChange={setSelectedCurrencies} />
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-3">Currency</th>
                    <th className="pb-3">Rate</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rates)
                    .filter(([code]) => selectedCurrencies.includes(code))
                    .map(([code, rate]) => (
                      <tr
                        key={code}
                        className="border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition"
                        onClick={() => setSelectedCode(code === selectedCode ? null : code)}
                      >
                        <td className="py-3 font-semibold">{code}</td>
                        <td className="py-3 text-green-400">{rate}</td>
                        <td className="py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAdd(code); }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
                          >
                            + Watchlist
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {selectedCode && <CurrencyChart code={selectedCode} />}

            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">My Watchlist</h2>
              {watchlist.length === 0 ? (
                <p className="text-gray-400">No currencies in watchlist</p>
              ) : (
                <div className="space-y-2">
                  {watchlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-700 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-600 transition"
                    onClick={() => setSelectedCode(item.currencyCode === selectedCode ? null : item.currencyCode)}
                >
              <div className="flex items-center gap-4">
              <span className="font-semibold">{item.currencyCode}</span>
              <span className="text-green-400 text-sm">
              {rates[item.currencyCode] ?? "—"}
             </span>
            </div>
          <button
           onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
        >
            Remove
         </button>
        </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;