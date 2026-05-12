import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { AuthLayout } from "../../components/layout/AuthLayout";

export default function RecoverCode() {
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const codeValue = useMemo(() => code.join(""), [code]);

  const handleChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(0, 1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = nextValue;
      return next;
    });
  };

  const handleSubmit = () => {
    if (codeValue.length !== 6) {
      toastError("Digite o código completo de 6 dígitos.");
      return;
    }

    toastSuccess("Código validado com sucesso.");
    navigate("/sucesso/senha");
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
            maxLength={1}
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            className="w-full aspect-square bg-zinc-200 text-zinc-900 text-center text-xl font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-900/20"
      >
        Confirmar código
      </button>
      <button
        type="button"
        onClick={() => navigate("/recuperar-email")}
        className="w-full mt-6 text-zinc-500 text-xs hover:text-white transition-colors"
      >
        Reenviar código
      </button>
    </AuthLayout>
  );
}
