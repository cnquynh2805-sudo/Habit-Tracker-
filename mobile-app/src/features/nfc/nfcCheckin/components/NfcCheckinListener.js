import React from "react";
// 🔥 ĐÃ SỬA: Đi lùi 1 cấp ra nfcCheckin -> chui vào hooks -> useNfcDeepLink
import { useNfcDeepLink } from "../hooks/useNfcDeepLink"; 
// 🔥 ĐÃ SỬA: Đi lùi 1 cấp ra nfcCheckin -> chui vào screens -> QuickCheckinModal
import QuickCheckinModal from "../screens/QuickCheckinModal"; 

export default function NfcCheckinListener({ children }) {
  // Lấy dữ liệu trạng thái hiển thị và thông tin thẻ đa năng đã quét
  const { showQuickModal, closeQuickModal, scannedTagInfo } = useNfcDeepLink();

  return (
    <>
      {children}
      
      {/* 🔥 FIX: Sử dụng toán tử 3 ngôi thay vì '&&' để tránh lỗi render text trống trên React Native */}
      {showQuickModal && scannedTagInfo ? (
        <QuickCheckinModal 
          onClose={closeQuickModal} 
          tagInfo={scannedTagInfo} 
        />
      ) : null}
    </>
  );
}