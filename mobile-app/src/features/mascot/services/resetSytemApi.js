/* eslint-disable no-undef */
import apiClient from "@/shared/api/apiClient";

export const resetSystemData = async () => {
  return apiClient.post(endpoints.system.reset);
};
