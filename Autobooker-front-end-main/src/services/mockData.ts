import type { User } from "@/context/AuthContext";

// Dados mock de usuários para teste
export const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@autobooker.com": {
    password: "123456",
    user: {
      id: "1",
      name: "Admin AutoBooker",
      email: "admin@autobooker.com",
      role: "admin",
      permissions: ["*"],
    },
  },
  "loja@autobooker.com": {
    password: "123456",
    user: {
      id: "2",
      name: "Loja Premium",
      email: "loja@autobooker.com",
      role: "store",
      storeId: "store-2",
      tenantId: "store-2",
      permissions: ["appointments:read", "customers:read", "reports:read"],
    },
  },
  "cliente@autobooker.com": {
    password: "123456",
    user: {
      id: "3",
      name: "João Silva",
      email: "cliente@autobooker.com",
      role: "client",
      permissions: ["profile:read", "vehicles:read", "appointments:read"],
    },
  },
};

// Função para simular login
export async function mockLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simula latência

  const userData = MOCK_USERS[email];

  if (!userData) {
    throw new Error("Usuário não encontrado");
  }

  if (userData.password !== password) {
    throw new Error("Senha incorreta");
  }

  // Simula token JWT
  const token = `mock-jwt-token-${userData.user.id}-${Date.now()}`;

  return {
    token,
    user: userData.user,
  };
}

// Função para simular fetch user
export async function mockFetchUser(token: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Extrai o ID do token mock
  const id = token.split("-")[3];

  const userEntry = Object.values(MOCK_USERS).find((u) => u.user.id === id);

  if (!userEntry) {
    throw new Error("Usuário não encontrado");
  }

  return userEntry.user;
}
