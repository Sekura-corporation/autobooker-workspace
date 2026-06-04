import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import ChangePlanModal from "./modals/ChangePlanModal";
import AvatarUpload from "@/components/ui/AvatarUpload";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function StoreProfile() {
  const { user, updateUser } = useAuth();
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const [storeData, setStoreData] = useState({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    description: "",
    opening_hours: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/store/profile");

        setStoreData({
          name: response.data.data.name || "",
          cnpj: response.data.data.cnpj || "",
          phone: response.data.data.phone || "",
          email: response.data.data.email || "",
          address: response.data.data.address || "",
          city: response.data.data.city || "",
          state: response.data.data.state || "",
          zip_code: response.data.data.zip_code || "",
          description: response.data.data.description || "",
          opening_hours: response.data.data.opening_hours || "",
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }

    loadProfile();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave() {
    try {
      await api.put("/store/profile", storeData);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil.");
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Perfil da Loja"
        subtitle="Gerencie as informações públicas da sua estética"
      >
        <Button
          onClick={handleSave}
          className="shadow-md w-full sm:w-auto !rounded-md !px-6 !py-2.5"
        >
          Salvar Alterações
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        <div className="flex flex-col gap-8">
          <Card className="p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Sua conta</h2>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-200">
              <AvatarUpload
                name={user?.name ?? ""}
                avatar={user?.avatar}
                size="lg"
                onAvatarChange={(avatar) => updateUser({ avatar })}
              />
              <div>
                <p className="font-bold text-zinc-900">{user?.name}</p>
                <p className="text-sm text-zinc-500">{user?.email}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">
              Dados da Empresa
            </h2>

            <div className="mb-6">
              <div className="w-[120px] h-[120px] border border-dashed border-zinc-300 rounded-md flex items-center justify-center bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors">
                <span className="text-sm font-medium text-zinc-500">
                  [ Alterar Logo ]
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  name="name"
                  value={storeData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={storeData.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={storeData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={storeData.cnpj}
                  disabled
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Descrição da Loja
                </label>
                <textarea
                  name="description"
                  value={storeData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-8">
          <Card className="p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">
              Localização
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  name="address"
                  value={storeData.address}
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={storeData.city}
                    onChange={handleChange}
                    className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={storeData.state}
                    onChange={handleChange}
                    maxLength={2}
                    className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={storeData.zip_code}
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  name="opening_hours"
                  value={storeData.opening_hours}
                  onChange={handleChange}
                  placeholder="Ex: Segunda a sábado, 08:00 às 18:00"
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Plano Atual</h2>
              <div className="flex items-center justify-center px-4 py-1.5 rounded-full border border-[#2e8b57] bg-green-50/50">
                <span className="text-[10px] font-bold text-[#2e8b57] tracking-widest">
                  ASSINATURA ATIVA
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-900 mb-2">
                Pacote Contratado
              </label>
              <input
                type="text"
                value="Plano Premium Integrado"
                disabled
                className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 cursor-not-allowed mb-2"
              />
              <p className="text-xs text-zinc-500 font-medium mt-3">
                Próxima renovação em: 15/11/2023
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsPlanModalOpen(true)}
              className="w-full mt-6 !border-[#820000] !text-[#820000] hover:bg-[#820000]/10 font-bold py-3 !rounded-md"
            >
              Alterar Plano
            </Button>
          </Card>
        </div>
      </div>

      <ChangePlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </div>
  );
}