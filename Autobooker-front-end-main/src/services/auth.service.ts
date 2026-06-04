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

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.post<{ user: User; message: string }>(
    "/auth/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data.user;
}

export async function removeAvatar(): Promise<User> {
  const { data } = await api.delete<{ user: User; message: string }>(
    "/auth/avatar",
  );

  return data.user;
}

export async function requestPasswordRecovery(
  payload: PasswordRecoveryRequestPayload,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/recover",
    payload,
  );
  return data;
}

export async function confirmPasswordRecovery(
  payload: PasswordRecoveryConfirmPayload,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/recover/confirm",
    payload,
  );
  return data;
}

const authService = {
  login,
  register,
  me,
  logout,
  uploadAvatar,
  removeAvatar,
  requestPasswordRecovery,
  confirmPasswordRecovery,
};

export default authService; // Auth service
