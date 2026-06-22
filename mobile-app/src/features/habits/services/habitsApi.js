// Habit CRUD against the live Xano backend (see api-documentation/openapi.yaml
// for the intended field shapes). The live backend stores `daysOfWeek` as a
// comma-separated string ("Mon,Wed") and ids as integers, while the app works
// with a `daysOfWeek` array and string ids — these mappers bridge the two.
import apiClient from "../../../shared/api/apiClient";
import { endpoints } from "../../../shared/api/endpoints";

// API habit -> local app shape used by the screens.
export const fromApiHabit = (h) => {
  const status = h.status || "Active";
  let daysOfWeek = null;
  if (typeof h.daysOfWeek === "string" && h.daysOfWeek.trim()) {
    daysOfWeek = h.daysOfWeek
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
  } else if (Array.isArray(h.daysOfWeek)) {
    daysOfWeek = h.daysOfWeek;
  }

  return {
    id: String(h.id),
    name: h.name,
    category: h.category,
    frequency: h.frequency || "Daily",
    daysOfWeek,
    targetPerDay: Number(h.targetPerDay) || 1,
    priority: h.priority || "Medium",
    status,
    canCheckin: status === "Active",
    createdAt: h.created_at || h.createdAt,
  };
};

// Local app shape -> API HabitInput payload (required: name, category,
// frequency, targetPerDay, priority, status).
export const toApiHabit = (local) => ({
  name: (local.name || "").trim(),
  category: local.category,
  frequency: local.frequency,
  daysOfWeek: Array.isArray(local.daysOfWeek)
    ? local.daysOfWeek.join(",")
    : local.daysOfWeek || "",
  targetPerDay: parseInt(local.targetPerDay, 10) || 1,
  priority: local.priority,
  status: local.status || "Active",
});

export const listHabits = async () => {
  const data = await apiClient.get(endpoints.habits.list);
  // Xano returns { value: [...], Count: N } — handle both shapes
  const arr = Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : [];
  return arr.map(fromApiHabit);
};

export const createHabit = async (local) => {
  const created = await apiClient.post(
    endpoints.habits.create,
    toApiHabit(local),
  );
  return fromApiHabit(created);
};

export const updateHabit = async (id, local) => {
  const updated = await apiClient.patch(
    endpoints.habits.update(String(id)),
    toApiHabit(local),
  );
  return fromApiHabit(updated);
};

export const deleteHabit = async (id) => {
  await apiClient.delete(endpoints.habits.remove(String(id)));
};
