import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export default function Input({
  label,
  error,
  helper,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-bold text-[#050505]">{label}</label>
      )}
      <input
        className={`
          px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm
          ${error ? "border-red-500 bg-red-50/50" : "border-zinc-200 focus:border-[#820000] focus:outline-none bg-white"}
          ${className}
        `}
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
