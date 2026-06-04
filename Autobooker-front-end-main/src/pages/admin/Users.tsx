import { useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Calendar,
  Lock,
  Unlock,
  Clock,
  Info,
  LogOut,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/shared/StatusBadge";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

interface User {
  id: number;
  name: string;
  email: string;
  profile: "admin" | "manager" | "operator" | "analyst";
  status: "active" | "inactive" | "blocked" | "pending";
  createdAt: string;
  lastLogin?: string;
  store?: string;
}

interface ActivityLog {
  time: string;
  action: string;
  details: string;
}

const MOCK_USERS: User[] = [
  {
    id: 1,
    name: "Douglas Details",
    email: "carlos@estetica.com",
    profile: "admin",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "Hoje, 09:12 AM",
    store: "Douglas Details",
  },
  {
    id: 2,
    name: "Carlos Eduardo",
    email: "carlos@estetica.com",
    profile: "operator",
    status: "active",
    createdAt: "2024-01-16",
    lastLogin: "Ontem, 16:45 PM",
    store: "Auto Estética VIP",
  },
  {
    id: 3,
    name: "Maria Silva",
    email: "maria@estetica.com",
    profile: "manager",
    status: "active",
    createdAt: "2024-01-17",
    lastLogin: "10/03/2026, 11:30 AM",
    store: "Lava Jato Central",
  },
  {
    id: 4,
    name: "João Santos",
    email: "joao@estetica.com",
    profile: "analyst",
    status: "inactive",
    createdAt: "2024-01-18",
    lastLogin: "08/02/2026, 14:20 PM",
  },
];

const ACTIVITY_LOGS: ActivityLog[] = [
  {
    time: "Hoje, 09:12 AM",
    action: "Login bem-sucedido via Web",
    details: "(IP: 189.44.xx.xx)",
  },
  {
    time: "Ontem, 16:45 PM",
    action: 'Alterou a descrição de: "Lavagem Básica" em seu catálogo.',
    details: "",
  },
  {
    time: "10/03/2026, 11:30 AM",
    action: "Conta criada pelo Administrador.",
    details: "",
  },
];

const PROFILE_OPTIONS = [
  { value: "admin", label: "Administrador Global" },
  { value: "manager", label: "Gerente" },
  { value: "operator", label: "Operador" },
  { value: "analyst", label: "Analista" },
];

type UserFormData = {
  name: string;
  email: string;
  phone: string;
  store: string;
  profile: User["profile"];
};

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [users, setUsers] = useState(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    store: "",
    profile: "operator",
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.includes(searchTerm);
    const matchesProfile =
      profileFilter === "all" || user.profile === profileFilter;
    return matchesSearch && matchesProfile;
  });

  const handleRegisterSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const newUser: User = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name: formData.name,
      email: formData.email,
      profile: formData.profile,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers((prev) => [...prev, newUser]);
    setFormData({
      name: "",
      email: "",
      phone: "",
      store: "",
      profile: "operator",
    });
    setIsRegisterModalOpen(false);
  };

  const handleDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleBlockUser = () => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, status: u.status === "blocked" ? "active" : "blocked" }
            : u,
        ),
      );
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "blocked" ? "active" : "blocked",
            }
          : null,
      );
    }
  };

  const getProfileLabel = (profile: string) => {
    return (
      PROFILE_OPTIONS.find((opt) => opt.value === profile)?.label || profile
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadgeType = (
    status: string,
  ): "active" | "pending" | "completed" | "cancelled" | "paused" => {
    switch (status) {
      case "active":
        return "active";
      case "inactive":
        return "cancelled";
      case "blocked":
        return "cancelled";
      case "pending":
        return "pending";
      default:
        return "pending";
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader title="Usuários" subtitle="Gerenciamento global de perfis">
        <Button
          variant="primary"
          className="gap-2 w-full sm:w-auto"
          onClick={() => setIsRegisterModalOpen(true)}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Usuário</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000] w-full sm:w-auto sm:min-w-48"
          value={profileFilter}
          onChange={(e) => setProfileFilter(e.target.value)}
        >
          <option value="all">Todos os Perfis</option>
          {PROFILE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <DataTable<User>
            columns={[
              {
                key: "name",
                label: "Usuário / Email",
                sortable: true,
                render: (_, row) => (
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900">{row.name}</p>
                    <p className="text-xs text-zinc-500 break-all">
                      {row.email}
                    </p>
                  </div>
                ),
              },
              {
                key: "profile",
                label: "Perfil",
                sortable: true,
                render: (profile: unknown) => (
                  <p className="text-sm font-medium text-zinc-900">
                    {getProfileLabel(profile as string)}
                  </p>
                ),
              },
              {
                key: "createdAt",
                label: "Cadastro",
                sortable: true,
                render: (date: unknown) => (
                  <p className="text-sm text-zinc-900">
                    {new Date(date as string).toLocaleDateString("pt-BR")}
                  </p>
                ),
              },
              {
                key: "status",
                label: "Status",
                sortable: true,
                render: (status: unknown) => (
                  <StatusBadge status={getStatusBadgeType(status as string)} />
                ),
              },
              {
                key: "id",
                label: "Ações",
                sortable: false,
                render: (_, row) => (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-2 whitespace-nowrap"
                      onClick={() => handleDetail(row)}
                    >
                      Detalhes
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filteredUsers}
            emptyMessage="Nenhum usuário encontrado"
          />
        </div>
      </Card>

      {/* MODAL DE CADASTRO */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Cadastrar Novo Usuário"
        size="lg"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={handleRegisterSubmit}
            >
              Cadastrar Usuário
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Seção 1: Informações Pessoais */}
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-200">
              Informações Pessoais
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                placeholder="João das Neves"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <Input
                label="Email"
                placeholder="joao@example.com"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Seção 2: Perfil e Acesso */}
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-200">
              Perfil e Acesso
            </h4>
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Perfil de Acesso
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={formData.profile}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    profile: e.target.value as User["profile"],
                  }))
                }
              >
                {PROFILE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Descrição do Perfil */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  {formData.profile === "admin" &&
                    "Administrador Global - Acesso total ao sistema"}
                  {formData.profile === "manager" &&
                    "Gerente - Gerencia lojas e operadores"}
                  {formData.profile === "operator" &&
                    "Operador - Gerencia agendamentos e clientes"}
                  {formData.profile === "analyst" &&
                    "Analista - Visualiza relatórios e dados"}
                </p>
              </div>
            </div>
          </div>

          {/* Seção 3: Informações de Contato */}
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-200">
              Informações de Contato
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Telefone / WhatsApp"
                placeholder="(11) 98765-4321"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />

              {formData.profile !== "admin" && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-900 mb-2">
                    Loja Associada
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                    value={formData.store || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        store: e.target.value,
                      }))
                    }
                  >
                    <option value="">Selecionar loja...</option>
                    <option value="Douglas Details">Douglas Details</option>
                    <option value="Auto Estética VIP">Auto Estética VIP</option>
                    <option value="Lava Jato Central">Lava Jato Central</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Seção 4: Permissões */}
          {formData.profile !== "admin" && (
            <div>
              <h4 className="text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-200">
                Permissões
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-2 border-zinc-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900">
                    Gerenciar Agendamentos
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-2 border-zinc-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900">
                    Visualizar Clientes
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-zinc-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900">
                    Exportar Relatórios
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-zinc-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900">
                    Gerenciar Configurações
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Seção 5: Configurações Iniciais */}
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-200">
              Configurações Iniciais
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-2 border-zinc-300 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900">
                  Enviar e-mail de confirmação
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-zinc-300 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900">
                  Exigir mudança de senha no primeiro acesso
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-2 border-zinc-300 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900">
                  Autenticação de dois fatores (2FA)
                </span>
              </label>
            </div>
          </div>

          {/* Informação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-900 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase mb-1">
                Nota Importante
              </p>
              <p className="text-xs text-blue-900">
                Um e-mail de confirmação será enviado ao novo usuário com
                instruções para ativar sua conta. Todas as ações serão
                registradas para fins de auditoria.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL DE DETALHES E AUDITORIA */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha do Usuário (Auditoria)"
        size="md"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleBlockUser}
            >
              {selectedUser?.status === "blocked" ? (
                <>
                  <Unlock size={16} className="mr-1" />
                  Desbloquear Conta
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-1" />
                  Bloquear Conta
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Fechar Ficha
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Header com Avatar */}
            <div className="flex items-start gap-4 pb-4 border-b border-zinc-200">
              <Avatar
                initials={getInitials(selectedUser.name)}
                size="lg"
                bgColor="bg-[#820000]"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-zinc-900 truncate">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-2 break-all">
                  {selectedUser.email}
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge variant="neutral">
                    {getProfileLabel(selectedUser.profile)}
                  </Badge>
                  <StatusBadge
                    status={getStatusBadgeType(selectedUser.status)}
                  />
                </div>
              </div>
            </div>

            {/* Informações Gerais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-1">
                  Data de Cadastro
                </p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-zinc-400" />
                  <p className="text-sm font-medium text-zinc-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              </div>
              {selectedUser.lastLogin && (
                <div>
                  <p className="text-xs text-zinc-500 font-semibold uppercase mb-1">
                    Último Acesso
                  </p>
                  <div className="flex items-center gap-2">
                    <LogOut size={16} className="text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-900">
                      {selectedUser.lastLogin}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Registro de Atividades */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={18} className="text-zinc-900" />
                <p className="text-sm font-bold text-zinc-900">
                  Registro de Atividades (Security Logs)
                </p>
              </div>

              <div className="bg-zinc-50 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {ACTIVITY_LOGS.map((log, idx) => (
                  <div
                    key={idx}
                    className="pb-3 border-b border-zinc-200 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#820000] mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 font-semibold">
                          {log.time}
                        </p>
                        <p className="text-sm text-zinc-900 font-medium mt-1">
                          {log.action}
                        </p>
                        {log.details && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <Info size={20} className="text-amber-900 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-900 font-semibold uppercase mb-1">
                  Informação
                </p>
                <p className="text-xs text-amber-900">
                  Todas as ações deste usuário são registradas para fins de
                  auditoria e segurança.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
