import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createCheckin,
  listCheckins,
  updateCheckin,
} from "../services/checkinsApi";
import { listHabits } from "../services/habitsApi";
import {
  CHECKINS_STORAGE_PREFIX,
  CHECKIN_STATUS,
  deriveStatus,
  getTodayKey,
  isScheduledOn,
} from "../utils/today";

const UNDO_WINDOW_MS = 8000;
const HAPPY_MS = 2500;
const HABITS_CACHE_KEY = "@today_habits_cache";

// Mascot states map 1:1 to the gif assets in src/assets/mascot.
export const MASCOT = {
  idle: "idle",
  happy: "happy",
  waiting: "waiting",
  doubt: "doubt",
};

// Note: `date` is repurposed as a consecutive-day streak counter (per product
// decision); `dayKey` is a client-only marker of which calendar day the current
// progress belongs to, used to detect day rollover / missed habits.
function buildCheckin(habit) {
  return {
    serverId: null,
    habit_id: Number(habit.id) || 0,
    date: 0,
    completedCount: 0,
    status: CHECKIN_STATUS.notStarted,
    dayKey: getTodayKey(),
  };
}

// A habit shows on Today if it's Active, checkin-able, and scheduled for the
// current weekday (daysOfWeek includes today, or it's a daily habit).
function isTodayHabit(habit) {
  return (
    (habit.status || "Active") === "Active" &&
    habit.canCheckin !== false &&
    isScheduledOn(habit)
  );
}

export function useTodayCheckins() {
  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState({});
  const [mascot, setMascot] = useState(MASCOT.idle);
  const [undo, setUndo] = useState(null); // { habitId, messageKey }
  const [isLoading, setIsLoading] = useState(true);
  const [confirmHabit, setConfirmHabit] = useState(null);

  const storageKey = `${CHECKINS_STORAGE_PREFIX}${getTodayKey()}`;

  // Refs mirror state so timers/async callbacks never read stale values.
  const checkinsRef = useRef(checkins);
  const habitsRef = useRef(habits);
  const flushingRef = useRef(0);
  const pendingRef = useRef(null); // { habitId, entry, prev, timer }
  const happyTimerRef = useRef(null);
  const setCountTimeoutRef = useRef(null);

  const restingMascot = useCallback(() => {
    const list = habitsRef.current;
    const map = checkinsRef.current;
    const hasIncomplete = list.some(
      (h) =>
        (map[h.id]?.completedCount || 0) < Math.max(1, h.targetPerDay || 1),
    );
    return hasIncomplete ? MASCOT.doubt : MASCOT.idle;
  }, []);

  const settleMascot = useCallback(() => {
    if (flushingRef.current > 0) return; // stay "waiting" while syncing
    setMascot(restingMascot());
  }, [restingMascot]);

  const persist = useCallback(
    (next) => {
      checkinsRef.current = next;
      setCheckins(next);
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch((e) =>
        console.log("Error saving checkins:", e),
      );
    },
    [storageKey],
  );

  const reload = useCallback(async () => {
    try {
      // Read from the server (GET /habits + GET /checkins) plus the local cache
      // (needed for the day-rollover / streak markers the server can't store).
      const [habitList, checkinList, cacheRaw] = await Promise.all([
        listHabits(),
        listCheckins(),
        AsyncStorage.getItem(storageKey),
      ]);
      const todayHabits = (habitList || []).filter(isTodayHabit);
      const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
      const todayKey = getTodayKey();

      // Latest server check-in per habit (highest id wins).
      const serverByHabit = {};
      (checkinList || []).forEach((c) => {
        const prev = serverByHabit[c.habit_id];
        if (!prev || (c.id || 0) >= (prev.id || 0))
          serverByHabit[c.habit_id] = c;
      });

      const next = {};
      todayHabits.forEach((h) => {
        const target = Math.max(1, h.targetPerDay || 1);
        const server = serverByHabit[h.id];
        const cached = cache[h.id];
        const serverId = cached?.serverId ?? server?.id ?? null;
        const habitId = Number(h.id) || 0;

        if (cached && cached.dayKey === todayKey) {
          // Local cache holds today's progress (incl. unsynced edits).
          next[h.id] = {
            serverId,
            habit_id: habitId,
            date: cached.date || 0,
            completedCount: cached.completedCount || 0,
            status: cached.status || CHECKIN_STATUS.notStarted,
            dayKey: todayKey,
          };
        } else if (cached && cached.dayKey && cached.dayKey !== todayKey) {
          // The day rolled over: reset to a fresh "Not Started" day, keeping the
          // streak only if the previous day was completed.
          const wasCompleted = (cached.completedCount || 0) >= target;
          next[h.id] = {
            serverId,
            habit_id: habitId,
            date: wasCompleted ? cached.date || 0 : 0,
            completedCount: 0,
            status: CHECKIN_STATUS.notStarted,
            dayKey: todayKey,
          };
        } else {
          // First load on this device: trust the server snapshot as today's.
          const count = server?.completedCount || 0;
          next[h.id] = {
            serverId: server?.id ?? null,
            habit_id: habitId,
            date: server?.date || 0,
            completedCount: count,
            status: server?.status || deriveStatus(count, target),
            dayKey: todayKey,
          };
        }
      });

      setHabits(todayHabits);
      habitsRef.current = todayHabits;
      AsyncStorage.setItem(HABITS_CACHE_KEY, JSON.stringify(todayHabits)).catch(
        () => { },
      );
      persist(next); // also caches the check-in map for offline reads
    } catch (e) {
      console.log("Error loading from server, falling back to cache:", e);
      // Offline fallback: last cached habits + check-in map.
      try {
        const [habitsCache, checkinsCache] = await Promise.all([
          AsyncStorage.getItem(HABITS_CACHE_KEY),
          AsyncStorage.getItem(storageKey),
        ]);
        const cachedHabits = habitsCache ? JSON.parse(habitsCache) : [];
        const cachedCheckins = checkinsCache ? JSON.parse(checkinsCache) : {};
        setHabits(cachedHabits);
        habitsRef.current = cachedHabits;
        checkinsRef.current = cachedCheckins;
        setCheckins(cachedCheckins);
      } catch (cacheErr) {
        console.log("Error reading cache:", cacheErr);
      }
    } finally {
      setIsLoading(false);
      settleMascot();
    }
  }, [storageKey, persist, settleMascot]);

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
    return () => {
      if (pendingRef.current?.timer) clearTimeout(pendingRef.current.timer);
      if (happyTimerRef.current) clearTimeout(happyTimerRef.current);
      if (setCountTimeoutRef.current) clearTimeout(setCountTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push a single check-in to the server (create first time, then patch).
  const flushToServer = useCallback(
    async (habitId, entry) => {
      flushingRef.current += 1;
      setMascot(MASCOT.waiting);
      let serverId = null;
      let payload = null;
      try {
        const d = new Date();
        const dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        payload = {
          habit_id: entry.habit_id,
          date: entry.date,
          date_only: dateOnly,
          completedCount: entry.completedCount,
          status: entry.status,
        };
        // Resolve the server id from the latest state, not the captured
        // closure: a superseded action may have created the record already.
        serverId =
          checkinsRef.current[habitId]?.serverId ?? entry.serverId;
        if (serverId) {
          await updateCheckin(serverId, payload);
        } else {
          const created = await createCheckin(payload);
          const newServerId = created?.id ?? null;
          if (newServerId != null) {
            const current = checkinsRef.current[habitId];
            // Only attach the id if this habit's entry hasn't been replaced.
            if (current && current.dayKey === entry.dayKey) {
              persist({
                ...checkinsRef.current,
                [habitId]: { ...current, serverId: newServerId },
              });
            }
          }
        }
      } catch (e) {
        // Offline / server error: keep local; next change retries.
        const endpoint = serverId ? `PATCH /checkins/${serverId}` : "POST /checkins";
        console.log(`Error syncing checkin at endpoint [${endpoint}]:`, {
          error: e?.message || String(e),
          status: e?.response?.status,
          payload,
        });
      } finally {
        flushingRef.current -= 1;
        settleMascot();
      }
    },
    [persist, settleMascot],
  );

  // Commit the currently pending change to the server right now.
  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    if (pending.timer) clearTimeout(pending.timer);
    pendingRef.current = null;
    setUndo(null);
    flushToServer(pending.habitId, pending.entry);
  }, [flushToServer]);

  // Apply a local change, show the undo bar, and schedule the deferred sync.
  const applyChange = useCallback(
    (habit, completedCount, messageKey) => {
      const habitId = habit.id;
      const target = Math.max(1, habit.targetPerDay || 1);
      const prev = checkinsRef.current[habitId] || buildCheckin(habit);

      // A new action supersedes any pending one: commit the old, start fresh.
      if (pendingRef.current) flushPending();

      const newCount = Math.max(0, completedCount);
      const wasCompleted = (prev.completedCount || 0) >= target;
      const nowCompleted = newCount >= target;
      // Streak (stored in `date`): +1 when a habit is finished, -1 if undone.
      let streak = prev.date || 0;
      if (!wasCompleted && nowCompleted) streak += 1;
      else if (wasCompleted && !nowCompleted) streak = Math.max(0, streak - 1);

      const entry = {
        ...prev,
        completedCount: newCount,
        date: streak,
        status: deriveStatus(newCount, target),
        dayKey: getTodayKey(),
      };
      persist({ ...checkinsRef.current, [habitId]: entry });

      // Mascot celebrates briefly, then settles.
      if (happyTimerRef.current) clearTimeout(happyTimerRef.current);
      setMascot(MASCOT.happy);
      happyTimerRef.current = setTimeout(() => settleMascot(), HAPPY_MS);

      const timer = setTimeout(() => {
        pendingRef.current = null;
        setUndo(null);
        flushToServer(habitId, entry);
      }, UNDO_WINDOW_MS);

      pendingRef.current = { habitId, entry, prev, timer };
      setUndo({ habitId, messageKey });
    },
    [persist, flushPending, flushToServer, settleMascot],
  );

  const incrementCount = useCallback(
    (habit) => {
      const target = Math.max(1, habit.targetPerDay || 1);
      const current = checkinsRef.current[habit.id]?.completedCount || 0;
      if (current >= target) return;
      const next = Math.min(current + 1, target);
      applyChange(
        habit,
        next,
        next >= target ? "today.undoMsg.markedDone" : "today.undoMsg.checkedIn",
      );
    },
    [applyChange],
  );

  const setCount = useCallback(
    (habit, value) => {
      const target = Math.max(1, habit.targetPerDay || 1);
      const parsed = Math.max(0, parseInt(value, 10) || 0);
      const finalValue = Math.min(parsed, target);
      const current = checkinsRef.current[habit.id]?.completedCount || 0;
      if (finalValue === current) return;

      if (finalValue >= target) {
        if (setCountTimeoutRef.current) clearTimeout(setCountTimeoutRef.current);
        setCountTimeoutRef.current = setTimeout(() => {
          setConfirmHabit(habit);
        }, 500);
      } else {
        applyChange(habit, finalValue, "today.undoMsg.progressSaved");
      }
    },
    [applyChange],
  );

  const markDone = useCallback(
    (habit) => {
      const target = Math.max(1, habit.targetPerDay || 1);
      const current = checkinsRef.current[habit.id]?.completedCount || 0;
      if (current >= target) return;
      applyChange(habit, target, "today.undoMsg.markedDone");
    },
    [applyChange],
  );

  const undoLast = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return false;
    if (pending.timer) clearTimeout(pending.timer);
    if (happyTimerRef.current) clearTimeout(happyTimerRef.current);
    pendingRef.current = null;
    persist({ ...checkinsRef.current, [pending.habitId]: pending.prev });
    setUndo(null);
    settleMascot();
    return true;
  }, [persist, settleMascot]);

  // Split habits into the To-Do and Done buckets for the screen.
  const { todo, done } = useMemo(() => {
    const todoList = [];
    const doneList = [];
    const currentHour = new Date().getHours();
    const todayStr = getTodayKey();

    habits.forEach((h) => {
      const checkin = checkins[h.id] || buildCheckin(h);
      const target = Math.max(1, h.targetPerDay || 1);

      // Xano's created_at is typically a Unix timestamp in milliseconds.
      const createdDate = h.createdAt ? new Date(h.createdAt) : null;
      const isCreatedToday = createdDate ? getTodayKey(createdDate) === todayStr : false;
      const isLate = currentHour >= 22;

      const item = {
        habit: h,
        checkin,
        target,
        // Habit is overdue if it is not completed, it's late in the day (after 10 PM), and it wasn't just created today.
        overdue: checkin.completedCount < target && isLate && !isCreatedToday,
        streak: checkin.date || 0,
      };
      if (checkin.completedCount >= target) doneList.push(item);
      else todoList.push(item);
    });
    return { todo: todoList, done: doneList };
  }, [habits, checkins]);

  const completedCount = done.length;
  const totalCount = habits.length;
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    isLoading,
    todo,
    done,
    mascot,
    undo,
    completedCount,
    totalCount,
    atRiskCount: todo.length,
    progressPct,
    reload,
    incrementCount,
    setCount,
    markDone,
    undoLast,
    confirmHabit,
    setConfirmHabit,
  };
}
