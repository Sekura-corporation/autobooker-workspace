import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export async function getLoyalty() {
  const { data } = await api.get("/loyalty");
  return data;
}

export interface LoyaltyQuery {
  tenantId?: string;
  search?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface LoyaltyRulePayload extends ServiceRecord {
  name: string;
  points?: number;
  discount?: number;
}

export async function getLoyaltySummary(tenantId?: string) {
  const { data } = await api.get<ServiceRecord>("/loyalty/summary", {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function listLoyaltyRules(params: LoyaltyQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/loyalty/rules", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createLoyaltyRule(
  payload: LoyaltyRulePayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/loyalty/rules", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateLoyaltyRule(
  ruleId: string,
  payload: Partial<LoyaltyRulePayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/loyalty/rules/${ruleId}`,
    payload,
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

export async function recordLoyaltyEvent(
  payload: ServiceRecord,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/loyalty/events", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function redeemLoyaltyBenefit(
  customerId: string,
  payload: ServiceRecord,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>(
    `/loyalty/customers/${customerId}/redeem`,
    payload,
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

const loyaltyService = {
  getLoyaltySummary,
  listLoyaltyRules,
  createLoyaltyRule,
  updateLoyaltyRule,
  recordLoyaltyEvent,
  redeemLoyaltyBenefit,
  getLoyalty,
};

export default loyaltyService;
