import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cs";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "secondary";
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center font-semibold text-base px-6 py-4 rounded-xl transition-all active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[#820000] text-white hover:bg-[#660000]",
    outline:
      "bg-white text-[#820000] border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
    secondary:
      "bg-[#D9D9D9] text-black hover:bg-[#CCCCCC]",
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
