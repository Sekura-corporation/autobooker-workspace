import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface PlansQuery {
  tenantId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PlanPayload extends ServiceRecord {
  name: string;
  price?: number;
  billingCycle?: string;
}

export async function listPlans(params: PlansQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/plans", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getPlan(planId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/plans/${planId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createPlan(payload: PlanPayload, tenantId?: string) {
  const { data } = await api.post<ServiceRecord>("/plans", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updatePlan(
  planId: string,
  payload: Partial<PlanPayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(`/plans/${planId}`, payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function deletePlan(planId: string, tenantId?: string) {
  const { data } = await api.delete<ServiceRecord>(`/plans/${planId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function togglePlanStatus(
  planId: string,
  active: boolean,
  tenantId?: string,
) {
  return updatePlan(planId, { active }, tenantId);
}

export async function listSubscriptions(params: PlansQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/subscriptions", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createSubscription(
  payload: ServiceRecord,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/subscriptions", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function cancelSubscription(
  subscriptionId: string,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>(
    `/subscriptions/${subscriptionId}/cancel`,
    {},
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

const plansService = {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  listSubscriptions,
  createSubscription,
  cancelSubscription,
};

export default plansService;
