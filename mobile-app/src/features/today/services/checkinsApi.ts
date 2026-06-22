import type { Checkin, CheckinInput } from "../types/checkin";

import apiClient from "@/shared/api/apiClient";
import { endpoints } from "@/shared/api/endpoints";

// apiClient's response interceptor already unwraps `response.data`,
// so each call resolves directly to the payload.

export function listCheckins(): Promise<Checkin[]> {
  return apiClient.get(endpoints.checkins.list);
}

export function getCheckin(id: number): Promise<Checkin> {
  return apiClient.get(endpoints.checkins.detail(id.toString()));
}

export function createCheckin(input: CheckinInput): Promise<Checkin> {
  return apiClient.post(endpoints.checkins.create, input);
}

// Partial edit (PATCH).
export function updateCheckin(
  id: number,
  input: Partial<CheckinInput>,
): Promise<Checkin> {
  return apiClient.patch(endpoints.checkins.update(id.toString()), input);
}

// Full replace (PUT).
export function replaceCheckin(
  id: number,
  input: CheckinInput,
): Promise<Checkin> {
  return apiClient.put(endpoints.checkins.update(id.toString()), input);
}

export function deleteCheckin(id: number): Promise<void> {
  return apiClient.delete(endpoints.checkins.remove(id.toString()));
}
