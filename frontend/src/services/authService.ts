import api from "./api";

export const register = async (email: string, password: string) => {
    const response = await api.post("/auth/register", { email, password });
    return response.data
};

export const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password});
    if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
    }
    return response.data;   
};

export const logout = () => {
    localStorage.removeItem("token")
};

export const  isAuthenticated = () => {
    return !!localStorage.getItem("token");
}