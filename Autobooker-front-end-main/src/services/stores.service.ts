import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface StoresQuery {
  tenantId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface StorePayload extends ServiceRecord {
  name: string;
  cnpj?: string;
  ownerName?: string;
}

/** Resposta atual de `StoreController` (campos extras podem vir no futuro). */
export type ApiStoreRecord = ServiceRecord & {
  id?: string;
  name?: string;
  cnpj?: string | null;
  ownerId?: string | null;
  status?: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  zip_code?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHours?: string | null;
  opening_hours?: string | null;
};

export type ApiStoreServiceRecord = ServiceRecord & {
  id?: string;
  storeId?: string;
  name?: string;
  description?: string | null;
  price?: number;
  durationMinutes?: number;
  duration_minutes?: number;
  duration?: number;
  category?: string | null;
  active?: boolean;
};

export async function listStores(params: StoresQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ApiStoreRecord[]>("/stores", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getStore(storeId: string, tenantId?: string) {
  const { data } = await api.get<ApiStoreRecord>(`/stores/${storeId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

/** Serviços de uma loja (`services` filtrados por `store_id` no backend). */
export async function getStoreServices(
  storeId: string,
  params: { active?: boolean; search?: string } = {},
  tenantId?: string,
) {
  const { data } = await api.get<ApiStoreServiceRecord[]>(
    `/stores/${encodeURIComponent(storeId)}/services`,
    {
      params: {
        ...(params.active !== false ? { active: true } : {}),
        ...(params.search ? { search: params.search } : {}),
      },
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function createStore(payload: StorePayload, tenantId?: string) {
  const { data } = await api.post<ServiceRecord>("/stores", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateStore(
  storeId: string,
  payload: Partial<StorePayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(`/stores/${storeId}`, payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateStoreStatus(
  storeId: string,
  status: string,
  tenantId?: string,
) {
  return updateStore(storeId, { status }, tenantId);
}

export async function approveStore(storeId: string, tenantId?: string) {
  const { data } = await api.post<ServiceRecord>(
    `/stores/${storeId}/approve`,
    {},
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function rejectStore(storeId: string, tenantId?: string) {
  const { data } = await api.post<ServiceRecord>(
    `/stores/${storeId}/reject`,
    {},
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function getStoreSettings(storeId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/stores/${storeId}/settings`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getStoreRewards(storeId: string) {
  const { data } = await api.get(`/stores/${storeId}/rewards`);
  return data;
}

export async function getStoreProducts(storeId: string) {
  const { data } = await api.get(`/stores/${storeId}/products`);
  return data;
}

export async function getStorePackages(storeId: string) {
  const { data } = await api.get(`/stores/${storeId}/packages`);
  return data;
}

const storesService = {
  listStores,
  getStore,
  createStore,
  updateStore,
  updateStoreStatus,
  approveStore,
  rejectStore,
  getStoreSettings,
};

export default storesService; // Stores service
