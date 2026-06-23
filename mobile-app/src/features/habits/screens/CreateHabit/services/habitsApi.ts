import { API_BASE_URL } from "./config";
import { Habit } from "./types";

const headers = {
  "Content-Type": "application/json",
};

// Formats clean payload data to send to the Xano server
function makeHabitPayload(habit: Partial<Habit>) {
  return {
    // Keep sending the original ID, but Xano will ignore or store it based on its auto-increment config
    id: String(habit.id),
    name: habit.name,
    category: habit.category,
    frequency: habit.frequency,
    daysOfWeek: habit.frequency === "Custom" ? (habit.daysOfWeek ?? []) : null,
    targetPerDay: habit.targetPerDay ?? 1,
    priority: habit.priority,
    status: habit.status,
    nfcTagId: habit.nfcTagId ?? null,
    nfcTagName: habit.nfcTagName ?? null,
  };
}

async function apiRequest(path: string, options: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    try {
      const json = JSON.parse(text);
      throw new Error(json?.message || text || `API error ${response.status}`);
    } catch {
      throw new Error(text || `API error ${response.status}`);
    }
  }

  return response.json().catch(() => null);
}

export async function getHabitsRemote() {
  return apiRequest("/habits", {
    method: "GET",
  });
}

// 1. CREATE: Post to Xano and capture the auto-incremented server ID into 'serverId'
export async function createHabitRemote(habit: Habit) {
  const responseData = await apiRequest("/habits", {
    method: "POST",
    body: JSON.stringify(makeHabitPayload(habit)),
  });

  // Ensure the response maintains your local string ID,
  // and assigns the generated server ID to 'serverId' for habitsManager to save locally
  if (responseData && responseData.id) {
    const serverGeneratedId = responseData.id;
    responseData.id = String(habit.id);
    responseData.serverId = String(serverGeneratedId);
  }

  return responseData;
}

// 2. UPDATE: Prioritize using 'serverId', fallback to local 'id' if offline/not synced yet
export async function updateHabitRemote(habit: any) {
  const remoteId = habit.serverId || String(habit.id);

  if (!remoteId) {
    throw new Error("Cannot update remote habit without a valid ID");
  }

  return apiRequest(`/habits/${remoteId}`, {
    method: "PATCH",
    body: JSON.stringify(makeHabitPayload(habit)),
  });
}

// 3. DELETE: Extract 'serverId' or 'id' properly from either a habit object or a string ID
export async function deleteHabitRemote(habit: any) {
  const remoteId =
    typeof habit === "object"
      ? habit.serverId || String(habit.id)
      : String(habit);

  return apiRequest(`/habits/${remoteId}`, {
    method: "DELETE",
  });
}
