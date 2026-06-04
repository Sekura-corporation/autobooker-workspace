import {
  LayoutDashboard,
  Calendar,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  User,
} from "lucide-react";
import logoSvg from "@/assets/logo-autobooker.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { getInitials } from "@/utils/formatters";
import { resolveAvatarUrl } from "@/utils/avatar";
import { ROLE_BASE_PATHS } from "@/utils/constants";

interface SidebarProps {
  role?: "admin" | "store" | "client";
  isOpen?: boolean;
  onClose?: () => void;
}

const MENU_ITEMS = {
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Lojas", icon: Settings, path: "/admin/lojas" },
    { label: "Usuários", icon: Users, path: "/admin/usuarios" },
    { label: "Parcerias", icon: Package, path: "/admin/parcerias" },
    { label: "Planos", icon: BarChart3, path: "/admin/planos" },
  ],
  store: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/loja/dashboard" },
    { label: "Agenda", icon: Calendar, path: "/loja/agenda" },
    { label: "Serviços", icon: Package, path: "/loja/servicos" },
    { label: "Pacotes", icon: Package, path: "/loja/pacotes" },
    { label: "Estoque", icon: Settings, path: "/loja/estoque" },
    { label: "Clientes", icon: Users, path: "/loja/clientes" },
    { label: "Relatórios", icon: BarChart3, path: "/loja/relatorios" },
    { label: "Fidelidade", icon: Package, path: "/loja/fidelidade" },
  ],
  client: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/cliente/dashboard" },
    { label: "Veículos", icon: Package, path: "/cliente/veiculos" },
    {
      label: "Meus Agendamentos",
      icon: Calendar,
      path: "/cliente/agendamentos",
    },
    {
      label: "Agendar Serviço",
      icon: Package,
      path: "/cliente/novo-agendamento",
    },
    { label: "Histórico", icon: BarChart3, path: "/cliente/historico" },
    { label: "Fidelidade", icon: Package, path: "/cliente/fidelidade" },
  ],
};

export default function Sidebar({
  role = "admin",
  isOpen = true,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const menuItems = MENU_ITEMS[role];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const routePrefix = ROLE_BASE_PATHS[role];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-sidebar text-white z-50 transition-transform duration-300 lg:translate-x-0 pt-6 flex flex-col overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--neutral-black)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-4 lg:hidden p-2 hover:bg-white/10 rounded-lg"
        >
          <X size={20} />
        </button>

        <div className="px-6 mb-8 flex items-center gap-2">
          <img
            src={logoSvg}
            alt="AutoBooker"
            className="h-6 w-auto brightness-0 invert"
          />
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <div key={item.path}>
                {/* Separador visual antes de certos items (cliente) */}
                {role === "client" && (index === 2 || index === 4) && (
                  <div className="my-2 border-t border-white/10" />
                )}

                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                    ${active ? "text-white" : "text-gray-300 hover:bg-white/10"}`}
                  style={active ? { background: "var(--brand-primary)" } : {}}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-3">
          {/* User Profile Section */}
          <div className="px-3 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar
                src={resolveAvatarUrl(user?.avatar)}
                initials={getInitials(user?.name)}
                size="md"
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => navigate(`/${routePrefix}/perfil`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm"
          >
            <User size={18} />
            <span>Meu Perfil</span>
          </button>
          {role === "admin" && (
            <button
              onClick={() => navigate(`/${routePrefix}/configuracoes`)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm"
            >
              <Settings size={18} />
              <span>Configurações Gerais</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="hidden lg:block w-sidebar" />
    </>
  );
}
