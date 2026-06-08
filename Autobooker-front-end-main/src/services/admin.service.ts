import api from "./api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_stores: number;
  active_stores: number;
  pending_stores: number;
  total_users: number;
  store_owners: number;
  clients: number;
  monthly_revenue: number;
  total_appointments: number;
}

export interface PendingStore {
  id: number;
  name: string;
  cnpj: string;
  owner: string;
  owner_email: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
  status: string;
}

export interface DashboardData {
  stats: DashboardStats;
  pending_stores: PendingStore[];
  recently_approved: Array<{
    id: number;
    name: string;
    owner: string;
    approved_at: string;
  }>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getAdminDashboard(): Promise<DashboardData> {
  const { data } = await api.get<{ success: boolean; data: DashboardData }>(
    "/admin/dashboard"
  );
  return data.data;
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export interface AdminStore {
  id: number;
  name: string;
  cnpj: string;
  owner: string;
  owner_email: string;
  status: "active" | "pending";
  address: string;
  phone: string;
  email: string;
  plan: string;
  plan_price: string;
  logo_url: string | null;
  created_at: string;
}

export interface AdminStoreDetail {
  id: number;
  name: string;
  cnpj: string;
  owner: string;
  owner_email: string;
  owner_phone: string;
  status: "active" | "pending";
  created_at: string;
  updated_at: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string;
  plan: string;
  plan_id: number | null;
  plan_price: string;
  total_appointments: number;
  active_clients: number;
  active_services: number;
  services: string[];
  operational_status: string;
  approved_at: string | null;
  rating: number;
  team_size: number;
  monthly_revenue: string;
  recent_notes: string[];
  last_activities: Array<{ date: string; title: string; description: string }>;
  partners: string[];
}

export async function listAdminStores(params?: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<AdminStore[]> {
  const { data } = await api.get("/admin/stores", { params });
  return data.data;
}

export async function getAdminStore(storeId: number): Promise<AdminStoreDetail> {
  const { data } = await api.get<{ success: boolean; data: AdminStoreDetail }>(
    `/admin/stores/${storeId}`
  );
  return data.data;
}

export async function approveStore(storeId: number): Promise<AdminStore> {
  const { data } = await api.post<{ success: boolean; data: AdminStore }>(
    `/admin/stores/${storeId}/approve`
  );
  return data.data;
}

export async function rejectStore(storeId: number): Promise<void> {
  await api.post(`/admin/stores/${storeId}/reject`);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "admin" | "store_owner" | "client";
  blocked: boolean;
  created_at: string;
}

export async function listAdminUsers(params?: {
  search?: string;
  role?: string;
  page?: number;
}): Promise<{ data: AdminUser[]; meta?: Record<string, unknown> }> {
  const { data } = await api.get("/admin/users", { params });
  return data.data;
}

export async function createAdminUser(payload: {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "store_owner" | "client";
}): Promise<AdminUser> {
  const { data } = await api.post<{ success: boolean; data: AdminUser }>(
    "/admin/users",
    payload
  );
  return data.data;
}

export async function toggleBlockUser(
  userId: number
): Promise<{ blocked: boolean; message: string }> {
  const { data } = await api.post<{
    success: boolean;
    blocked: boolean;
    message: string;
  }>(`/admin/users/${userId}/toggle-block`);
  return { blocked: data.blocked, message: data.message };
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export interface AdminPlan {
  id: number;
  name: string;
  price: string;
  billing_cycle: string;
  setup_fee: string;
  platform_commission: string;
  commission_type: string;
  store_limit: number;
  appointment_limit: string;
  support_level: string;
  description: string;
  features: string[];
  revenue_model: string[];
  status: "active" | "paused" | "pending";
  is_featured: boolean;
}

export async function listAdminPlans(): Promise<AdminPlan[]> {
  const { data } = await api.get<{ success: boolean; data: AdminPlan[] }>(
    "/admin/plans"
  );
  return data.data;
}

export async function createAdminPlan(
  payload: Partial<AdminPlan>
): Promise<AdminPlan> {
  const { data } = await api.post<{ success: boolean; data: AdminPlan }>(
    "/admin/plans",
    payload
  );
  return data.data;
}

export async function updateAdminPlan(
  id: number,
  payload: Partial<AdminPlan>
): Promise<AdminPlan> {
  const { data } = await api.put<{ success: boolean; data: AdminPlan }>(
    `/admin/plans/${id}`,
    payload
  );
  return data.data;
}

export async function deleteAdminPlan(id: number): Promise<void> {
  await api.delete(`/admin/plans/${id}`);
}

// ─── Partnerships ─────────────────────────────────────────────────────────────

export interface AdminPartnership {
  id: number;
  store_name: string;
  partner_name: string;
  partner_type: string;
  region: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  discount_percent: number;
  status: "active" | "pending" | "paused" | "cancelled";
  start_date: string;
  benefits: string[];
  notes: string;
  created_at: string;
}

export async function listAdminPartnerships(params?: {
  search?: string;
  status?: string;
  page?: number;
}): Promise<{ data: AdminPartnership[]; meta?: Record<string, unknown> }> {
  const { data } = await api.get("/admin/partnerships", { params });
  return data.data;
}

export async function createAdminPartnership(
  payload: Partial<AdminPartnership>
): Promise<AdminPartnership> {
  const { data } = await api.post<{ success: boolean; data: AdminPartnership }>(
    "/admin/partnerships",
    payload
  );
  return data.data;
}

export async function updateAdminPartnership(
  id: number,
  payload: Partial<AdminPartnership>
): Promise<AdminPartnership> {
  const { data } = await api.put<{ success: boolean; data: AdminPartnership }>(
    `/admin/partnerships/${id}`,
    payload
  );
  return data.data;
}

export async function deleteAdminPartnership(id: number): Promise<void> {
  await api.delete(`/admin/partnerships/${id}`);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export type SystemSettings = Record<string, string>;

export async function getAdminSettings(): Promise<SystemSettings> {
  const { data } = await api.get<{ success: boolean; data: SystemSettings }>(
    "/admin/settings"
  );
  return data.data;
}

export async function updateAdminSettings(
  payload: Partial<SystemSettings>
): Promise<SystemSettings> {
  const { data } = await api.put<{ success: boolean; data: SystemSettings }>(
    "/admin/settings",
    payload
  );
  return data.data;
}

export async function forceGlobalLogout(): Promise<void> {
  await api.post("/admin/settings/force-logout");
}

const adminService = {
  getAdminDashboard,
  listAdminStores,
  getAdminStore,
  approveStore,
  rejectStore,
  listAdminUsers,
  createAdminUser,
  toggleBlockUser,
  listAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  listAdminPartnerships,
  createAdminPartnership,
  updateAdminPartnership,
  deleteAdminPartnership,
  getAdminSettings,
  updateAdminSettings,
  forceGlobalLogout,
};

export default adminService;
