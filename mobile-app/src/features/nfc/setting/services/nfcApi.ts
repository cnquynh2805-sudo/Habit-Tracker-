// 1. Khai báo URL gốc lấy từ Swagger của bạn
const BASE_URL: string = 'https://x8ki-letl-twmt.n7.xano.io/api:EDyDyMOI';

// Định nghĩa Interface cấu trúc dữ liệu theo đúng schema Xano của bạn
export interface NfcTagPayload {
  created_at?: string; // Cấp tự động bởi Xano hoặc client truyền lên
  tag_id: string;      // Chuỗi mã định danh thẻ
  type: string;        // Loại thẻ
  tag_name: string;    // Tên nhãn của thẻ
  ndef_url: string;    // Đường dẫn deep link gắn vào thẻ
  habit_id: number;    // ID thói quen liên kết
}

/**
 * 2. Hàm POST (Thêm mới/Đăng ký thẻ NFC lên hệ thống)
 * Endpoint: POST /nfc_tags
 */
export const postNfcTagRemote = async (apiBody: NfcTagPayload): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/nfc_tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🚨 [Xano POST Error] Status ${response.status}:`, errorText);
      throw new Error(`Server error status: ${response.status}`);
    }
    
    return await response.json(); 
  } catch (error) {
    console.error('Lỗi hàm postNfcTagRemote:', error);
    throw error;
  }
};

/**
 * 3. Hàm GET (Lấy toàn bộ danh sách thẻ NFC để đồng bộ/kiểm tra trùng)
 * Endpoint: GET /nfc_tags
 */
export const getNfcTagsRemote = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/nfc_tags`);
    
    if (!response.ok) {
      // Đọc trực tiếp phản hồi thô từ Xano (ví dụ: lỗi Token, lỗi Khóa bảo mật...)
      const errorText = await response.text();
      console.error(`🚨 [Xano GET Error] Status ${response.status}:`, errorText);
      throw new Error(`Không thể tải danh sách thẻ (Mã lỗi: ${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Lỗi hàm getNfcTagsRemote:', error);
    throw error;
  }
};

/**
 * 4. Hàm PATCH (Chỉnh sửa thông tin thẻ dựa trên id)
 * Endpoint: PATCH /nfc_tags/{nfc_tags_id}
 */
export const patchNfcTagRemote = async (id: string | number, apiBody: Partial<NfcTagPayload>): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/nfc_tags/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🚨 [Xano PATCH Error] Status ${response.status}:`, errorText);
      throw new Error('Không thể chỉnh sửa thẻ');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Lỗi hàm patchNfcTagRemote:', error);
    throw error;
  }
};

/**
 * 5. Hàm DELETE (Xóa thẻ khỏi hệ thống)
 * Endpoint: DELETE /nfc_tags/{nfc_tags_id}
 */
export const deleteNfcTagRemote = async (id: string | number): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/nfc_tags/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🚨 [Xano DELETE Error] Status ${response.status}:`, errorText);
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.error('Lỗi hàm deleteNfcTagRemote:', error);
    throw error;
  }
};
