import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  CreditCard,
  TrendingUp,
  Store,
  CalendarDays,
  PencilLine,
  Eye,
  PlayCircle,
  PauseCircle,
  Wallet,
  HandCoins,
  Info,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/shared/StatusBadge";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import {
  listAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  type AdminPlan,
} from "@/services/admin.service";

type PlanStatus = "active" | "pending" | "paused" | "cancelled";
type BillingCycle = "monthly" | "yearly";

interface Plan {
  id: number;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  setupFee: number;
  platformCommission: number;
  commissionType: "fixed" | "percentage";
  storeLimit: number;
  appointmentLimit: string;
  supportLevel: string;
  description: string;
  features: string[];
  revenueModel: string[];
  status: PlanStatus;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

type PlanFormData = {
  name: string;
  price: string;
  billingCycle: BillingCycle;
  setupFee: string;
  platformCommission: string;
  commissionType: "fixed" | "percentage";
  storeLimit: string;
  appointmentLimit: string;
  supportLevel: string;
  description: string;
  features: string;
  revenueModel: string;
  status: PlanStatus;
  isFeatured: boolean;
};

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: "Mensal",
  yearly: "Anual",
};

const MOCK_PLANS: AdminPlan[] = [];

const EMPTY_FORM: PlanFormData = {
  name: "",
  price: "",
  billingCycle: "monthly",
  setupFee: "0",
  platformCommission: "0",
  commissionType: "fixed",
  storeLimit: "1",
  appointmentLimit: "Ilimitado",
  supportLevel: "Suporte padrão",
  description: "",
  features: "",
  revenueModel: "",
  status: "pending",
  isFeatured: false,
};

export default function AdminPlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await listAdminPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const searchValue = searchTerm.toLowerCase();
    const nameMatch = plan.name?.toLowerCase().includes(searchValue) || false;
    const descMatch = plan.description?.toLowerCase().includes(searchValue) || false;
    const featureMatch = plan.features?.some((feature) =>
        feature?.toLowerCase().includes(searchValue)
    ) || false;
    
    const matchesSearch = nameMatch || descMatch || featureMatch;
    const matchesStatus =
      statusFilter === "all" || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activePlans = plans.filter((plan) => plan.status === "active").length;
  const pendingPlans = plans.filter((plan) => plan.status === "pending").length;
  const averagePrice =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + parseFloat(plan.price || "0"), 0) / plans.length
      : 0;
  const monthlyRevenue = plans
    .filter((plan) => plan.status === "active")
    .reduce((sum, plan) => sum + parseFloat(plan.price || "0"), 0);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(false);
    setSelectedPlan(null);
  };

  const handleNumberChange = (field: keyof PlanFormData, value: string) => {
    const digits = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, [field]: digits }));
  };

  const handleCurrencyChange = (field: keyof PlanFormData, value: string) => {
    let clean = value.replace(/[^\d.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }
    setFormData((prev) => ({ ...prev, [field]: clean }));
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (plan: AdminPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
    setFormData({
      name: plan.name,
      price: plan.price ? String(plan.price) : "0",
      billingCycle: plan.billing_cycle as BillingCycle,
      setupFee: plan.setup_fee ? String(plan.setup_fee) : "0",
      platformCommission: plan.platform_commission ? String(plan.platform_commission) : "0",
      commissionType: plan.commission_type as "fixed" | "percentage",
      storeLimit: plan.store_limit ? String(plan.store_limit) : "1",
      appointmentLimit: plan.appointment_limit,
      supportLevel: plan.support_level,
      description: plan.description,
      features: plan.features?.join(", ") || "",
      revenueModel: plan.revenue_model?.join(", ") || "",
      status: plan.status,
      isFeatured: Boolean(plan.is_featured),
    });
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (plan: AdminPlan) => {
    setSelectedPlan(plan);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (plan: AdminPlan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      toast.error("Preencha nome, preço e descrição do plano.");
      return;
    }
    setActionLoading(true);

    const payload: Partial<AdminPlan> = {
      name: formData.name,
      price: String(Number(formData.price)),
      billing_cycle: formData.billingCycle,
      setup_fee: String(Number(formData.setupFee || 0)),
      platform_commission: String(Number(formData.platformCommission || 0)),
      commission_type: formData.commissionType,
      store_limit: Number(formData.storeLimit || 1),
      appointment_limit: formData.appointmentLimit,
      support_level: formData.supportLevel,
      description: formData.description,
      features: formData.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      revenue_model: formData.revenueModel
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: formData.status,
      is_featured: formData.isFeatured,
    };

    try {
      if (isEditing && selectedPlan) {
        const updated = await updateAdminPlan(selectedPlan.id, payload);
        setPlans((prev) => prev.map((item) => (item.id === selectedPlan.id ? updated : item)));
        toast.success("Plano atualizado com sucesso!");
      } else {
        const created = await createAdminPlan(payload);
        setPlans((prev) => [created, ...prev]);
        toast.success("Plano criado com sucesso!");
      }

      setIsFormModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Erro ao salvar plano.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteAdminPlan(selectedPlan.id);
      setPlans((prev) => prev.filter((item) => item.id !== selectedPlan.id));
      toast.success("Plano apagado com sucesso.");
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      toast.error("Erro ao apagar plano.");
    } finally {
      setActionLoading(false);
    }
  };

  const togglePlanStatus = async (plan: AdminPlan) => {
    const nextStatus: PlanStatus =
      plan.status === "active"
        ? "paused"
        : plan.status === "paused"
          ? "active"
          : "active";

    try {
      const updated = await updateAdminPlan(plan.id, { status: nextStatus });
      setPlans((prev) =>
        prev.map((item) =>
          item.id === plan.id
            ? updated
            : item,
        ),
      );
      toast.success(`Plano ${nextStatus === "active" ? "ativado" : "pausado"}`);
    } catch (err) {
      toast.error("Erro ao mudar status do plano.");
    }
  };

  const revenueGain = (plan: AdminPlan) => {
    const setup = parseFloat(plan.setup_fee || "0");
    const monthly = parseFloat(plan.price || "0");
    const commissionVal = parseFloat(plan.platform_commission || "0");
    const commissionText =
      plan.commission_type === "percentage"
        ? `${commissionVal}% sobre parceiros`
        : `R$ ${commissionVal.toFixed(2)} fixo por transação`;

    return { setup, monthly, commissionText };
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Planos de Acesso"
        subtitle="Gestão de assinaturas, cobrança e monetização da plataforma"
      >
        <Button
          variant="primary"
          className="gap-2 w-full sm:w-auto"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Criar um novo plano</span>
          <span className="sm:hidden">Novo plano</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <CreditCard size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Ativos
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{activePlans}</p>
          <p className="text-sm text-zinc-500 mt-1">Planos em cobrança</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <CalendarDays size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Pendentes
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">{pendingPlans}</p>
          <p className="text-sm text-zinc-500 mt-1">Aguardando ativação</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Wallet size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Receita Mensal
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">
            R$ {monthlyRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-zinc-500 mt-1">Soma dos planos ativos</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Preço Médio
            </span>
          </div>
          <p className="text-3xl font-black text-zinc-900">
            R$ {averagePrice.toFixed(2)}
          </p>
          <p className="text-sm text-zinc-500 mt-1">Média por plano</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Buscar por nome ou recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000] w-full sm:w-auto sm:min-w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="pending">Pendentes</option>
          <option value="paused">Pausados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#820000]"></div>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const revenue = revenueGain(plan);
            const cycleLabel = BILLING_LABELS[plan.billing_cycle as BillingCycle] || "Mensal";

            return (
            <Card
              key={plan.id}
              variant="default"
              className="group relative overflow-hidden border border-zinc-200 p-0 shadow-[0_22px_60px_rgba(127,29,29,0.14)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className={`h-2 w-full rounded-2xl bg-linear-to-r ${
                  plan.isFeatured
                    ? "from-amber-400 via-orange-300 to-red-400"
                    : "from-[#820000] via-[#a00000] to-[#4F0000]"
                }`}
              />

              <div className="flex h-full flex-col justify-between bg-white p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center rounded-full bg-[#820000]/10 px-3 py-1 text-[11px] font-bold text-[#820000] uppercase tracking-wide">
                          {cycleLabel}
                        </span>
                        {plan.isFeatured && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                            Destaque
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-black text-zinc-900 truncate">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <StatusBadge
                      status={plan.status}
                      showIcon={false}
                      className="shrink-0"
                    />
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4 rounded-2xl bg-linear-to-br from-zinc-50 to-white p-4 ring-1 ring-zinc-100">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Valor mensal
                      </p>
                      <p className="mt-1 text-3xl font-black text-[#820000]">
                        R$ {parseFloat(plan.price || "0").toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Setup
                      </p>
                      <p className="mt-1 text-lg font-bold text-zinc-900">
                        R$ {revenue.setup.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Lojas
                      </p>
                      <p className="mt-1 text-base font-bold text-zinc-900">
                        {plan.store_limit}
                      </p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Comissão
                      </p>
                      <p className="mt-1 text-base font-bold text-zinc-900">
                        {plan.commission_type === "percentage"
                          ? `${parseFloat(plan.platform_commission || "0")}%`
                          : `R$ ${parseFloat(plan.platform_commission || "0").toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Store size={16} className="text-[#820000] shrink-0" />
                      <span>{plan.support_level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <HandCoins
                        size={16}
                        className="text-[#820000] shrink-0"
                      />
                      <span>{revenue.commissionText}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(plan.features || []).slice(0, 4).map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center rounded-full bg-[#820000]/8 px-3 py-1 text-xs font-semibold text-zinc-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-3 border-t border-zinc-100 pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="w-full text-xs px-3 py-2"
                      onClick={() => openDetailsModal(plan)}
                    >
                      <Eye size={16} className="mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full text-xs px-3 py-2"
                      onClick={() => openEditModal(plan)}
                    >
                      <PencilLine size={16} className="mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full text-xs px-3 py-2"
                      onClick={() => togglePlanStatus(plan)}
                    >
                      {plan.status === "active" ? (
                        <>
                          <PauseCircle size={16} className="mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <PlayCircle size={16} className="mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDeleteModal(plan)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                    Apagar plano
                  </button>
                </div>
              </div>
            </Card>
          );
          })
        )}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Editar Plano" : "Criar Novo Plano"}
        size="xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-4">
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
              {isEditing ? "Salvar Alterações" : "Salvar Plano"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome do Plano"
              placeholder="Plano Ultra"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <Input
              label="Preço base"
              placeholder="497.90"
              type="text"
              value={formData.price}
              onChange={(e) => handleCurrencyChange("price", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Ciclo de cobrança
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={formData.billingCycle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingCycle: e.target.value as BillingCycle,
                  }))
                }
              >
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <Input
              label="Taxa de adesão"
              placeholder="149.90"
              type="text"
              value={formData.setupFee}
              onChange={(e) => handleCurrencyChange("setupFee", e.target.value)}
            />
            <Input
              label="Lojas incluídas"
              placeholder="5"
              type="text"
              value={formData.storeLimit}
              onChange={(e) => handleNumberChange("storeLimit", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Modelo de comissão
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={formData.commissionType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    commissionType: e.target.value as "fixed" | "percentage",
                  }))
                }
              >
                <option value="fixed">Valor fixo por transação</option>
                <option value="percentage">Percentual sobre parceiros</option>
              </select>
            </div>
            <Input
              label="Valor da comissão"
              placeholder="5"
              type="text"
              value={formData.platformCommission}
              onChange={(e) => handleCurrencyChange("platformCommission", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Limite de agendamentos"
              placeholder="Ilimitado"
              value={formData.appointmentLimit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  appointmentLimit: e.target.value,
                }))
              }
            />
            <Input
              label="Nível de suporte"
              placeholder="Suporte premium"
              value={formData.supportLevel}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  supportLevel: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recursos incluídos"
              placeholder="Agenda ilimitada, relatórios avançados, multi-lojas"
              value={formData.features}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, features: e.target.value }))
              }
            />
            <Input
              label="Como a plataforma ganha"
              placeholder="Assinatura recorrente, taxa de adesão, comissão de parceiros"
              value={formData.revenueModel}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  revenueModel: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Descrição do plano
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Explique o objetivo do plano, para qual cliente ele é ideal e quais diferenciais ele entrega."
              className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as PlanStatus,
                  }))
                }
              >
                <option value="pending">Pendente</option>
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-8 sm:pt-0">
              <input
                id="featured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isFeatured: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-zinc-300 text-[#820000] focus:ring-[#820000]"
              />
              <label
                htmlFor="featured"
                className="text-sm font-semibold text-zinc-900"
              >
                Destacar como plano principal
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-900 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-blue-900 font-semibold uppercase mb-1">
                Monetização da plataforma
              </p>
              <p className="text-xs text-blue-900">
                Aqui você define quanto a plataforma cobra na assinatura, na
                adesão e em comissões por parceiros. Esse cadastro alimenta a
                visão de receita da operação.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes do Plano"
        size="xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Fechar
            </Button>
            {selectedPlan && (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => openDeleteModal(selectedPlan)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Apagar
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => openEditModal(selectedPlan)}
                >
                  <PencilLine size={16} className="mr-2" />
                  Editar
                </Button>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => togglePlanStatus(selectedPlan)}
                >
                  {selectedPlan.status === "active" ? (
                    <>
                      <PauseCircle size={16} className="mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <PlayCircle size={16} className="mr-2" />
                      Ativar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-200">
              <div className="min-w-0">
                <h3 className="text-2xl font-black text-zinc-900 truncate">
                  {selectedPlan.name}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {selectedPlan.description}
                </p>
              </div>
              <StatusBadge status={selectedPlan.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                  Valor mensal
                </p>
                <p className="text-lg font-black text-zinc-900">
                  R$ {parseFloat(selectedPlan.price || "0").toFixed(2)}
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                  Adesão
                </p>
                <p className="text-lg font-black text-zinc-900">
                  R$ {parseFloat(selectedPlan.setup_fee || "0").toFixed(2)}
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                  Comissão
                </p>
                <p className="text-lg font-black text-zinc-900">
                  {selectedPlan.commission_type === "percentage"
                    ? `${parseFloat(selectedPlan.platform_commission || "0")}%`
                    : `R$ ${parseFloat(selectedPlan.platform_commission || "0").toFixed(2)}`}
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                  Ciclo
                </p>
                <p className="text-lg font-black text-zinc-900">
                  {BILLING_LABELS[selectedPlan.billing_cycle as BillingCycle]}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-900 uppercase mb-1">
                  Limite de lojas
                </p>
                <p className="text-sm font-semibold text-blue-900">
                  {selectedPlan.store_limit} loja(s)
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-900 uppercase mb-1">
                  Limite de agendamentos
                </p>
                <p className="text-sm font-semibold text-amber-900">
                  {selectedPlan.appointment_limit}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-3">
                Recursos do plano
              </p>
              <div className="flex flex-wrap gap-2">
                {(selectedPlan.features || []).map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center rounded-full bg-[#820000]/10 px-3 py-1 text-xs font-semibold text-[#820000]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-3">
                Como a plataforma ganha
              </p>
              <div className="space-y-2">
                {(selectedPlan.revenue_model || []).map((rule) => (
                  <div key={rule} className="flex items-start gap-3">
                    <HandCoins
                      size={16}
                      className="text-[#820000] mt-0.5 shrink-0"
                    />
                    <p className="text-sm text-zinc-700">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                Resumo financeiro
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Receita recorrente
                  </p>
                  <p className="text-sm font-black text-zinc-900">
                    R$ {parseFloat(selectedPlan.price || "0").toFixed(2)} /{" "}
                    {BILLING_LABELS[selectedPlan.billing_cycle as BillingCycle]}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Receita inicial
                  </p>
                  <p className="text-sm font-black text-zinc-900">
                    R$ {parseFloat(selectedPlan.setup_fee || "0").toFixed(2)}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Comissão estratégica
                  </p>
                  <p className="text-sm font-black text-zinc-900">
                    {selectedPlan.commission_type === "percentage"
                      ? `${parseFloat(selectedPlan.platform_commission || "0")}% sobre parceiros`
                      : `R$ ${parseFloat(selectedPlan.platform_commission || "0").toFixed(2)} por transação`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info size={20} className="text-blue-900 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-900 font-semibold uppercase mb-1">
                  Monetização
                </p>
                <p className="text-xs text-blue-900">
                  Este plano define como a plataforma será monetizada:
                  assinatura recorrente, taxa de adesão e participação em
                  receitas geradas com parceiros.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Apagar Plano"
        size="sm"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-4">
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
              onClick={handleDeletePlan}
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
                Esta ação remove o plano permanentemente.
              </p>
              <p className="text-xs text-red-900">
                {selectedPlan
                  ? `${selectedPlan.name} - R$ ${parseFloat(selectedPlan.price || "0").toFixed(2)}`
                  : "O plano selecionado"}
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-700">
            Tem certeza que deseja apagar este plano? Se houver assinaturas
            ativas vinculadas, você pode optar por pausar antes de excluir.
          </p>
        </div>
      </Modal>
    </div>
  );
}
