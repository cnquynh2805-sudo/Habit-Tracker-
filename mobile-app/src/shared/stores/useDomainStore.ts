/**
 * useDomainStore.ts
 *
 * ARCHITECTURE NOTE:
 * This store is the single source of truth for RAW domain data:
 *   - habits[]     (all active habits)
 *   - goals[]      (all goals)
 *   - checkins[]   (limited to the last 90 days for performance)
 *
 * It is COMPLETELY SEPARATE from useAppStore (which owns global UI state).
 * All computed/derived values (streaks, heatmap, weekly progress, etc.)
 * are calculated in derivedStateEngine.js as pure functions and consumed
 * via useMemo() in screen components.
 *
 * Patterns applied:
 *  - AbortController to cancel in-flight requests on re-fetch
 *  - Deduplication: if already loading, skip redundant calls
 *  - 5-minute cache TTL (unless force=true)
 *  - AsyncStorage persistence for offline-first experience
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import apiClient from "@/shared/api/apiClient";
import { endpoints } from "@/shared/api/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawHabit {
  id: number;
  name: string;
  category?: string;
  frequency?: string;
  daysOfWeek?: string[];
  targetPerDay?: number;
  isActive?: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface RawGoal {
  id: number;
  habit_id?: number;
  targetType?: string;
  targetValue?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface RawCheckin {
  id: number | string;
  habit_id: number;
  date_only?: string;
  date?: string;
  completedCount?: number;
  [key: string]: any;
}

interface DomainState {
  habits: RawHabit[];
  goals: RawGoal[];
  checkins: RawCheckin[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchDomainData: (force?: boolean) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

// We track the active AbortController outside state to avoid serialization issues
let activeController: AbortController | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CHECKIN_LOOKBACK_DAYS = 90;

export const useDomainStore = create<DomainState>()(
  persist(
    (set, get) => ({
      habits: [],
      goals: [],
      checkins: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchDomainData: async (force = false) => {
        const { isLoading, lastFetched } = get();
        const now = Date.now();

        // Deduplication: bail out if already loading or cache is fresh
        if (isLoading) return;
        if (!force && lastFetched && now - lastFetched < CACHE_TTL_MS) return;

        // Cancel any previous in-flight request
        if (activeController) {
          activeController.abort();
        }
        activeController = new AbortController();
        const { signal } = activeController;

        set({ isLoading: true, error: null });

        try {
          // Build 90-day window for checkins
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - CHECKIN_LOOKBACK_DAYS);
          const startDateStr = startDate.toISOString().split("T")[0];
          const endDateStr = endDate.toISOString().split("T")[0];

          // Fetch habits, goals, and time-windowed checkins in parallel
          const [habitsRes, goalsRes, checkinsRes] = await Promise.allSettled([
            apiClient.get(endpoints.habits.list, { signal }) as Promise<
              RawHabit[]
            >,
            apiClient.get(endpoints.goals.list, { signal }) as Promise<
              RawGoal[]
            >,
            apiClient.get(endpoints.checkins.list, {
              params: {
                start_date: startDateStr,
                end_date: endDateStr,
              },
              signal,
            }) as Promise<RawCheckin[]>,
          ]);

          // If request was aborted mid-flight, do nothing
          if (signal.aborted) return;

          // Check if any request was rejected due to 429 rate limiting
          const isRateLimitError = [habitsRes, goalsRes, checkinsRes].some(
            (res) =>
              res.status === "rejected" &&
              (res.reason?.message?.includes("429") ||
               res.reason?.response?.status === 429)
          );

          const habits =
            habitsRes.status === "fulfilled" && Array.isArray(habitsRes.value)
              ? habitsRes.value
              : get().habits;

          const goals =
            goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value)
              ? goalsRes.value
              : get().goals;

          // Merge server checkins with pending offline checkins (id === 0 or ignored)
          let checkins = get().checkins;
          if (checkinsRes.status === "fulfilled" && Array.isArray(checkinsRes.value)) {
            const serverCheckins = checkinsRes.value;
            const offlineCheckins = get().checkins.filter(
              (c) => !c.id || c.id === 0 || c.id === "ignored"
            );
            const mergedCheckins = [...serverCheckins];
            offlineCheckins.forEach((offline) => {
              const hasOnServer = serverCheckins.some(
                (sc) =>
                  Number(sc.habit_id) === Number(offline.habit_id) &&
                  (sc.date_only === offline.date_only ||
                   (sc.date && offline.date && sc.date.split("T")[0] === offline.date.split("T")[0]))
              );
              if (!hasOnServer) {
                mergedCheckins.push(offline);
              }
            });
            checkins = mergedCheckins;
          }

          // Log any individual failures (non-fatal)
          if (habitsRes.status === "rejected") {
            console.warn(
              "[DomainStore] habits fetch failed:",
              habitsRes.reason?.message,
            );
          }
          if (goalsRes.status === "rejected") {
            console.warn(
              "[DomainStore] goals fetch failed:",
              goalsRes.reason?.message,
            );
          }
          if (checkinsRes.status === "rejected") {
            console.warn(
              "[DomainStore] checkins fetch failed:",
              checkinsRes.reason?.message,
            );
          }

          set({
            habits,
            goals,
            checkins,
            isLoading: false,
            lastFetched: isRateLimitError ? get().lastFetched : now,
            error: isRateLimitError
              ? "API requests are temporarily paused due to rate limits. Showing local data."
              : null,
          });
        } catch (err: any) {
          if (err?.name === "CanceledError" || err?.name === "AbortError") {
            // Request was intentionally cancelled — not an error
            set({ isLoading: false });
            return;
          }
          console.error("[DomainStore] fetchDomainData error:", err);
          set({
            error: err?.message || "Failed to load domain data",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "domain-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Persist raw data for offline use; exclude transient loading/error state
      partialize: (state) => ({
        habits: state.habits,
        goals: state.goals,
        checkins: state.checkins,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
