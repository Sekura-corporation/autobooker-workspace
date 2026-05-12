import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface VehiclesQuery {
  tenantId?: string;
  search?: string;
  page?: number;
  limit?: number;
  type?: string;
}

export interface VehiclePayload extends ServiceRecord {
  customerId?: string;
  plate: string;
  model?: string;
  type?: string;
  brand?: string;
  color?: string;
  year?: number | string;
  notes?: string;
}

export async function listVehicles(params: VehiclesQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/vehicles", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getVehicle(vehicleId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/vehicles/${vehicleId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createVehicle(
  payload: VehiclePayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/vehicles", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateVehicle(
  vehicleId: string,
  payload: Partial<VehiclePayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/vehicles/${vehicleId}`,
    payload,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function deleteVehicle(vehicleId: string, tenantId?: string) {
  const { data } = await api.delete<ServiceRecord>(`/vehicles/${vehicleId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getVehicleHistory(vehicleId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord[]>(
    `/vehicles/${vehicleId}/history`,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

const vehiclesService = {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleHistory,
};

export default vehiclesService; // Vehicles service
