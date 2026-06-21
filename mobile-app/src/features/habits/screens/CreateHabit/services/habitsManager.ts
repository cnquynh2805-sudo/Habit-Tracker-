import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit } from "./types";
import { createHabitRemote, deleteHabitRemote, updateHabitRemote } from "./habitsApi";
import { isOnline } from "./config";

const HABITS_KEY = "@habits_list";

// 1. LẤY TOÀN BỘ DANH SÁCH HABIT (READ)
export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Error reading habits from storage:", error);
    return [];
  }
}

// 2. LẤY CHI TIẾT THÓI QUEN THEO ID DUY NHẤT (STRING)
export async function getHabitById(id: string): Promise<Habit | undefined> {
  const habits = await getHabits();
  return habits.find((h) => String(h.id) === String(id));
}

// 3. TẠO MỚI HABIT (CREATE)
export async function createHabit(habitData: Partial<Habit>): Promise<Habit | null> {
  console.log("=== [START STORAGE]: KHỞI CHẠY HÀM TẠO HABIT MỚI ===");
  try {
    const habits = await getHabits();
    
    const newName = (habitData.name || "").trim();
    if (!newName) throw new Error("EMPTY_NAME");

    const isDuplicate = habits.some(
      (h) => h.name && h.name.trim().toLowerCase() === newName.toLowerCase()
    );
    if (isDuplicate) {
      console.error(`❌ LỖI: Thói quen mang tên "${newName}" đã tồn tại!`);
      throw new Error("DUPLICATE_NAME"); 
    }
    
    // 1. Khởi tạo ID String duy nhất tại local
    const uniqueId = Date.now().toString();
    let newHabit: any = {
      id: uniqueId, 
      serverId: null, // Ban đầu chưa có ID server
      name: newName,
      category: habitData.category || "Mindfulness",
      frequency: habitData.frequency || "Daily",
      daysOfWeek: habitData.daysOfWeek || null,
      targetPerDay: habitData.targetPerDay || 1, 
      priority: habitData.priority || "Medium",
      status: habitData.status || "Active",
      createdAt: new Date().toISOString(),
      syncStatus: "pending",
    };

    // Bước 1: Lưu ngay vào máy cục bộ để UI phản hồi lập tức
    habits.push(newHabit);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    console.log("✅ Đã tạo thói quen ở Local thành công. ID Duy Nhất:", uniqueId);

    // Bước 2: Đẩy lên Server Xano
    if (await isOnline()) {
      try {
        console.log(`📡 Đang gửi dữ liệu TẠO MỚI lên Server Xano với ID cố định: ${uniqueId}...`);
        
        // Gọi API và hứng lấy kết quả đã được habitsApi.ts chuẩn hóa (chứa cả id local và serverId)
        const apiResult = await createHabitRemote(newHabit);
        
        if (apiResult && apiResult.serverId) {
          const currentHabits = await getHabits();
          const syncIndex = currentHabits.findIndex((h) => String(h.id) === String(uniqueId));
          if (syncIndex >= 0) {
            // Cập nhật cả trạng thái sync lẫn số serverId (ví dụ 47) vào bộ nhớ máy
            currentHabits[syncIndex].syncStatus = "synced";
            currentHabits[syncIndex].serverId = String(apiResult.serverId);
            await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(currentHabits));
            
            // Cập nhật cho đối tượng trả về UI
            newHabit.syncStatus = "synced";
            newHabit.serverId = String(apiResult.serverId);
            console.log(`✅ Server đồng bộ hoàn tất. ID Local: ${uniqueId} | ServerID: ${apiResult.serverId}`);
          }
        }
      } catch (apiErr) {
        console.warn("⚠️ Mạng lỗi, bản ghi được treo ở chế độ 'pending' để Sync Engine xử lý sau.", apiErr);
      }
    }
    return newHabit;
  } catch (error) {
    console.error("❌ Lỗi luồng tạo Habit:", error);
    throw error;
  }
}

// 4. CẬP NHẬT HABIT (UPDATE)
export async function updateHabit(habitId: string, habitData: Partial<Habit>): Promise<void> {
  console.log(`=== [START STORAGE]: TIẾN HÀNH SỬA HABIT CÓ ID: ${habitId} ===`);
  try {
    const habits = await getHabits();
    const index = habits.findIndex((h) => String(h.id) === String(habitId));

    if (index < 0) {
      console.error(`❌ Không tìm thấy thói quen cần sửa với ID: ${habitId}`);
      throw new Error("HABIT_NOT_FOUND");
    }

    // Bảo vệ ID chuỗi gốc của máy, giữ lại trường serverId cũ
    const originalLocalId = habits[index].id;
    const currentServerId = habits[index].serverId;

    const updatedHabit = {
      ...habits[index],
      ...habitData,
      id: originalLocalId, 
      serverId: currentServerId, // Không để UI đè mất serverId
      syncStatus: "pending" as const,
    };
    
    habits[index] = updatedHabit;
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    console.log(`✅ Đã ghi nhận chỉnh sửa xuống Local cho ID String: ${updatedHabit.id}`);

    if (await isOnline()) {
      try {
        console.log(`📡 [API PATCH]: Đang gửi lệnh cập nhật lên Server cho ID: ${updatedHabit.id}...`);
        await updateHabitRemote(updatedHabit);
        
        const currentHabits = await getHabits();
        const syncIndex = currentHabits.findIndex((h) => String(h.id) === String(originalLocalId));
        if (syncIndex >= 0) {
          currentHabits[syncIndex].syncStatus = "synced";
          await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(currentHabits));
          console.log(`✅ Đồng bộ cập nhật lên Server thành công cho ID String: ${originalLocalId}`);
        }
      } catch (apiErr) {
        console.warn("⚠️ Server bận, giữ trạng thái pending để tự động đồng bộ lại sau.", apiErr);
      }
    }
  } catch (error) {
    console.error("❌ Lỗi luồng cập nhật Habit:", error);
    throw error;
  }
}

// 5. XÓA HABIT (DELETE)
export async function deleteHabit(habitId: string): Promise<boolean> {
  console.log(`=== [START STORAGE]: TIẾN HÀNH TIẾN TRÌNH XÓA HABIT ID: ${habitId} ===`);
  try {
    const habits = await getHabits();
    const targetHabit = habits.find((h) => String(h.id) === String(habitId));

    if (!targetHabit) {
      console.error(`❌ Không tìm thấy thói quen mục tiêu khớp mã ID: ${habitId} trong hệ thống máy.`); 
      return false; 
    }

    // Bước 1: Xóa khỏi bộ nhớ máy luôn dựa vào ID gốc
    const filteredHabits = habits.filter((h) => String(h.id) !== String(targetHabit.id));
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filteredHabits));
    console.log(`✅ Đã dọn sạch hoàn toàn bản ghi ở Local AsyncStorage.`);

    // Bước 2: Gọi API DELETE lên Server truyền nguyên object targetHabit (để habitsApi tự lấy trường cần thiết)
    if (await isOnline()) {
      try {
        console.log(`📡 [API CALL]: Đang kích hoạt kết nối đẩy API DELETE lên Server...`);
        await deleteHabitRemote(targetHabit);
        console.log(`✅ [SERVER SYNC]: Server đã thực thi xóa thành công.`);
      } catch (apiErr) {
        console.warn("⚠️ Lỗi gọi API xóa từ xa, nhưng Local đã dọn sạch.", apiErr);
      }
    } else {
      console.warn("⚠️ Thiết bị offline, Server sẽ được quét dọn dẹp sau.");
    }
    return true;
  } catch (error) {
    console.error("❌ Lỗi luồng xóa Habit:", error);
    return false;
  }
}

// 6. BACKGROUND SYNC ENGINE
export async function syncOfflineData(): Promise<void> {
  if (!(await isOnline())) return;
  console.log("🔄 [SYNC ENGINE]: Đang chạy quét và đồng bộ các thay đổi offline...");
  try {
    const habits = await getHabits();
    let hasChanges = false;

    for (let i = 0; i < habits.length; i++) {
      const habit = habits[i];
      if (habit.syncStatus === "pending") {
        try {
          if (habit.serverId) {
            // Bản ghi cũ đã có trên server, chỉ chỉnh sửa nội dung -> Gọi PATCH
            await updateHabitRemote(habit);
          } else {
            // Bản ghi mới tinh tạo lúc offline chưa có serverId -> Gọi POST tạo mới
            const apiResult = await createHabitRemote(habit);
            if (apiResult && apiResult.serverId) {
              habits[i].serverId = String(apiResult.serverId);
            }
          }
          habits[i].syncStatus = "synced";
          hasChanges = true;
        } catch (e) {
          console.error(`❌ Đồng bộ thất bại cho thói quen: ${habit.id}`, e);
        }
      }
    }

    if (hasChanges) {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      console.log("✅ [SYNC ENGINE]: Dữ liệu offline đồng nhất thành công!");
    }
  } catch (error) {
    console.error("❌ Lỗi tiến trình Sync Engine:", error);
  }
}

// 7. HÀM DÙNG KHI NGƯỜI DÙNG XÓA APP / TẢI LẠI APP (ĐỒNG BỘ TỪ SERVER XANO VỀ MÁY)
export async function downloadHabitsFromServer(remoteHabits: any[]): Promise<void> {
  try {
    if (!Array.isArray(remoteHabits)) return;
    
    const formattedHabits: Habit[] = remoteHabits.map((rh) => ({
      // ĐỂ ĐẢM BẢO KHÔNG BỊ PHỤ THUỘC VÀO SỐ 47 SAU NÀY:
      // Ta lấy luôn số 47 (rh.id) làm ID tạm thời cho máy nếu trước đó không lưu chuỗi,
      // Nhưng giải pháp khôn ngoan là lưu song song cả hai.
      id: String(rh.id), 
      serverId: String(rh.id), // Lưu số 47 vào cột serverId
      name: rh.name,
      category: rh.category || "Mindfulness",
      frequency: rh.frequency || "Daily",
      daysOfWeek: rh.daysOfWeek || null,
      targetPerDay: rh.targetPerDay || 1,
      priority: rh.priority || "Medium",
      status: rh.status || "Active",
      createdAt: rh.createdAt || new Date().toISOString(),
      syncStatus: "synced",
    }));

    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(formattedHabits));
    console.log("📥 [DOWNLOAD SYNC]: Đã đồng bộ danh sách từ Xano về máy thành công!");
  } catch (error) {
    console.error("❌ Lỗi luồng download dữ liệu từ Server:", error);
  }
}