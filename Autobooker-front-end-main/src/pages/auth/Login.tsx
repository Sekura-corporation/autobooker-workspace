import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ROLE_ROUTES } from "@/utils/constants";
import { isEmpty, isValidEmail } from "@/utils/validators";
import { AuthLayout, Input } from "../../components/layout/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: { email?: string; password?: string } = {};

    if (isEmpty(email)) {
      nextErrors.email = "Informe seu e-mail.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (isEmpty(password)) {
      nextErrors.password = "Informe sua senha.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toastError("Corrija os campos destacados para continuar.");
      return;
    }

    try {
      const user = await login(email, password);
    
      const rawRole = user.role as string;
      const normalizedRole = rawRole === "store_owner" ? "store" : rawRole;
    
      navigate(ROLE_ROUTES[normalizedRole as keyof typeof ROLE_ROUTES]);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao fazer login.");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin}>
        <h2 className="text-3xl font-bold mb-1 text-white text-center tracking-tight">
          Fazer Login
        </h2>
        <p className="text-zinc-400 text-sm mb-8 text-center font-light">
          Acesse sua conta para continuar
        </p>

        <Input
          label="E-mail"
          error={errors.email}
          placeholder="email@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Senha"
          error={errors.password}
          placeholder="**********"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-start mb-6">
          <button
            type="button"
            onClick={() => navigate("/recuperar-email")}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all mb-6 shadow-lg shadow-red-900/20"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-xs text-zinc-400 mb-8">
          Ainda não tem conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            className="text-white font-semibold hover:text-red-500 transition-colors"
          >
            Cadastre-se
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
