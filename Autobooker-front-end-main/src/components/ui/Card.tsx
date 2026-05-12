import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cs";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "cta";
}

export default function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const baseStyle = "bg-white rounded-lg p-6 md:p-8 transition-shadow";

  const variants = {
    default: "border border-zinc-100 shadow-sm hover:shadow-md",
    highlight:
      "border-t-4 border-t-[#820000] border-x border-b border-zinc-100 shadow-sm",
    cta: "bg-[#820000] text-white shadow-xl shadow-red-900/20",
  };

  return (
    <div
      className={cn(baseStyle, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
