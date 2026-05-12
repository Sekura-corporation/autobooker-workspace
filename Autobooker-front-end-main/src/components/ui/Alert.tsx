import type { HTMLAttributes } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export default function Alert({
  variant = "info",
  title,
  message,
  onClose,
  dismissible = true,
  children,
  className = "",
  ...props
}: AlertProps) {
  const variants = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      title: "text-green-900",
      icon: CheckCircle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      title: "text-red-900",
      icon: AlertCircle,
    },
    warning: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      title: "text-orange-900",
      icon: AlertTriangle,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      title: "text-blue-900",
      icon: Info,
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex gap-4 ${className}`}
      {...props}
    >
      <Icon className={`w-5 h-5 shrink-0 ${config.text}`} />
      <div className="flex-1">
        {title && (
          <h3 className={`font-bold text-sm ${config.title} mb-1`}>{title}</h3>
        )}
        {message && <p className={`text-sm ${config.text}`}>{message}</p>}
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onClose}
          className={`shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
