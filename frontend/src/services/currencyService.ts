import api from './api'; 

export const getRates = async () => {
    const response = await api.get("/currencies/rates");
    return response.data;
};

export const getHistory = async (code: string) => {
    const response = await api.get(`/currencies/history/${code}`);
    return response.data;
}

export const getWatchlist = async () => {
    const response = await api.get("/currencies/watchlist");
    return response.data;
}

export const addToWatchlist = async (currencyCode: string) => {
  const response = await api.post("/currencies/watchlist", { currencyCode });
  return response.data;
};

export const removeFromWatchlist = async (id: number) => {
  const response = await api.delete(`/currencies/watchlist/${id}`);
  return response.data;
};
