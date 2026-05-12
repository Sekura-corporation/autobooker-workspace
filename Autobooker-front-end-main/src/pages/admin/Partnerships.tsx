import { useState } from "react";
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

const STORE_OPTIONS = [
  "Lava Rápido XL",
  "Fiat Auto",
  "Studio Black",
  "Auto Shine Premium",
  "VIP Detail Center",
];

const MOCK_PARTNERSHIPS: Partnership[] = [
  {
    id: 1,
    storeName: "Lava Rápido XL",
    partnerName: "Fiat Auto",
    partnerType: "Concessionária",
    region: "São Paulo - Capital",
    contactName: "Carla Menezes",
    contactEmail: "carla.menezes@fiatauto.com",
    contactPhone: "(11) 98888-1122",
    discountPercent: 15,
    status: "active",
    startDate: "2025-02-10",
    createdAt: "2025-02-10",
    benefits: ["Desconto em higienização", "Cupom cruzado", "Fila prioritária"],
    notes: "Parceria ativa com foco em clientes premium da concessionária.",
  },
  {
    id: 2,
    storeName: "Studio Black",
    partnerName: "BMW Motors",
    partnerType: "Concessionária",
    region: "Campinas - SP",
    contactName: "Marcos Lima",
    contactEmail: "marcos.lima@bmwmotors.com",
    contactPhone: "(19) 97777-4455",
    discountPercent: 12,
    status: "active",
    startDate: "2025-04-01",
    createdAt: "2025-04-01",
    benefits: ["Lavagem pós-entrega", "Desconto em vitrificação"],
    notes: "Apoio em entrega técnica e indicação de serviços premium.",
  },
  {
    id: 3,
    storeName: "Auto Shine Premium",
    partnerName: "Central Autopeças",
    partnerType: "Autopeças",
    region: "Ribeirão Preto - SP",
    contactName: "Renata Souza",
    contactEmail: "renata@centralautopecas.com",
    contactPhone: "(16) 99990-3344",
    discountPercent: 8,
    status: "pending",
    startDate: "2025-06-15",
    createdAt: "2025-06-15",
    benefits: ["Preço especial em insumos", "Recomendação mútua"],
    notes: "Aguardando validação jurídica e assinatura do termo comercial.",
  },
  {
    id: 4,
    storeName: "VIP Detail Center",
    partnerName: "Porto Seguros",
    partnerType: "Seguradora",
    region: "Santos - SP",
    contactName: "Fernando Alves",
    contactEmail: "fernando.alves@portoseguros.com",
    contactPhone: "(13) 98810-2233",
    discountPercent: 10,
    status: "paused",
    startDate: "2024-11-01",
    createdAt: "2024-11-01",
    updatedAt: "2025-03-20",
    benefits: ["Sinistro com priorização", "Check-up gratuito"],
    notes: "Parceria pausada para revisão de condições comerciais.",
  },
];

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
  const [selectedPartnership, setSelectedPartnership] =
    useState<Partnership | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] =
    useState<PartnershipFormData>(EMPTY_FORM_DATA);

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

  const handleSubmit = () => {
    if (
      !formData.storeName ||
      !formData.partnerName ||
      !formData.contactName ||
      !formData.contactEmail ||
      !formData.contactPhone ||
      !formData.discountPercent
    ) {
      alert("Preencha os campos obrigatórios da parceria.");
      return;
    }

    const payload: Partnership = {
      id:
        isEditing && selectedPartnership
          ? selectedPartnership.id
          : Math.max(...partnerships.map((item) => item.id), 0) + 1,
      storeName: formData.storeName,
      partnerName: formData.partnerName,
      partnerType: formData.partnerType,
      region: formData.region,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      discountPercent: Number(formData.discountPercent),
      status: formData.status,
      startDate: formData.startDate,
      createdAt:
        isEditing && selectedPartnership
          ? selectedPartnership.createdAt
          : new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      benefits: formData.benefits
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      notes: formData.notes,
    };

    setPartnerships((prev) =>
      isEditing && selectedPartnership
        ? prev.map((item) =>
            item.id === selectedPartnership.id ? payload : item,
          )
        : [payload, ...prev],
    );

    setIsFormModalOpen(false);
    resetForm();
  };

  const togglePartnershipStatus = (partnership: Partnership) => {
    const nextStatus: PartnershipStatus =
      partnership.status === "active"
        ? "paused"
        : partnership.status === "paused"
          ? "active"
          : partnership.status === "pending"
            ? "active"
            : "active";

    const today = new Date().toISOString().split("T")[0];
    setPartnerships((prev) =>
      prev.map((item) =>
        item.id === partnership.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: today,
            }
          : item,
      ),
    );

    setSelectedPartnership((prev) =>
      prev && prev.id === partnership.id
        ? { ...prev, status: nextStatus, updatedAt: today }
        : prev,
    );
  };

  const handleDeletePartnership = () => {
    if (!selectedPartnership) {
      return;
    }

    setPartnerships((prev) =>
      prev.filter((item) => item.id !== selectedPartnership.id),
    );
    setIsDeleteModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedPartnership(null);
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

        {filteredPartnerships.length === 0 ? (
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
                {STORE_OPTIONS.map((store) => (
                  <option key={store} value={store}>
                    {store}
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
                  contactPhone: e.target.value,
                }))
              }
            />
            <Input
              label="Desconto (%)"
              placeholder="15"
              type="number"
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  discountPercent: e.target.value,
                }))
              }
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
