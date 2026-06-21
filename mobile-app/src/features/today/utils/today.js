// Time-of-day greeting key (resolved through i18n by the screen).
export function getGreetingKey(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "today.greeting.morning";
  if (hour < 18) return "today.greeting.afternoon";
  if (hour < 22) return "today.greeting.evening";
  return "today.greeting.night";
}

// Local YYYY-MM-DD used to scope a day's check-ins in AsyncStorage.
export function getTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Today's weekday as the short code used by Habit.daysOfWeek (Mon..Sun).
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function getWeekday(date = new Date()) {
  return WEEKDAYS[date.getDay()];
}

// Whether a habit is scheduled for the given day. Daily habits (no daysOfWeek)
// run every day; otherwise the weekday must be in the habit's daysOfWeek list.
export function isScheduledOn(habit, date = new Date()) {
  const dow = habit?.daysOfWeek;
  if (Array.isArray(dow) && dow.length > 0) {
    return dow.includes(getWeekday(date));
  }
  return true;
}

// Start-of-day timestamp (ms) sent to the API as the check-in `date`.
export function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const CHECKINS_STORAGE_PREFIX = "@checkins_";
export const HABITS_STORAGE_KEY = "@habits_list";

// Check-in status mirrors the Habit Tracker Swagger enum.
export const CHECKIN_STATUS = {
  notStarted: "Not Started",
  inProgress: "In Progress",
  completed: "Completed",
};

// Derive a check-in status from progress vs. the habit's daily target.
export function deriveStatus(completedCount, targetPerDay) {
  const target = Math.max(1, targetPerDay || 1);
  if (completedCount <= 0) return CHECKIN_STATUS.notStarted;
  if (completedCount >= target) return CHECKIN_STATUS.completed;
  return CHECKIN_STATUS.inProgress;
}
