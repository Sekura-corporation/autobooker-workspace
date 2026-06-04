import { useEffect, useState } from "react";
import api from "@/services/api";
import { listAppointments } from "@/services/appointments.service";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
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
    <PageWrapper
      pageTitle="Meu Perfil"
      pageSubtitle="Gerencie suas informações pessoais"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Dados Pessoais */}
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Dados Pessoais
            </h2>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <AvatarUpload
                name={formData.name || user?.name || ""}
                avatar={user?.avatar}
                size="lg"
                onAvatarChange={(avatar) => updateUser({ avatar })}
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {formData.name || user?.name}
                </p>
                <p className="text-sm text-gray-500">{formData.email}</p>
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

            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1 bg-[#820000] hover:bg-[#660000]"
                onClick={handleSave}
              >
                Salvar Alterações
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </Card>

          {/* Preferências de Notificação */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Preferências
            </h2>

            <div className="space-y-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">
                  Receber notificações de agendamentos
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">
                  Receber ofertas e promoções
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">
                  Receber lembretes de compromissos
                </span>
              </label>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Informações da Conta
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Membro desde</p>
                <p className="font-semibold text-gray-900">{memberSince}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-green-600">Verificado</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Agendamentos</p>
                <p className="font-semibold text-gray-900">{appointmentCount} total</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-red-50 border border-red-200">
            <h3 className="text-lg font-bold text-red-900 mb-4">
              Zona de Risco
            </h3>
            <Button
              variant="outline"
              className="w-full border-red-600 text-red-600"
              onClick={() => setIsDeleteAccountOpen(true)}
            >
              Deletar Conta
            </Button>
          </Card>
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
    </PageWrapper>
  );
}
