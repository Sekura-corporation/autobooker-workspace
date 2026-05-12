import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface UsersQuery {
  tenantId?: string;
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserPayload extends ServiceRecord {
  name: string;
  email: string;
  role: string;
}

export async function listUsers(params: UsersQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/users", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getUser(userId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(`/users/${userId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function createUser(payload: UserPayload, tenantId?: string) {
  const { data } = await api.post<ServiceRecord>("/users", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateUser(
  userId: string,
  payload: Partial<UserPayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(`/users/${userId}`, payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateUserRole(
  userId: string,
  role: string,
  tenantId?: string,
) {
  return updateUser(userId, { role }, tenantId);
}

export async function updateUserPermissions(
  userId: string,
  permissions: string[],
  tenantId?: string,
) {
  return updateUser(userId, { permissions }, tenantId);
}

export async function deleteUser(userId: string, tenantId?: string) {
  const { data } = await api.delete<ServiceRecord>(`/users/${userId}`, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

const usersService = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserRole,
  updateUserPermissions,
  deleteUser,
};

export default usersService;
