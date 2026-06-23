/**
 * Phân tích cú pháp Deep Link từ NFC của Bloom
 * @param {string} url - URL nhận được từ hệ thống (Ví dụ: bloom://nfc?type=single&serverId=12&localId=3)
 * @returns {object|null} - Trả về object chứa toàn bộ params hoặc null
 */
export function parseNfcUrl(url) {
  // 1. Kiểm tra an toàn (bắt cả Bloom:// và bloom://)
  if (!url || !url.toLowerCase().startsWith("bloom://nfc")) return null;

  try {
    const queryString = url.split("?")[1];
    // Nếu URL dạng "bloom://nfc" hoặc "bloom://nfc?" không có param thì trả về object rỗng để check type sau
    if (!queryString) return {};

    // 2. ✅ Bóc tách thủ công để chống crash trên React Native (Thay cho URLSearchParams)
    const params = {};
    queryString.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key && key.trim() !== "") {
        // 🔥 SỬA CHÍ MẠNG: Ép toàn bộ KEY về chữ thường (toLowerCase) để xóa bỏ nỗi lo chữ hoa/thường
        const cleanKey = decodeURIComponent(key).trim().toLowerCase();
        const cleanValue = decodeURIComponent(value || "").trim();
        params[cleanKey] = cleanValue;
      }
    });
    
    // 3. 🔥 SỬA CHÍ MẠNG: Map ngược lại về một Object có cấu trúc thuộc tính cố định
    // Giúp file Hook gọi .tagId, .localId hay .serverId đều trúng đích, không sợ DB trả về kiểu gì.
    const finalId = params.id || params.tagid || params.tag_id;
    
    return {
      type: params.type || "",
      tagId: finalId ? finalId.toLowerCase() : null, // Ép mã tagId về chữ thường để khớp với DB
      localId: params.localid || params.habitid || null,
      serverId: params.serverid || null
    };
  } catch (error) {
    console.error("Lỗi phân tích URL NFC:", error);
    return null;
  }
}