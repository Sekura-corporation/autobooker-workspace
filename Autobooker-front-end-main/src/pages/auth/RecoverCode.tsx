import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { AuthLayout } from "../../components/layout/AuthLayout";
import authService from "@/services/auth.service";

export default function RecoverCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const { error: toastError, success: toastSuccess } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const codeValue = useMemo(() => code.join(""), [code]);

  const handleChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = nextValue;
      return next;
    });

    // Auto-focus next input
    if (nextValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        setCode((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length === 0) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      if (pasteData[i] !== undefined) {
        newCode[i] = pasteData[i];
      }
    }
    setCode(newCode);

    // Focus the last populated input or the last input
    const targetIndex = Math.min(pasteData.length, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleResend = async () => {
    if (!email) {
      toastError("E-mail não encontrado. Retorne à etapa anterior.");
      return;
    }
    
    try {
      await authService.requestPasswordRecovery({ email });
      toastSuccess("Código reenviado para o e-mail.");
    } catch (error) {
      toastError("Erro ao reenviar código.");
    }
  };

  const handleSubmit = async () => {
    if (codeValue.length !== 6) {
      toastError("Digite o código completo de 6 dígitos.");
      return;
    }

    if (!email) {
      toastError("E-mail não encontrado. Retorne à etapa anterior.");
      navigate("/recuperar-email");
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyPasswordRecoveryCode(email, codeValue);
      toastSuccess("Código validado com sucesso.");
      navigate("/nova-senha", { state: { email, code: codeValue } });
    } catch (error) {
      toastError("Código inválido ou expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold mb-3 text-white text-center tracking-tight">
        Recuperar Senha
      </h2>
      <p className="text-zinc-400 text-sm mb-10 text-center font-light leading-relaxed">
        Digite o código de 6 dígitos enviado para o seu e-mail cadastrado.
      </p>
      <div className="flex justify-between gap-2 mb-10">
        {code.map((item, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            maxLength={1}
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-full aspect-square bg-zinc-200 text-zinc-900 text-center text-xl font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-4 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
      >
        {isLoading ? "Validando..." : "Confirmar código"}
      </button>
      <button
        type="button"
        onClick={handleResend}
        className="w-full mt-6 text-zinc-500 text-xs hover:text-white transition-colors"
      >
        Reenviar código
      </button>
      <button
        type="button"
        onClick={() => navigate("/recuperar-email")}
        className="w-full mt-2 text-zinc-500 text-xs hover:text-white transition-colors"
      >
        Mudar e-mail
      </button>
    </AuthLayout>
  );
}
