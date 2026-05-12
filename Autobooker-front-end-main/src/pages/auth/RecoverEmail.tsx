import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { isEmpty, isValidEmail } from "@/utils/validators";
import { AuthLayout, Input } from "../../components/layout/AuthLayout";

export default function RecoverEmail() {
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEmpty(email)) {
      setEmailError("Informe o e-mail cadastrado.");
      toastError("Informe o e-mail cadastrado.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Informe um e-mail válido.");
      toastError("Informe um e-mail válido.");
      return;
    }

    setEmailError("");
    toastSuccess("Código enviado para o e-mail informado.");
    navigate("/recuperar-codigo");
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold mb-3 text-white text-center tracking-tight">
          Recuperar Senha
        </h2>
        <p className="text-zinc-400 text-sm mb-8 text-center font-light leading-relaxed">
          Digite seu e-mail cadastrado. Enviaremos um código para redefinir sua
          senha.
        </p>
        <Input
          label="E-mail"
          placeholder="email@email.com"
          type="email"
          value={email}
          error={emailError}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-4 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-900/20 mt-4"
        >
          Enviar código
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full mt-6 text-zinc-500 text-xs hover:text-white transition-colors"
        >
          Voltar para o login
        </button>
      </form>
    </AuthLayout>
  );
}
