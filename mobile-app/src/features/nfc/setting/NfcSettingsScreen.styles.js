/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Màn hình loading lúc chờ dữ liệu
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9F6", // Nền nhạt thiên tự nhiên giống trong ảnh
  },

  // Container chính toàn màn hình
  container: {
    flex: 1,
    backgroundColor: "#F8F9F6",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Tiêu đề lớn "NFC Settings" sử dụng font đậm, màu xanh đen tối giản
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3732",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 24,
  },

  // Khu vực hiển thị khi đang quét thẻ NFC (Hiện tại đưa lên đầu trang)
  scanInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0EC",
    padding: 14,
    borderRadius: 100,
    marginBottom: 20, // Khoảng cách tạo độ thoáng với khối nhập dữ liệu dưới
    borderWidth: 1,
    borderColor: "#C3D6CC",
  },
  scanText: {
    color: "#3B604D",
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  // Khối Card cấu hình (Box) - bo góc rộng và viền siêu mảnh cực sang
  box: {
    backgroundColor: "#F0F1EE", // Màu nền giống block text gợi ý trong hình
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E4E6E1",
  },

  // Tiêu đề các mục (Tag label, Configure tag...) - Chữ xám đậm, gọn gàng
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D3732",
    marginBottom: 10,
    marginTop: 6,
    textAlign: "left", // Đảm bảo các nhãn tiêu đề luôn căn trái
  },

  // Tiêu đề phụ "Or assign to a habit"
  sectionSubTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C8B82",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },

  // Ô nhập tên thẻ (TextInput) - Màu trắng tinh khôi, bo tròn hoàn toàn dạng viên thuốc
  textInput: {
    backgroundColor: "#FFFFFF",
    color: "#2D3732",
    borderRadius: 100, // Tạo hình viên thuốc bo tròn tuyệt đối
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E4E6E1",
    marginBottom: 16,
  },

  // Nút bấm chính "Configure as MULTIPLE" - Màu xanh Sage đặc trưng giống nút Save/Mindfulness
  btnPrimary: {
    backgroundColor: "#3B604D", // Màu xanh chủ đạo trong ảnh của bạn
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  // Các nút chọn Habit lẻ - CĂN TRÁI TRONG COMPONENT
  btnSecondary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E4E6E1",
    alignItems: "flex-start", // Đổi sang flex-start để đẩy tên Habit sang bên trái
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: "#4D7460", // Chữ màu xanh dịu giống chữ "Cancel"
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left", // Đảm bảo chữ bắt đầu từ lề trái
  },

  // Khi chưa có thẻ nào được cấu hình
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4E6E1",
    borderStyle: "dashed",
    marginTop: 8,
  },
  emptyText: {
    color: "#7C8B82",
    fontSize: 14,
  },

  // Dòng hiển thị danh sách các thẻ đã cấu hình
  mappingRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EAECE8",
  },
  // Khối chứa thông tin thẻ - CĂN TRÁI TRONG COMPONENT
  mappingInfo: {
    flex: 1,
    paddingRight: 12,
    alignItems: "flex-start", // Đổi sang flex-start để ép text tên thẻ và ID dạt trái hoàn toàn
  },
  mappingTitle: {
    color: "#2D3732",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "left",
  },
  mappingSubtitle: {
    color: "#3B604D", // Hiện nổi bật loại tag bằng màu chủ đạo
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "left",
  },
  mappingId: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "left",
  },

  // Nút hủy liên kết (Unlink) - Chuyển sang dạng nút nền nhạt chữ đỏ dịu mắt để không phá vỡ giao diện pastel
  btnDanger: {
    backgroundColor: "#FEE2E2",
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  btnDangerText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },
});
