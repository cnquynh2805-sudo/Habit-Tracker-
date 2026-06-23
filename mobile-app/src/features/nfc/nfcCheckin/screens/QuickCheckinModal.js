import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTodayCheckins } from "../../../today/hooks/useTodayCheckins";
import styles from "./QuickCheckinModal.styles";

export default function QuickCheckinModal({ onClose, tagInfo }) {
  const { todo, incrementCount } = useTodayCheckins();

  const currentTagName = tagInfo?.tagName || "Thẻ Đa Năng";

  // ✅ TỐI ƯU UX: Lọc danh sách thói quen thực sự chưa hoàn thành trong ngày hôm nay
  const activeTodoItems = useMemo(() => {
    if (!todo) return [];
    return todo.filter((item) => {
      const completed = item.checkin?.completedCount || 0;
      const target = item.target || 1;
      return completed < target; // Chỉ giữ lại thói quen chưa đạt mục tiêu
    });
  }, [todo]);

  const handleCheckin = (habit) => {
    incrementCount(habit);
    onClose(); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 {currentTagName}</Text>
      <Text style={styles.subtitle}>Chọn một thói quen để hoàn thành nhanh:</Text>

      <ScrollView style={styles.list}>
        {activeTodoItems.length === 0 ? (
          <Text style={styles.emptyText}>
            🎉 Tuyệt vời! Bạn không còn thói quen nào chưa hoàn thành trong lịch trình hôm nay.
          </Text>
        ) : (
          activeTodoItems.map((item) => (
            <TouchableOpacity
              key={item.habit.id}
              style={styles.habitRow}
              onPress={() => handleCheckin(item.habit)}
            >
              <View style={styles.habitInfo}>
                {/* ✅ ĐÃ SỬA: Dự phòng trường title phòng hờ API trả về khác nhau */}
                <Text style={styles.habitName}>
                  {item.habit.name || item.habit.title || "Thói quen không tên"}
                </Text>
                <Text style={styles.habitProgress}>
                  Tiến độ: {item.checkin?.completedCount || 0}/{item.target}
                </Text>
              </View>
              <View style={styles.checkButton}>
                <Text style={styles.checkText}>＋</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Đóng bảng</Text>
      </TouchableOpacity>
    </View>
  );
}