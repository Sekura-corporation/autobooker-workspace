import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface PartnershipsQuery {
  tenantId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PartnershipPayload extends ServiceRecord {
  name: string;
  region?: string;
  discount?: number;
}

export async function listPartnerships(params: PartnershipsQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/partnerships", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getPartnership(partnershipId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(
    `/partnerships/${partnershipId}`,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function createPartnership(
  payload: PartnershipPayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/partnerships", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updatePartnership(
  partnershipId: string,
  payload: Partial<PartnershipPayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/partnerships/${partnershipId}`,
    payload,
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

export async function togglePartnershipStatus(
  partnershipId: string,
  active: boolean,
  tenantId?: string,
) {
  return updatePartnership(partnershipId, { active }, tenantId);
}

export async function deletePartnership(
  partnershipId: string,
  tenantId?: string,
) {
  const { data } = await api.delete<ServiceRecord>(
    `/partnerships/${partnershipId}`,
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

const partnershipsService = {
  listPartnerships,
  getPartnership,
  createPartnership,
  updatePartnership,
  togglePartnershipStatus,
  deletePartnership,
};

export default partnershipsService;
