import React, { type InputHTMLAttributes } from "react";
import { applyMask, type MaskType } from "@/utils/masks";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  helper?: string;
  mask?: MaskType;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  label,
  error,
  helper,
  mask = "none",
  className = "",
  onChange,
  value,
  ...props
}: InputProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    
    if (mask !== "none") {
      e.target.value = applyMask(e.target.value, mask);
    }
    onChange(e);
  };
  
  // Applica a máscara inicial caso exista um value passando por props
  const displayValue = value !== undefined && value !== null && mask !== "none"
    ? applyMask(String(value), mask)
    : value;

  // Hack para evitar que o navegador aceite 'e', '+', '-' em inputs numéricos
  // Quando temos máscara de inteiros ou telefone, é melhor usar text/tel
  let inputType = props.type;
  let inputMode = props.inputMode;

  if (mask === "integer" || mask === "currency" || mask === "cpf" || mask === "cnpj" || mask === "phone" || mask === "cep") {
    if (inputType === "number") {
      inputType = "text";
      inputMode = "numeric";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-bold text-[#050505]">{label}</label>
      )}
      <input
        type={inputType}
        inputMode={inputMode}
        className={`
          px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm
          ${error ? "border-red-500 bg-red-50/50" : "border-zinc-200 focus:border-[#820000] focus:outline-none bg-white"}
          ${className}
        `}
        onChange={handleChange}
        value={displayValue}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-600 font-medium">{error}</span>
      )}
      {helper && !error && (
        <span className="text-xs text-zinc-500">{helper}</span>
      )}
    </div>
  );
}
