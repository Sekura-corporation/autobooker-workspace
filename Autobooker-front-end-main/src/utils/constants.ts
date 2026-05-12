// ─── PERFIS DE USUÁRIO ───────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  STORE: "store",
  CLIENT: "client",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// ─── ROTAS POR PERFIL ────────────────────────────────────────────
export const ROLE_BASE_PATHS: Record<UserRole, string> = {
  admin: "admin",
  store: "loja",
  client: "cliente",
};

export const ROLE_ROUTES: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  store: "/loja/dashboard",
  client: "/cliente/dashboard",
};

// ─── STATUS DE AGENDAMENTO ───────────────────────────────────────
export const APPOINTMENT_STATUS = {
  waiting: { label: "Aguardando", color: "info" },
  in_progress: { label: "Em andamento", color: "warning" },
  completed: { label: "Concluído", color: "success" },
  cancelled: { label: "Cancelado", color: "error" },
  late: { label: "Atrasado", color: "error" },
} as const;

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS;

// ─── STATUS DA ESTÉTICA ──────────────────────────────────────────
export const STORE_STATUS = {
  active: { label: "Ativa", color: "success" },
  pending: { label: "Pendente", color: "warning" },
  inactive: { label: "Inativa", color: "neutral" },
} as const;

export type StoreStatus = keyof typeof STORE_STATUS;

// ─── TIPOS DE VEÍCULO ────────────────────────────────────────────
export const VEHICLE_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup" },
  { value: "hatch", label: "Hatch" },
  { value: "moto", label: "Moto" },
  { value: "van", label: "Van" },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]["value"];

// ─── STATUS DE COLETA ────────────────────────────────────────────
export const PICKUP_STATUS = {
  requested: { label: "Solicitada", color: "info" },
  on_the_way: { label: "A caminho", color: "warning" },
  collected: { label: "Coletado", color: "success" },
  returned: { label: "Devolvido", color: "neutral" },
} as const;

export type PickupStatus = keyof typeof PICKUP_STATUS;
