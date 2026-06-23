import { useEffect, useState, useRef } from "react";
import { Alert, Vibration, AppState } from "react-native";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications"; 
import { useTodayCheckins } from "../../../today/hooks/useTodayCheckins";
import useNfcMappings from "../../setting/hooks/useNfcMappings"; 
import { parseNfcUrl } from "../utils/nfcUrlParser";

// 1. Định nghĩa kênh thông báo chuẩn Android (Android Notification Channel)
const ANDROID_CHANNEL_ID = "nfc-checkin-channel";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNfcDeepLink() {
  const { todo, done, incrementCount, isLoading: habitsLoading } = useTodayCheckins();
  const { nfcMappings, loading: mappingsLoading } = useNfcMappings(); 
  
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [scannedTagInfo, setScannedTagInfo] = useState(null); 
  const [pendingUrl, setPendingUrl] = useState(null);

  const isGlobalLoading = habitsLoading || mappingsLoading;
  const latestDataRef = useRef({});

  useEffect(() => {
    latestDataRef.current = { todo, done, isGlobalLoading, nfcMappings, incrementCount };
  }, [todo, done, isGlobalLoading, nfcMappings, incrementCount]);

  // 2. Thiết lập quyền và Khởi tạo Kênh thông báo riêng cho Android
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }

      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: "NFC Check-in Alerts",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    })();
  }, []);

  const processUrl = async (url) => {
    if (!url) return;
    
    const ctx = latestDataRef.current;
    if (ctx.isGlobalLoading) {
      setPendingUrl(url);
      return; 
    }

    const parsed = parseNfcUrl(url);
    if (!parsed) return;

    const urlType = String(parsed.type || "").trim().toLowerCase();
    const rawTagId = parsed.tagId; // Đã đồng bộ chữ thường từ hàm parser mới
    const urlLocalId = parsed.localId;
    const urlServerId = parsed.serverId;

    let matchedTag = null;

    if (ctx.nfcMappings) {
      if (rawTagId) {
        const cleanTagId = String(rawTagId).trim().toLowerCase();
        matchedTag = ctx.nfcMappings[cleanTagId];
      }
      
      if (!matchedTag && urlType === "single") {
        const fallbackConfig = Object.values(ctx.nfcMappings).find(
          (tag) => 
            (urlLocalId && String(tag.habit_id || tag.habitId) === String(urlLocalId)) ||
            (urlServerId && String(tag.serverId) === String(urlServerId))
        );
        
        if (fallbackConfig) {
          matchedTag = {
            ...fallbackConfig,
            tagId: rawTagId || fallbackConfig.tag_id || fallbackConfig.tagId,
            type: fallbackConfig.type || "SINGLE"
          };
        }
      }
    }

    if (!matchedTag) {
      Vibration.vibrate([0, 150, 100, 150]);
      return; 
    }

    const tagType = String(matchedTag.type || urlType || "single").trim().toLowerCase();
    const isBackground = AppState.currentState !== 'active';

    // ─── XỬ LÝ THẺ ĐƠN (SINGLE) ───
    if (tagType === "single") {
      // 🔥 FIX ĐỒNG BỘ: Chấp nhận cả habit_id từ Xano lẫn habitId kiểu cũ
      const targetHabitId = matchedTag.habit_id || matchedTag.habitId;
      if (!targetHabitId) return;

      let targetItem = ctx.todo?.find(item => 
        String(item.habit.id) === String(targetHabitId) || 
        (item.habit.serverId && String(item.habit.serverId) === String(targetHabitId))
      ) || ctx.done?.find(item => 
        String(item.habit.id) === String(targetHabitId) || 
        (item.habit.serverId && String(item.habit.serverId) === String(targetHabitId))
      );

      if (targetItem) {
        const { habit, checkin, target } = targetItem;
        
        if (checkin.completedCount >= target) {
          if (isBackground) {
            await Notifications.scheduleNotificationAsync({
              content: { 
                title: "🎉 Hoàn thành!", 
                body: `Thói quen "${habit.name}" hôm nay đã xong từ trước rồi.`,
                android: { channelId: ANDROID_CHANNEL_ID }
              },
              trigger: null,
            });
          } else {
            Alert.alert("🎉 Hoàn thành!", `Thói quen "${habit.name}" hôm nay đã xong từ trước.`);
          }
          return;
        }

        try {
          await ctx.incrementCount(habit); 
          Vibration.vibrate(400); 

          if (isBackground) {
            await Notifications.scheduleNotificationAsync({
              content: { 
                title: "✅ NFC Check-in Thành Công", 
                body: `Đã ghi nhận tiến độ cho thói quen: ${habit.name}`,
                android: { 
                  channelId: ANDROID_CHANNEL_ID,
                  pressAction: { id: 'default', launchActivity: true }
                }
              },
              trigger: null,
            });
          } else {
            Alert.alert("✅ NFC Check-in", `Đã ghi nhận tiến độ cho: ${habit.name}`);
          }
        } catch (error) {
          Vibration.vibrate([0, 200, 100, 200]); 
        }
      }

    // ─── XỬ LÝ THẺ ĐA NĂNG (MULTIPLE) ───
    } else if (tagType === "multiple") {
      Vibration.vibrate(120);

      if (isBackground) {
        await Notifications.scheduleNotificationAsync({
          content: { 
            title: `🎯 Mở danh sách: ${matchedTag.tag_name || matchedTag.tagName || "Thẻ Đa Năng"}`, 
            body: "Vuốt hoặc nhấn vào đây để chọn nhanh thói quen cần check-in.",
            data: { url: url }, 
            android: { channelId: ANDROID_CHANNEL_ID }
          },
          trigger: null,
        });
      } else {
        setScannedTagInfo(matchedTag);
        setShowQuickModal(true);
      }
    }
  };

  useEffect(() => {
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const urlFromNotification = response.notification.request.content.data?.url;
      if (urlFromNotification) {
        setTimeout(() => processUrl(urlFromNotification), 400);
      }
    });

    const subscription = Linking.addEventListener("url", (event) => {
      processUrl(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) processUrl(url);
    });

    return () => {
      subscription.remove();
      notificationSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isGlobalLoading && pendingUrl) {
      setTimeout(() => {
        processUrl(pendingUrl);
        setPendingUrl(null);
      }, 300);
    }
  }, [isGlobalLoading, pendingUrl]);

  return {
    showQuickModal,
    scannedTagInfo, 
    closeQuickModal: () => {
      setShowQuickModal(false);
      setScannedTagInfo(null);
    },
  };
}