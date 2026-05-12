import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface PackagesQuery {
  tenantId?: string;
  search?: string;
  page?: number;
  limit?: number;
  active?: boolean;
}

export interface PackagePayload extends ServiceRecord {
  name: string;
  price?: number;
  services?: string[];
  customizable?: boolean;
}

export async function listPackages(params: PackagesQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/packages", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getPackage(packageId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/packages/${packageId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createPackage(
  payload: PackagePayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/packages", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updatePackage(
  packageId: string,
  payload: Partial<PackagePayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/packages/${packageId}`,
    payload,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function deletePackage(packageId: string, tenantId?: string) {
  const { data } = await api.delete<ServiceRecord>(`/packages/${packageId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function togglePackageStatus(
  packageId: string,
  active: boolean,
  tenantId?: string,
) {
  return updatePackage(packageId, { active }, tenantId);
}

const packagesService = {
  listPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
};

export default packagesService;
