import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  onMenuClick?: () => void;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-(--width-sidebar) lg:w-[calc(100%-var(--width-sidebar))] h-topbar z-40 flex items-center justify-between px-8 bg-white/55 backdrop-blur-md border-b border-white/40 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-neutral-base rounded-lg transition-colors shrink-0"
        >
          <Menu size={24} style={{ color: "var(--text-primary)" }} />
        </button>

        <div className="hidden sm:flex min-w-0">
          <h2
            className="text-lg md:text-1xl font-semibold leading-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            Bem-vindo, {user?.name || "Usuário"}
          </h2>
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <button className="p-2 hover:bg-neutral-base rounded-lg transition-colors">
          <Bell size={20} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </header>
  );
}
