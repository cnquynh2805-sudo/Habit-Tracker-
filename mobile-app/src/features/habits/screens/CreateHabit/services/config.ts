import NetInfo from "@react-native-community/netinfo";

export const API_BASE_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:EDyDyMOI";

export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error("❌ Network check error:", error);
    return false;
  }
}

export async function apiCall(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`📡 API: ${options?.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ API error ${response.status}:`, text);
      throw new Error(`API error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`❌ API call failed: ${endpoint}`, error);
    throw error;
  }
}