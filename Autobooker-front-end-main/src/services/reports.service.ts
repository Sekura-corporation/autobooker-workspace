import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface ReportsQuery {
  tenantId?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export async function getDashboardSummary(tenantId?: string) {
  const { data } = await api.get<ServiceRecord>("/reports/dashboard", {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getOperationalReport(params: ReportsQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord>("/reports/operational", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getFinancialReport(params: ReportsQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord>("/reports/financial", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getCustomerReport(params: ReportsQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord>("/reports/customers", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getStorePerformance(params: ReportsQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord>("/reports/stores", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getActivityTimeline(params: ReportsQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/reports/activity", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

const reportsService = {
  getDashboardSummary,
  getOperationalReport,
  getFinancialReport,
  getCustomerReport,
  getStorePerformance,
  getActivityTimeline,
};

export default reportsService;
