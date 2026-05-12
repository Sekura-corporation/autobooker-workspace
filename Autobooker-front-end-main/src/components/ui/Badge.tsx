import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "pending" | "error" | "neutral" | "loyalty";
}

export default function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyle =
    "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border";

  const variants = {
    success: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-orange-50 text-orange-600 border-orange-200",
    error: "bg-red-50 text-red-600 border-red-200",
    neutral: "bg-zinc-100 text-zinc-600 border-zinc-200",
    loyalty: "bg-white text-green-600 border-green-600 border-[1.5px]",
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
