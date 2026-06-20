import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";

export const AUTH_TOKEN_KEY = "@auth_token";

const apiClient = axios.create({
  baseURL: "https://x8ki-letl-twmt.n7.xano.io/api:EDyDyMOI",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


// Unwrap the response so callers receive the payload directly.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => Promise.reject(error),
);

export default apiClient;
