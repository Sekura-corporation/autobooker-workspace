import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import ChangePlanModal from "./modals/ChangePlanModal";
import AvatarUpload from "@/components/ui/AvatarUpload";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

type DaySchedule = {
  open: boolean;
  start: string;
  end: string;
};

type WeeklySchedule = {
  [key: string]: DaySchedule;
};

const DEFAULT_SCHEDULE: WeeklySchedule = {
  seg: { open: true, start: "08:00", end: "18:00" },
  ter: { open: true, start: "08:00", end: "18:00" },
  qua: { open: true, start: "08:00", end: "18:00" },
  qui: { open: true, start: "08:00", end: "18:00" },
  sex: { open: true, start: "08:00", end: "18:00" },
  sab: { open: true, start: "08:00", end: "12:00" },
  dom: { open: false, start: "00:00", end: "00:00" },
};

const dayNames: { [key: string]: string } = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
  dom: "Domingo",
};

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
    logo_url: "",
    banner_url: "",
  });

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/store/profile");
        const rawStore = response.data.data;

        setStoreData({
          name: rawStore.name || "",
          cnpj: rawStore.cnpj || "",
          phone: rawStore.phone || "",
          email: rawStore.email || "",
          address: rawStore.address || "",
          city: rawStore.city || "",
          state: rawStore.state || "",
          zip_code: rawStore.zip_code || "",
          description: rawStore.description || "",
          opening_hours: rawStore.opening_hours || "",
          logo_url: rawStore.logo_url || "",
          banner_url: rawStore.banner_url || "",
        });

        const rawHours = rawStore.opening_hours;
        if (rawHours && rawHours.trim().startsWith("{")) {
          try {
            setWeeklySchedule(JSON.parse(rawHours));
          } catch (e) {
            console.error("Erro ao fazer parse dos horários:", e);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }

    loadProfile();
  }, []);

  const maskCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
      return digits
        .slice(0, 10)
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    }
    return digits
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  };

  const maskCEP = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits
      .slice(0, 8)
      .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    let val = value;
    if (name === "cnpj") val = maskCNPJ(value);
    if (name === "phone") val = maskPhone(value);
    if (name === "zip_code") val = maskCEP(value);

    setStoreData((prev) => ({
      ...prev,
      [name]: val,
    }));
  }

  const handleDayToggle = (day: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        open: !prev[day].open,
      },
    }));
  };

  const handleTimeChange = (day: string, field: "start" | "end", value: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setStoreData((prev) => ({
          ...prev,
          zip_code: data.cep || prev.zip_code,
          address: data.logradouro ? `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}` : prev.address,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  async function handleSave() {
    try {
      const payload = {
        ...storeData,
        opening_hours: JSON.stringify(weeklySchedule),
      };
      await api.put("/store/profile", payload);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil.");
    }
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação no frontend
    const maxSize = type === "logo" ? 2 * 1024 * 1024 : 4 * 1024 * 1024; // 2MB ou 4MB
    const allowedFormats = ["image/jpeg", "image/png", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    
    const fileExtension = file.name.substring(file.name.lastIndexOf("")).toLowerCase();

    console.log(`Arquivo: ${file.name}, Tipo MIME: ${file.type}, Tamanho: ${(file.size / 1024).toFixed(2)}KB, Extensão: ${fileExtension}`);

    // Valida pelo tipo MIME ou pela extensão
    const isValidByMime = allowedFormats.includes(file.type);
    const isValidByExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidByMime && !isValidByExtension) {
      toast.error(`Formato inválido (${file.type || "desconhecido"}). Use PNG, JPG ou WebP.`);
      return;
    }

    if (file.size > maxSize) {
      const limitMb = type === "logo" ? 2 : 4;
      toast.error(
        `Imagem muito grande. O limite é ${limitMb}MB (sua imagem tem ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      );
      return;
    }

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await api.post("/store/profile/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStoreData((prev) => ({
        ...prev,
        [`${type}_url`]: response.data.data[`${type}_url`],
      }));

      toast.success(
        `${type === "logo" ? "Logotipo" : "Banner"} atualizado com sucesso!`
      );
    } catch (error: any) {
      console.error("Erro ao fazer upload da imagem:", error);
      
      // Exibe o erro específico do servidor se disponível
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? Object.values(error.response.data.errors).join(", ") : 
                          "Erro ao enviar a imagem");
      
      toast.error(errorMessage);
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

            <div className="mb-6 flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-bold text-zinc-900">
                  Logotipo da Loja (1:1)
                </label>
                <div
                  className="relative w-[120px] h-[120px] border border-dashed border-zinc-300 rounded-md flex items-center justify-center bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors overflow-hidden group"
                  onClick={() => document.getElementById("logo-input")?.click()}
                >
                  {storeData.logo_url ? (
                    <>
                      <img
                        src={storeData.logo_url}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white text-center px-2">
                          Alterar Logo
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-400 text-center px-2">
                      [ Adicionar Logo ]
                    </span>
                  )}
                </div>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "logo")}
                />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <label className="block text-xs font-bold text-zinc-900">
                  Banner de Fundo
                </label>
                <div
                  className="relative w-full h-[120px] border border-dashed border-zinc-300 rounded-md flex items-center justify-center bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors overflow-hidden group"
                  onClick={() => document.getElementById("banner-input")?.click()}
                >
                  {storeData.banner_url ? (
                    <>
                      <img
                        src={storeData.banner_url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white text-center px-2">
                          Alterar Banner
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-400 text-center px-2">
                      [ Adicionar Banner ]
                    </span>
                  )}
                </div>
                <input
                  id="banner-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "banner")}
                />
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
                  onBlur={(e) => handleCepLookup(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-4">
                  Horário de Funcionamento
                </label>

                {storeData.opening_hours && !storeData.opening_hours.trim().startsWith("{") && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-medium text-yellow-800 leading-relaxed">
                    Sua configuração antiga está salva como texto livre: <strong className="font-bold">"{storeData.opening_hours}"</strong>. Ajuste os dias abaixo para atualizar para o novo formato estruturado e clique em salvar.
                  </div>
                )}

                <div className="space-y-2">
                  {Object.keys(weeklySchedule).map((day) => {
                    const sched = weeklySchedule[day];
                    return (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="flex items-center gap-2.5 min-w-[130px]">
                          <input
                            type="checkbox"
                            checked={sched.open}
                            onChange={() => handleDayToggle(day)}
                            className="w-4 h-4 text-[#820000] border-zinc-300 rounded focus:ring-[#820000]/20 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-zinc-800">
                            {dayNames[day]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-1 sm:justify-end">
                          {sched.open ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={sched.start}
                                onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                                className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                              />
                              <span className="text-xs text-zinc-400 font-bold">às</span>
                              <input
                                type="time"
                                value={sched.end}
                                onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                                className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                              />
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                              Fechado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
