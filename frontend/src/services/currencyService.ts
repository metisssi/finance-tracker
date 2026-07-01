import api from './api';

// Fetch latest rates for all currencies (EUR base)
export const getRates = async () => {
    const response = await api.get("/currencies/rates");
    return response.data;
};

// Fetch 30-day rate history for a specific currency code
export const getHistory = async (code: string) => {
    const response = await api.get(`/currencies/history/${code}`);
    return response.data;
};

// Fetch weekly percentage change for all currencies
export const getChanges = async () => {
    const response = await api.get("/currencies/changes");
    return response.data;
};

// Fetch the current user's watchlist (requires auth token)
export const getWatchlist = async () => {
    const response = await api.get("/currencies/watchlist");
    return response.data;
};

// Add a currency to the watchlist
export const addToWatchlist = async (currencyCode: string) => {
  const response = await api.post("/currencies/watchlist", { currencyCode });
  return response.data;
};

// Remove a watchlist entry by its id
export const removeFromWatchlist = async (id: number) => {
  const response = await api.delete(`/currencies/watchlist/${id}`);
  return response.data;
};