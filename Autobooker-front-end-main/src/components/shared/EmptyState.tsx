import type { ReactNode } from "react";
import { Package } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 bg-linear-to-b from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon || <Package size={32} />}
      </div>
      <h3 className="text-xl font-bold text-[#050505] mb-2 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-zinc-500 text-center mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-[#820000] hover:bg-[#4F0000] text-white font-bold text-sm rounded-lg transition-all active:scale-95 shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
