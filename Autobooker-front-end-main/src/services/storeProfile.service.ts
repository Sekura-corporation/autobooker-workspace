import api from "./api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface StoreProfile {
  id: number;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  description: string;
  opening_hours: string;
  logo_url: string;
  banner_url: string;
  plan_id: number | null;
  plan?: {
    id: number;
    name: string;
    price: string;
  } | null;
  status: boolean;
}

export interface Plan {
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
  revenue_model: Record<string, string>[];
  status: string;
  is_featured: boolean;
}

export type PaymentMethod = "pix_simulado" | "cartao_simulado";

export interface SubscribeToPlanPayload {
  plan_id: number;
  payment_method: PaymentMethod;
}

// ─── Funções ─────────────────────────────────────────────────────────────────

/**
 * Busca os dados completos do perfil da loja do lojista logado.
 * GET /api/store/profile
 */
export async function getStoreProfile(): Promise<StoreProfile> {
  const { data } = await api.get<{ success: boolean; data: StoreProfile }>(
    "/store/profile"
  );
  return data.data;
}

/**
 * Atualiza o perfil da loja.
 * PUT /api/store/profile
 */
export async function updateStoreProfile(
  payload: Partial<Omit<StoreProfile, "id" | "plan" | "status">>
): Promise<StoreProfile> {
  const { data } = await api.put<{ success: boolean; data: StoreProfile }>(
    "/store/profile",
    payload
  );
  return data.data;
}

/**
 * Upload de logo ou banner da loja.
 * POST /api/store/profile/upload
 */
export async function uploadStoreImage(
  formData: FormData
): Promise<StoreProfile> {
  const { data } = await api.post<{ success: boolean; data: StoreProfile }>(
    "/store/profile/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}

/**
 * Lista os planos disponíveis para assinatura.
 * GET /api/plans
 */
export async function listAvailablePlans(): Promise<Plan[]> {
  const { data } = await api.get<{ success: boolean; data: Plan[] }>("/plans");
  return data.data;
}

/**
 * Subscreve a loja a um plano com pagamento simulado.
 * PUT /api/store/plan
 */
export async function subscribeToPlan(
  payload: SubscribeToPlanPayload
): Promise<StoreProfile> {
  const { data } = await api.put<{
    success: boolean;
    message: string;
    data: StoreProfile;
  }>("/store/plan", payload);
  return data.data;
}

const storeProfileService = {
  getStoreProfile,
  updateStoreProfile,
  uploadStoreImage,
  listAvailablePlans,
  subscribeToPlan,
};

export default storeProfileService;
