import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { AuthLayout, Input } from "../../components/layout/AuthLayout";
import authService from "@/services/auth.service";

export default function NewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const code = location.state?.code;

  const { error: toastError, success: toastSuccess } = useToast();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Se não tem email ou código, significa que acessou a página diretamente sem passar pelo fluxo
  if (!email || !code) {
    navigate("/recuperar-email");
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      toastError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      toastError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.confirmPasswordRecovery({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      toastSuccess("Senha alterada com sucesso.");
      navigate("/sucesso/senha");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.password?.[0] || "Erro ao alterar senha. O código pode ter expirado.";
      toastError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold mb-3 text-white text-center tracking-tight">
          Nova Senha
        </h2>
        <p className="text-zinc-400 text-sm mb-8 text-center font-light leading-relaxed">
          Crie uma nova senha para acessar sua conta.
        </p>

        <Input
          label="Nova Senha"
          placeholder="********"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <div className="mt-4">
          <Input
            label="Confirmar Nova Senha"
            placeholder="********"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-900/20 mt-6 disabled:opacity-50"
        >
          {isLoading ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </AuthLayout>
  );
}