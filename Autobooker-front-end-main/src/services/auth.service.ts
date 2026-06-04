import type { User } from "@/context/AuthContext";
import api, { clearAuthToken, setAuthToken } from "./api";

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: User["role"];
  phone?: string;
  storeName?: string;
}

export interface PasswordRecoveryRequestPayload {
  email: string;
}

export interface PasswordRecoveryConfirmPayload {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>("/auth/login", payload);

  setAuthToken(data.token);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>("/auth/register", payload);

  setAuthToken(data.token);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAuthToken();
  }
}

export async function requestPasswordRecovery(
  payload: PasswordRecoveryRequestPayload,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/forgot-password",
    payload,
  );
  return data;
}

export async function verifyPasswordRecoveryCode(
  email: string,
  code: string,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/verify-code",
    { email, code },
  );
  return data;
}

export async function confirmPasswordRecovery(
  payload: PasswordRecoveryConfirmPayload,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/reset-password",
    payload,
  );
  return data;
}

const authService = { 
  login,
  register,
  me,
  logout,
  requestPasswordRecovery,
  verifyPasswordRecoveryCode,
  confirmPasswordRecovery,
};

export default authService; // Auth service
