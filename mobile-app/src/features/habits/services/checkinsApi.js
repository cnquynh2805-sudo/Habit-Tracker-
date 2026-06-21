// Check-in creation against the live Xano backend. The backend's Checkin shape
// is { id, habit_id, date, completedCount, status } with status in
// "Not Started" | "In Progress" | "Completed".
//
// NOTE: per the Today-feature product decision, the `date` field is repurposed
// as a consecutive-day streak counter (not a timestamp). A freshly created
// habit has no streak yet, so we seed it with 0.
import apiClient from "../../../shared/api/apiClient";
import { endpoints } from "../../../shared/api/endpoints";

export const createCheckin = async ({
  habitId,
  status = "In Progress",
  completedCount = 0,
  date = 0,
}) => {
  return apiClient.post(endpoints.checkins.create, {
    habit_id: Number(habitId),
    date,
    completedCount,
    status,
  });
};
