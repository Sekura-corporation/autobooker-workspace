import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface CustomersQuery {
  tenantId?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export interface CustomerPayload extends ServiceRecord {
  name: string;
  email?: string;
  phone?: string;
}

export async function listCustomers(params: CustomersQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/customers", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getCustomer(customerId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/customers/${customerId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createCustomer(
  payload: CustomerPayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/customers", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateCustomer(
  customerId: string,
  payload: Partial<CustomerPayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/customers/${customerId}`,
    payload,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function deleteCustomer(customerId: string, tenantId?: string) {
  const { data } = await api.delete<ServiceRecord>(`/customers/${customerId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getCustomerVehicles(
  customerId: string,
  tenantId?: string,
) {
  const { data } = await api.get<ServiceRecord[]>(
    `/customers/${customerId}/vehicles`,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function getCustomerHistory(
  customerId: string,
  tenantId?: string,
) {
  const { data } = await api.get<ServiceRecord[]>(
    `/customers/${customerId}/history`,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function getCustomerLoyalty(
  customerId: string,
  tenantId?: string,
) {
  const { data } = await api.get<ServiceRecord>(
    `/customers/${customerId}/loyalty`,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

const customersService = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerVehicles,
  getCustomerHistory,
  getCustomerLoyalty,
};

export default customersService;
