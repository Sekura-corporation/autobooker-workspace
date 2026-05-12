import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface StockQuery {
  tenantId?: string;
  search?: string;
  page?: number;
  limit?: number;
  lowStockOnly?: boolean;
}

export interface StockItemPayload extends ServiceRecord {
  name: string;
  quantity?: number;
  minimumQuantity?: number;
}

export async function listStockItems(params: StockQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/stock/items", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getStockItem(stockItemId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/stock/items/${stockItemId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createStockItem(
  payload: StockItemPayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/stock/items", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateStockItem(
  stockItemId: string,
  payload: Partial<StockItemPayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/stock/items/${stockItemId}`,
    payload,
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

export async function adjustStock(
  stockItemId: string,
  quantity: number,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>(
    `/stock/items/${stockItemId}/adjust`,
    { quantity },
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

export async function recordStockMovement(
  payload: ServiceRecord,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/stock/movements", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

const stockService = {
  listStockItems,
  getStockItem,
  createStockItem,
  updateStockItem,
  adjustStock,
  recordStockMovement,
};

export default stockService;
