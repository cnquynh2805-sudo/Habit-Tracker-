import axios, { AxiosError } from "axios";

import i18n from "../i18n";
import { useAppStore } from "../stores/useAppStore";

export const AUTH_TOKEN_KEY = "@auth_token";

let isRateLimited = false;
let rateLimitResetTime = 0;

const apiClient = axios.create({
  baseURL: "https://x8ki-letl-twmt.n7.xano.io/api:EDyDyMOI",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to block requests if rate limited
apiClient.interceptors.request.use(
  (config) => {
    if (isRateLimited) {
      const now = Date.now();
      if (now < rateLimitResetTime) {
        return Promise.reject(new Error("API requests are temporarily halted due to rate limits (429)."));
      } else {
        isRateLimited = false;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unwrap the response so callers receive the payload directly.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      if (!isRateLimited) {
        isRateLimited = true;
        rateLimitResetTime = Date.now() + 60000; // 60 seconds halt
        console.log("Xano Rate Limit (429) hit. Halting subsequent API requests for 60 seconds.");
        
        // Show user-facing custom alert
        useAppStore.getState().showGlobalAlert({
          title: i18n.t("common.error") || "Error",
          message: i18n.t("common.rateLimitError") || "Rate limit exceeded. API requests are temporarily paused. Actions will be saved locally.",
        });
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
