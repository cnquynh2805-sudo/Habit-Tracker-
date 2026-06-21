import { API_BASE_URL } from "./config";
import { Habit } from "./types";

const headers = {
  "Content-Type": "application/json",
};

// Hàm đóng gói dữ liệu sạch để đẩy lên Server Xano
function makeHabitPayload(habit: Partial<Habit>) {
  return {
    // Vẫn gửi ID gốc lên, nhưng vì Xano tự tăng nên nó sẽ bỏ qua hoặc lưu tùy cấu hình của họ
    id: String(habit.id), 
    name: habit.name,
    category: habit.category,
    frequency: habit.frequency,
    daysOfWeek: habit.frequency === "Custom" ? habit.daysOfWeek ?? [] : null,
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

// 1. TẠO MỚI: Đẩy lên Xano và "bốc" lấy con số tự tăng (47) nhét vào serverId
export async function createHabitRemote(habit: Habit) {
  const responseData = await apiRequest("/habits", {
    method: "POST",
    body: JSON.stringify(makeHabitPayload(habit)),
  });

  // 👉 CHỐT CHẶN: Ép response trả về phải giữ nguyên ID chuỗi Local của bạn,
  // và cất số 47 của server vào trường 'serverId' trả về cho habitsManager lưu xuống máy
  if (responseData && responseData.id) {
    const serverGeneratedId = responseData.id; // số 47, 48... của Xano
    responseData.id = String(habit.id);        // Giữ lại chuỗi "178207..."
    responseData.serverId = String(serverGeneratedId); // Gán biến serverId
  }

  return responseData;
}

// 2. CẬP NHẬT: Ưu tiên dùng serverId (số 47), nếu chưa có (offline) thì dùng id local
export async function updateHabitRemote(habit: any) {
  // Check xem object trong máy có serverId (đã sync) chưa, nếu chưa có thì lấy id gốc
  const remoteId = habit.serverId || String(habit.id);
  
  if (!remoteId) {
    throw new Error("Không thể cập nhật từ xa thói quen không có mã ID hợp lệ");
  }
  
  console.log(`📡 [API PATCH]: Đang gửi lệnh UPDATE lên Server Xano cho ID thực tế: ${remoteId}`);
  return apiRequest(`/habits/${remoteId}`, {
    method: "PATCH",
    body: JSON.stringify(makeHabitPayload(habit)),
  });
}

// 3. XÓA: Hàm này nhận vào object habit (hoặc string id), ta chỉnh lại nhận object để bốc serverId cho chuẩn
export async function deleteHabitRemote(habit: any) {
  // Nếu truyền vào cả object (từ manager mới), ta bốc serverId hoặc id. 
  // Nếu truyền vào string (code cũ), nó sẽ lấy chính nó làm id.
  const remoteId = typeof habit === "object" ? (habit.serverId || String(habit.id)) : String(habit);

  console.log(`📡 [API DELETE]: Đang gửi lệnh DELETE lên Server cho thói quen ID: ${remoteId}`);
  return apiRequest(`/habits/${remoteId}`, {
    method: "DELETE",
  });
}