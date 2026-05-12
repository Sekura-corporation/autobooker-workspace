import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "store" | "client";
  tenantId?: string;
  storeId?: string;
  permissions?: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  fetchUser: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
