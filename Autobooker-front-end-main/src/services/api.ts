import axios from "axios";
import { mockFetchUser, mockLogin } from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const AUTH_TOKEN_KEY = "@autobooker:token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (USE_MOCK && error.config?.url?.includes("/login")) {
      let email = "";
      let password = "";

      if (error.config.data) {
        const data =
          typeof error.config.data === "string"
            ? JSON.parse(error.config.data)
            : error.config.data;
        email = data.email || "";
        password = data.password || "";
      }

      if (email && password) {
        try {
          const { token, user } = await mockLogin(email, password);
          setAuthToken(token);
          console.log("[MOCK] Login bem-sucedido:", user.email);
          return Promise.resolve({
            data: { token, user },
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config,
          });
        } catch (mockError) {
          console.error("[MOCK] Erro no login:", mockError);
          return Promise.reject(mockError);
        }
      }
    }

    if (USE_MOCK && error.config?.url?.includes("/me")) {
      const token = getAuthToken();
      if (token) {
        try {
          const user = await mockFetchUser(token);
          console.log("[MOCK] User fetched:", user.email);
          return Promise.resolve({
            data: user,
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config,
          });
        } catch (mockError) {
          console.error("[MOCK] Erro ao buscar user:", mockError);
          return Promise.reject(mockError);
        }
      }
    }

    if (error.response?.status === 503 && error.response?.data?.maintenance) {
      if (typeof window !== "undefined") {
        clearAuthToken();
        if (window.location.pathname !== "/manutencao") {
          window.location.href = "/manutencao";
        }
      }
    }

    if (error.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
