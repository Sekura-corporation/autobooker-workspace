import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";
import { clearAuthToken } from "@/services/api";
import {
  login as authLogin,
  logout as authLogout,
  me as authMe,
} from "@/services/auth.service";

const PROFILE_STORAGE_KEY = "@autobooker:user-profile";

interface PersistedUserProfile {
  id: string;
  role: User["role"];
  name: string;
  email: string;
  phone?: string;
  notifications?: {
    email: boolean;
    browser: boolean;
    security: boolean;
  };
}

function readPersistedProfile(): PersistedUserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedUserProfile;
  } catch {
    return null;
  }
}

function savePersistedProfile(profile: PersistedUserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function mergePersistedProfile(user: User): User {
  const persistedProfile = readPersistedProfile();
  if (
    !persistedProfile ||
    persistedProfile.id !== user.id ||
    persistedProfile.role !== user.role
  ) {
    return user;
  }

  return {
    ...user,
    name: persistedProfile.name ?? user.name,
    email: persistedProfile.email ?? user.email,
    phone: persistedProfile.phone ?? user.phone,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Ao iniciar o app, verifica se já tem token salvo
  useEffect(() => {
    const token = localStorage.getItem("@autobooker:token");
    if (token) {
      fetchUser();
    } else {
      // Use setTimeout para evitar cascading renders
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  // Busca os dados do usuário logado na API
  async function fetchUser() {
    try {
      const data = await authMe();
      const normalizedUser = mergePersistedProfile(data);
      setUser(normalizedUser);
    } catch {
      // Token inválido ou expirado
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Login — salva token e usuário
  async function login(email: string, password: string): Promise<User> {
    const { user: loggedUser } = await authLogin({ email, password });
    const normalizedUser = mergePersistedProfile(loggedUser);
    setUser(normalizedUser);
    return normalizedUser;
  }

  // Logout — limpa tudo
  async function logout() {
    try {
      await authLogout();
    } catch {
      // silencia erro de rede no logout
    } finally {
      clearAuthToken();
      setUser(null);
    }
  }

  // Atualiza dados do usuário no contexto (após editar perfil)
  function updateUser(updatedData: Partial<User>) {
    setUser((prev) => {
      if (!prev) {
        return null;
      }

      const nextUser = { ...prev, ...updatedData };
      const persistedProfile = readPersistedProfile();
      savePersistedProfile({
        ...persistedProfile,
        id: nextUser.id,
        role: nextUser.role,
        name: nextUser.name,
        email: nextUser.email,
        phone: nextUser.phone,
      });

      return nextUser;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        fetchUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
