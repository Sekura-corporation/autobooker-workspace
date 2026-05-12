import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export async function getSettings(tenantId?: string) {
  const { data } = await api.get<ServiceRecord>("/settings", {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateSettings(
  payload: ServiceRecord,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>("/settings", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function resetSettings(tenantId?: string) {
  const { data } = await api.post<ServiceRecord>(
    "/settings/reset",
    {},
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

export async function updateNotificationSettings(
  payload: ServiceRecord,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    "/settings/notifications",
    payload,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

const settingsService = {
  getSettings,
  updateSettings,
  resetSettings,
  updateNotificationSettings,
};

export default settingsService;
