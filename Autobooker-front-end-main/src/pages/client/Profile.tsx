import { useEffect, useState } from "react";
import api from "@/services/api";
import { listAppointments } from "@/services/appointments.service";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, Phone, User } from "lucide-react";
import AvatarUpload from "@/components/ui/AvatarUpload";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ClientProfile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    notifications: true,
  });
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [memberSince, setMemberSince] = useState("Não informado");
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const appointments = await listAppointments();
        setAppointmentCount(appointments.length);
  
        const { data } = await api.get("/auth/me");
  
        if (data.createdAt || data.created_at) {
          const createdDate = new Date(data.createdAt ?? data.created_at);
          setMemberSince(
            createdDate.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            }),
          );
        }
  
        if (data.avatar !== user?.avatar) {
          updateUser({ avatar: data.avatar ?? null });
        }

        setFormData((prev) => ({
          ...prev,
          name: data.name ?? user?.name ?? "",
          email: data.email ?? user?.email ?? "",
          phone: data.phone ?? user?.phone ?? "",
        }));
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }
  
    loadProfileData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put("/auth/profile", {
        name: formData.name,
        phone: formData.phone,
      });
  
      updateUser({
        name: data.name ?? formData.name,
        phone: data.phone ?? formData.phone,
      });
  
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      notifications: true,
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/auth/profile");
      await logout();
      toast.success("Conta deletada com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      toast.error("Erro ao deletar conta.");
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            Meu Perfil
          </h2>
          <p className="text-zinc-500 mt-1.5 text-sm md:text-base font-medium">
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Dados Pessoais */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300 mb-6">
            <div className="p-5 md:p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-0">
                Dados Pessoais
              </h2>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-zinc-100">
                <AvatarUpload
                  name={formData.name || user?.name || ""}
                  avatar={user?.avatar}
                  size="lg"
                  onAvatarChange={(avatar) => updateUser({ avatar })}
                />
                <div>
                  <p className="font-bold text-lg text-zinc-900 mb-0">
                    {formData.name || user?.name}
                  </p>
                  <p className="text-sm font-medium text-zinc-500 mb-0">{formData.email}</p>
                </div>
              </div>

              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Nome Completo
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Telefone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                className="flex-1 !rounded-md shadow-sm"
                onClick={handleSave}
              >
                Salvar Alterações
              </Button>
              <Button variant="outline" className="flex-1 !rounded-md shadow-sm bg-white hover:bg-zinc-100" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
          </div>

          {/* Preferências de Notificação */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300">
            <div className="p-5 md:p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-0">
                Preferências
              </h2>
            </div>

            <div className="p-5 md:p-6 space-y-4">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-zinc-300 text-[#820000] focus:ring-[#820000] cursor-pointer"
                />
                <span className="ml-3 text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
                  Receber notificações de agendamentos
                </span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-zinc-300 text-[#820000] focus:ring-[#820000] cursor-pointer"
                />
                <span className="ml-3 text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
                  Receber ofertas e promoções
                </span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-zinc-300 text-[#820000] focus:ring-[#820000] cursor-pointer"
                />
                <span className="ml-3 text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
                  Receber lembretes de compromissos
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300">
            <div className="p-5 md:p-6 border-b border-zinc-100">
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight mb-0">
                Informações da Conta
              </h3>
            </div>

            <div className="p-5 md:p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Membro desde</p>
                <p className="font-bold text-zinc-900 text-lg mb-0">{memberSince}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                <p className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 tracking-wide uppercase border border-emerald-100">
                  Verificado
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Agendamentos</p>
                <p className="font-bold text-zinc-900 text-lg mb-0">{appointmentCount} <span className="text-sm font-medium text-zinc-500 lowercase">realizados</span></p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-100 shadow-lg shadow-red-100/40 overflow-hidden transition-all duration-300">
            <div className="p-5 md:p-6 border-b border-red-200">
              <h3 className="text-xl font-bold text-red-900 tracking-tight mb-0">
                Zona de Risco
              </h3>
            </div>
            <div className="p-5 md:p-6">
              <Button
                variant="outline"
                className="w-full !rounded-md text-sm font-semibold !text-red-600 !border-red-300 hover:!bg-red-100 hover:!border-red-400 bg-white"
                onClick={() => setIsDeleteAccountOpen(true)}
              >
                Deletar Conta
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Deletar conta"
        message="Tem certeza que deseja deletar sua conta? Essa ação não pode ser desfeita."
        confirmLabel="Deletar conta"
        variant="danger"
      />
    </div>
  );
}
