import { useState } from "react";

const ALL_CURRENCIES = ["EUR", "USD", "GBP", "CZK", "JPY", "CHF", "PLN", "CAD"];
const DEFAULT_CURRENCIES = ["EUR", "USD", "GBP", "CZK"];
const STORAGE_KEY = "selected_currencies";

export const getSelectedCurrencies = (): string[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CURRENCIES;
};


interface Props {
    selected: string[];
    onChange: (selected: string[]) => void;
}

const CurrencyFilter = ({ selected, onChange }: Props) => {
    const [open, setOpen] = useState(false);

    const toggle = (code: string) => {
        const updated = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : [...selected, code];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    onChange(updated);
    };

      return (
    <div className="relative mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
      >
        Manage Currencies ({selected.length})
      </button>

      {open && (
        <div className="absolute z-10 mt-2 bg-gray-700 rounded-xl p-4 shadow-lg flex flex-wrap gap-2">
          {ALL_CURRENCIES.map((code) => (
            <button
              key={code}
              onClick={() => toggle(code)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                selected.includes(code)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300 hover:bg-gray-500"
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencyFilter;


