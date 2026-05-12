import type { HTMLAttributes } from "react";
import { CheckCircle, Clock, XCircle, Pause } from "lucide-react";

interface StatusBadgeProps extends HTMLAttributes<HTMLDivElement> {
  status: "active" | "pending" | "completed" | "cancelled" | "paused";
  label?: string;
  showIcon?: boolean;
}

export default function StatusBadge({
  status,
  label,
  showIcon = true,
  className = "",
  ...props
}: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CheckCircle,
      defaultLabel: "Ativo",
    },
    pending: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      icon: Clock,
      defaultLabel: "Pendente",
    },
    completed: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: CheckCircle,
      defaultLabel: "Concluído",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: XCircle,
      defaultLabel: "Cancelado",
    },
    paused: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: Pause,
      defaultLabel: "Pausado",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.text} ${className}`}
      {...props}
    >
      {showIcon && <Icon className="w-4 h-4" />}
      <span>{label || config.defaultLabel}</span>
    </div>
  );
}
