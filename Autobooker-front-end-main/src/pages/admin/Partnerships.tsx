import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Filter,
  Handshake,
  Building2,
  Store,
  Percent,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  PencilLine,
  Eye,
  PlayCircle,
  PauseCircle,
  Trash2,
  Info,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/shared/StatusBadge";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import {
  listAdminPartnerships,
  createAdminPartnership,
  updateAdminPartnership,
  deleteAdminPartnership,
  listAdminStores,
  type AdminPartnership,
  type AdminStore,
} from "@/services/admin.service";

type PartnershipStatus = "active" | "pending" | "paused" | "cancelled";

type PartnerType =
  | "Concessionária"
  | "Oficina Mecânica"
  | "Autopeças"
  | "Seguradora"
  | "Frota Corporativa"
  | "Outros";

interface Partnership {
  id: number;
  storeName: string;
  partnerName: string;
  partnerType: PartnerType;
  region: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  discountPercent: number;
  status: PartnershipStatus;
  startDate: string;
  createdAt: string;
  updatedAt?: string;
  benefits: string[];
  notes: string;
}

type PartnershipFormData = {
  storeName: string;
  partnerName: string;
  partnerType: PartnerType;
  region: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  discountPercent: string;
  status: PartnershipStatus;
  startDate: string;
  benefits: string;
  notes: string;
};

const PARTNERSHIP_TYPES: PartnerType[] = [
  "Concessionária",
  "Oficina Mecânica",
  "Autopeças",
  "Seguradora",
  "Frota Corporativa",
  "Outros",
];



const MOCK_PARTNERSHIPS: Partnership[] = [];

const EMPTY_FORM_DATA: PartnershipFormData = {
  storeName: "",
  partnerName: "",
  partnerType: "Concessionária",
  region: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  discountPercent: "15",
  status: "pending",
  startDate: new Date().toISOString().split("T")[0],
  benefits: "",
  notes: "",
};

export default function AdminPartnerships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [partnerships, setPartnerships] = useState(MOCK_PARTNERSHIPS);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [selectedPartnership, setSelectedPartnership] =
    useState<Partnership | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PartnershipFormData>(EMPTY_FORM_DATA);
  const [loading, setLoading] = useState(true);

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      const response = await listAdminPartnerships();
      const mapped: Partnership[] = response.data.map((item) => ({
        id: item.id,
        storeName: item.store_name,
        partnerName: item.partner_name,
        partnerType: item.partner_type as PartnerType,
        region: item.region,
        contactName: item.contact_name,
        contactEmail: item.contact_email,
        contactPhone: item.contact_phone,
        discountPercent: item.discount_percent,
        status: item.status as PartnershipStatus,
        startDate: item.start_date,
        createdAt: item.created_at,
        benefits: item.benefits || [],
        notes: item.notes || "",
      }));
      setPartnerships(mapped);
    } catch (err) {
      toast.error("Erro ao carregar parcerias");
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await listAdminStores();
      setStores(response || []);
    } catch (err) {
      console.error("Erro ao carregar lojas", err);
    }
  };

  useEffect(() => {
    fetchPartnerships();
    fetchStores();
  }, []);

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

  const handleDiscountChange = (value: string) => {
    let digits = value.replace(/\D/g, "");
    if (digits !== "") {
      const num = parseInt(digits, 10);
      if (num > 100) digits = "100";
    }
    setFormData((prev) => ({ ...prev, discountPercent: digits }));
  };

  const filteredPartnerships = partnerships.filter((partnership) => {
    const searchValue = searchTerm.toLowerCase();
    const matchesSearch =
      partnership.storeName.toLowerCase().includes(searchValue) ||
      partnership.partnerName.toLowerCase().includes(searchValue) ||
      partnership.contactName.toLowerCase().includes(searchValue) ||
      partnership.region.toLowerCase().includes(searchValue);
    const matchesStatus =
      statusFilter === "all" || partnership.status === statusFilter;
    const matchesType =
      typeFilter === "all" || partnership.partnerType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = partnerships.filter(
    (item) => item.status === "active",
  ).length;
  const pendingCount = partnerships.filter(
    (item) => item.status === "pending",
  ).length;
  const uniqueStores = new Set(partnerships.map((item) => item.storeName)).size;
  const averageDiscount =
    partnerships.length > 0
      ? Math.round(
          partnerships.reduce((sum, item) => sum + item.discountPercent, 0) /
            partnerships.length,
        )
      : 0;

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setSelectedPartnership(null);
    setIsEditing(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsEditing(true);
    setFormData({
      storeName: partnership.storeName,
      partnerName: partnership.partnerName,
      partnerType: partnership.partnerType,
      region: partnership.region,
      contactName: partnership.contactName,
      contactEmail: partnership.contactEmail,
      contactPhone: partnership.contactPhone,
      discountPercent: String(partnership.discountPercent),
      status: partnership.status,
      startDate: partnership.startDate,
      benefits: partnership.benefits.join(", "),
      notes: partnership.notes,
    });
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const openDetailModal = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.storeName ||
      !formData.partnerName ||
      !formData.contactName ||
      !formData.contactEmail ||
      !formData.contactPhone ||
      !formData.discountPercent
    ) {
      toast.error("Preencha os campos obrigatórios da parceria.");
      return;
    }

    const payload: Partial<AdminPartnership> = {
      store_name: formData.storeName,
      partner_name: formData.partnerName,
      partner_type: formData.partnerType,
      region: formData.region,
      contact_name: formData.contactName,
      contact_email: formData.contactEmail,
      contact_phone: formData.contactPhone,
      discount_percent: parseInt(formData.discountPercent) || 0,
      status: formData.status,
      start_date: formData.startDate,
      benefits: formData.benefits
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      notes: formData.notes,
    };

    try {
      if (isEditing && selectedPartnership) {
        const item = await updateAdminPartnership(selectedPartnership.id, payload);
        toast.success("Parceria atualizada com sucesso!");
        fetchPartnerships();
      } else {
        const item = await createAdminPartnership(payload);
        toast.success("Parceria cadastrada com sucesso!");
        fetchPartnerships();
      }

      setIsFormModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Erro ao salvar parceria.");
    }
  };

  const togglePartnershipStatus = async (partnership: Partnership) => {
    const nextStatus: PartnershipStatus =
      partnership.status === "active"
        ? "paused"
        : partnership.status === "paused"
          ? "active"
          : partnership.status === "pending"
            ? "active"
            : "active";

    try {
      await updateAdminPartnership(partnership.id, { status: nextStatus });
      toast.success("Status atualizado!");
      setPartnerships((prev) =>
        prev.map((item) =>
          item.id === partnership.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
      );

      setSelectedPartnership((prev) =>
        prev && prev.id === partnership.id
          ? { ...prev, status: nextStatus }
          : prev,
      );
    } catch (err) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeletePartnership = async () => {
    if (!selectedPartnership) {
      return;
    }

    try {
      await deleteAdminPartnership(selectedPartnership.id);
      toast.success("Parceria apagada com sucesso!");
      setPartnerships((prev) =>
        prev.filter((item) => item.id !== selectedPartnership.id),
      );
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedPartnership(null);
    } catch (err) {
      toast.error("Erro ao apagar parceria");
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Parcerias"
        subtitle="Gerencie integrações e descontos com parceiros da rede"
      >
        <Button
          variant="primary"
          className="gap-2 w-full sm:w-auto"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nova Parceria</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Handshake size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Ativas
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{activeCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Parceiros conectados</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <ClockIcon />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Pendentes
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{pendingCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Aguardando revisão</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Percent size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Desconto Médio
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">
            {averageDiscount}%
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Baseado em todos os acordos
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Building2 size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Estéticas
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{uniqueStores}</p>
          <p className="text-sm text-zinc-500 mt-1">Loja(s) com parcerias</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Buscar por loja, parceiro ou região..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000] w-full sm:w-auto sm:min-w-44"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Todos os tipos</option>
          {PARTNERSHIP_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          className="px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000] w-full sm:w-auto sm:min-w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="pending">Pendentes</option>
          <option value="paused">Pausadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              Parcerias Ativas
            </h2>
            <p className="text-sm text-zinc-500">
              Lojas e empresas relacionadas ao ecossistema automotivo.
            </p>
          </div>
          <Filter size={18} className="text-zinc-400 shrink-0" />
        </div>

        {loading ? (
          <div className="py-10 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#820000]"></div>
          </div>
        ) : filteredPartnerships.length === 0 ? (
          <Card>
            <div className="py-10 text-center text-zinc-500">
              Nenhuma parceria encontrada com esses filtros.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPartnerships.map((partnership) => (
              <Card key={partnership.id} variant="highlight" className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-zinc-900 truncate">
                      {partnership.storeName}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 truncate">
                      {partnership.partnerName}
                    </p>
                  </div>
                  <StatusBadge status={partnership.status} />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Store size={16} className="text-zinc-400 shrink-0" />
                    <span>{partnership.partnerType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700">
                    <MapPin size={16} className="text-zinc-400 shrink-0" />
                    <span className="truncate">{partnership.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Percent size={16} className="text-zinc-400 shrink-0" />
                    <span>Desconto de {partnership.discountPercent}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                    Benefícios
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {partnership.benefits.slice(0, 3).map((benefit) => (
                      <span
                        key={benefit}
                        className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-xs px-3 py-2"
                    onClick={() => openDetailModal(partnership)}
                  >
                    <Eye size={16} className="mr-2" />
                    Detalhes
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto text-xs px-3 py-2"
                    onClick={() => openEditModal(partnership)}
                  >
                    <PencilLine size={16} className="mr-2" />
                    Editar
                  </Button>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => openDeleteModal(partnership)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                    Apagar parceria
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePartnershipStatus(partnership)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-[#820000] transition-colors"
                  >
                    {partnership.status === "active" ? (
                      <PauseCircle size={14} />
                    ) : (
                      <PlayCircle size={14} />
                    )}
                    {partnership.status === "active"
                      ? "Pausar parceria"
                      : "Reativar parceria"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Editar Parceria" : "Cadastrar Parceria"}
        size="lg"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsFormModalOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={handleSubmit}
            >
              {isEditing ? "Salvar Alterações" : "Salvar Parceria"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Estética Participante
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={formData.storeName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                  }))
                }
              >
                <option value="">Selecione a loja...</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.name}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Empresa / Parceiro"
              placeholder="Nome do parceiro corporativo"
              value={formData.partnerName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  partnerName: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Tipo de Parceiro
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={formData.partnerType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    partnerType: e.target.value as PartnerType,
                  }))
                }
              >
                {PARTNERSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Região / Cidade"
              placeholder="Ex: São Paulo - Capital"
              value={formData.region}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, region: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome do Contato"
              placeholder="Responsável comercial"
              value={formData.contactName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactName: e.target.value,
                }))
              }
            />
            <Input
              label="E-mail do Contato"
              placeholder="contato@empresa.com"
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactEmail: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactPhone: maskPhone(e.target.value),
                }))
              }
            />
            <Input
              label="Desconto (%)"
              placeholder="Ex: 15"
              type="text"
              value={formData.discountPercent}
              onChange={(e) => handleDiscountChange(e.target.value)}
            />
            <Input
              label="Data de Início"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Status da Parceria
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as PartnershipStatus,
                  }))
                }
              >
                <option value="pending">Pendente</option>
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <Input
              label="Benefícios"
              placeholder="Desconto em estética, fila prioritária, cupom cruzado"
              value={formData.benefits}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, benefits: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Observações / Condições
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
              placeholder="Descreva as condições comerciais, regras de uso e observações importantes."
              className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000] resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-900 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase mb-1">
                Informação
              </p>
              <p className="text-xs text-blue-900">
                Registre parceiros estratégicos da rede automotiva, como
                concessionárias, oficinas, seguradoras e autopeças. O cadastro
                pode ser editado a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes da Parceria"
        size="lg"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Fechar
            </Button>
            {selectedPartnership && (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => openDeleteModal(selectedPartnership)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Apagar
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => openEditModal(selectedPartnership)}
                >
                  <PencilLine size={16} className="mr-2" />
                  Editar
                </Button>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => togglePartnershipStatus(selectedPartnership)}
                >
                  {selectedPartnership.status === "active" ? (
                    <>
                      <PauseCircle size={16} className="mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <PlayCircle size={16} className="mr-2" />
                      Reativar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedPartnership && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-200">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-zinc-900 truncate">
                  {selectedPartnership.storeName}
                </h3>
                <p className="text-sm text-zinc-500 mt-1 truncate">
                  {selectedPartnership.partnerName}
                </p>
              </div>
              <StatusBadge status={selectedPartnership.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                  Tipo de Parceiro
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {selectedPartnership.partnerType}
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                  Desconto
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {selectedPartnership.discountPercent}%
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                  Região
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {selectedPartnership.region}
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                  Início
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {new Date(selectedPartnership.startDate).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase mb-3">
                Contato Comercial
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold">
                      E-mail
                    </p>
                    <p className="text-sm text-zinc-900 break-all">
                      {selectedPartnership.contactEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold">
                      Telefone
                    </p>
                    <p className="text-sm text-zinc-900">
                      {selectedPartnership.contactPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Store size={18} className="text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold">
                      Responsável
                    </p>
                    <p className="text-sm text-zinc-900">
                      {selectedPartnership.contactName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase mb-3">
                Benefícios do Acordo
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPartnership.benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center rounded-full bg-[#820000]/10 px-3 py-1 text-xs font-semibold text-[#820000]"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                Observações
              </p>
              <p className="text-sm text-zinc-700 leading-relaxed">
                {selectedPartnership.notes}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-semibold uppercase mb-1">
                  Cadastro
                </p>
                <p className="text-sm font-semibold text-blue-900">
                  {new Date(selectedPartnership.createdAt).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-900 font-semibold uppercase mb-1">
                  Última atualização
                </p>
                <p className="text-sm font-semibold text-amber-900">
                  {selectedPartnership.updatedAt
                    ? new Date(
                        selectedPartnership.updatedAt,
                      ).toLocaleDateString("pt-BR")
                    : "Sem alterações"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Apagar Parceria"
        size="sm"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={handleDeletePartnership}
            >
              Confirmar exclusão
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <Trash2 size={20} className="text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">
                Esta ação remove a parceria definitivamente.
              </p>
              <p className="text-xs text-red-900">
                {selectedPartnership
                  ? `${selectedPartnership.storeName} com ${selectedPartnership.partnerName}`
                  : "A parceria selecionada"}
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-700">
            Tem certeza que deseja apagar esta parceria? Os dados serão
            removidos da lista.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function ClockIcon() {
  return <CalendarDays size={20} className="text-[#820000]" />;
}
