import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface ServicesQuery {
  tenantId?: string;
  search?: string;
  page?: number;
  limit?: number;
  active?: boolean;
}

export interface ServicePayload extends ServiceRecord {
  name: string;
  price?: number;
  durationMinutes?: number;
}

export async function listServices(params: ServicesQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/services", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getService(serviceId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/services/${serviceId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createService(
  payload: ServicePayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/services", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateService(
  serviceId: string,
  payload: Partial<ServicePayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/services/${serviceId}`,
    payload,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function deleteService(serviceId: string, tenantId?: string) {
  const { data } = await api.delete<ServiceRecord>(`/services/${serviceId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function toggleServiceStatus(
  serviceId: string,
  active: boolean,
  tenantId?: string,
) {
  return updateService(serviceId, { active }, tenantId);
}

const servicesService = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
};

export default servicesService; // Services service
