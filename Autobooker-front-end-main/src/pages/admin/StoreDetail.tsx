import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  Users,
  Wallet,
  FileText,
  Activity,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/shared/StatusBadge";
import { getAdminStore } from "@/services/admin.service";
import toast from "react-hot-toast";

type StoreStatus = "active" | "pending" | "completed" | "cancelled" | "paused";

interface StoreDetailData {
  id: number;
  name: string;
  cnpj: string;
  owner: string;
  status: StoreStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  address: string;
  phone: string;
  email: string;
  plan: string;
  planPrice: string;
  storeManager: string;
  totalAppointments: number;
  monthlyRevenue: string;
  rating: number;
  activeServices: number;
  activeClients: number;
  teamSize: number;
  operationalStatus: string;
  services: string[];
  recentNotes: string[];
  lastActivities: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  partners: string[];
}

const MOCK_STORE_DETAILS: StoreDetailData[] = [];

export default function AdminStoreDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentStore, setCurrentStore] = useState<StoreDetailData | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    address: "",
    plan: "",
    planPrice: "",
    operationalStatus: "",
    status: "active" as StoreStatus,
  });

  const fetchStoreDetail = async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const data = await getAdminStore(Number(params.id));
      const mappedStore: StoreDetailData = {
        id: data.id,
        name: data.name,
        cnpj: data.cnpj,
        owner: data.owner,
        status: data.status as StoreStatus,
        createdAt: data.created_at,
        approvedAt: data.approved_at || undefined,
        approvedBy: data.approved_at ? "Admin User" : undefined,
        address: data.address,
        phone: data.phone,
        email: data.email,
        plan: data.plan,
        planPrice: data.plan_price,
        storeManager: data.owner,
        totalAppointments: data.total_appointments,
        monthlyRevenue: data.monthly_revenue,
        rating: data.rating,
        activeServices: data.active_services,
        activeClients: data.active_clients,
        teamSize: data.team_size,
        operationalStatus: data.operational_status,
        services: data.services,
        recentNotes: data.recent_notes,
        lastActivities: data.last_activities,
        partners: data.partners,
      };
      setCurrentStore(mappedStore);
    } catch (err) {
      toast.error("Erro ao carregar os detalhes da loja");
    } finally {
      setLoading(false);
    }
  };

  useMemo(() => {
    fetchStoreDetail();
  }, [params.id]);

  const activityChartData = useMemo(() => {
    if (!currentStore?.lastActivities) return [];
    
    const grouped: { [key: string]: number } = {};
    currentStore.lastActivities.forEach((activity) => {
      const date = activity.date;
      grouped[date] = (grouped[date] || 0) + 1;
    });
    
    return Object.entries(grouped).map(([date, count]) => ({
      date,
      atividades: count,
    }));
  }, [currentStore?.lastActivities]);

  const openEditModal = () => {
    if (!currentStore) {
      return;
    }

    setEditForm({
      name: currentStore.name,
      owner: currentStore.owner,
      phone: currentStore.phone,
      email: currentStore.email,
      address: currentStore.address,
      plan: currentStore.plan,
      planPrice: currentStore.planPrice,
      operationalStatus: currentStore.operationalStatus,
      status: currentStore.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    // Integração futura: putAdminStore(currentStore.id, editForm)
    setCurrentStore((prev) =>
      prev
        ? {
            ...prev,
            ...editForm,
          }
        : prev,
    );
    setIsEditModalOpen(false);
    toast.success("Loja atualizada localmente (MOCK).");
  };

  const openAuditModal = () => {
    setIsAuditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#820000]"></div>
        <p className="text-zinc-600">Carregando detalhes da loja...</p>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Detalhe da Loja" subtitle="Loja não encontrada" />
        <Card>
          <p className="text-zinc-600">Não foi possível localizar esta loja.</p>
          <Button className="mt-4" onClick={() => navigate("/admin/lojas")}>
            Voltar para lojas
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Detalhe da Loja"
        subtitle="Raio-x completo da operação, cadastro, receita e histórico"
      >
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => navigate("/admin/lojas")}
        >
          <ArrowLeft size={18} />
          Voltar
        </Button>
        <Button variant="outline" className="gap-2" onClick={openEditModal}>
          <Edit3 size={18} />
          Editar loja
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Store size={20} className="text-[#820000]" />
            <StatusBadge status={currentStore.status} showIcon={false} />
          </div>
          <p className="text-2xl font-black text-zinc-900 truncate">
            {currentStore.name}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {currentStore.operationalStatus}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Wallet size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Receita
            </span>
          </div>
          <p className="text-2xl font-black text-zinc-900">
            {currentStore.monthlyRevenue}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Faturamento mensal estimado
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Users size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Clientes
            </span>
          </div>
          <p className="text-2xl font-black text-zinc-900">
            {currentStore.activeClients}
          </p>
          <p className="text-sm text-zinc-500 mt-1">Base ativa da unidade</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Star size={20} className="text-[#820000]" />
            <span className="text-xs font-semibold text-zinc-500 uppercase">
              Avaliação
            </span>
          </div>
          <p className="text-2xl font-black text-zinc-900">
            {currentStore.rating.toFixed(1)}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Satisfação do atendimento
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-zinc-900">
                  {currentStore.name}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {currentStore.plan} • {currentStore.planPrice}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={currentStore.status} />
                {currentStore.approvedAt && (
                  <p className="text-xs text-zinc-500">
                    Aprovada em {currentStore.approvedAt}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                  CNPJ
                </p>
                <p className="text-sm font-medium text-zinc-900 break-all">
                  {currentStore.cnpj}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                  Responsável
                </p>
                <p className="text-sm font-medium text-zinc-900">
                  {currentStore.owner}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                  Gestor
                </p>
                <p className="text-sm font-medium text-zinc-900">
                  {currentStore.storeManager}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                  Equipe
                </p>
                <p className="text-sm font-medium text-zinc-900">
                  {currentStore.teamSize} pessoas
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-[#820000]" />
              <h3 className="text-lg font-bold text-zinc-900">
                Operação e serviços
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs font-semibold uppercase text-blue-700 mb-1">
                  Agendamentos
                </p>
                <p className="text-2xl font-black text-blue-900">
                  {currentStore.totalAppointments}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-xs font-semibold uppercase text-emerald-700 mb-1">
                  Serviços ativos
                </p>
                <p className="text-2xl font-black text-emerald-900">
                  {currentStore.activeServices}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-xs font-semibold uppercase text-amber-700 mb-1">
                  Status operacional
                </p>
                <p className="text-sm font-bold text-amber-900 leading-snug">
                  {currentStore.operationalStatus}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentStore.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center rounded-full bg-[#820000]/10 px-3 py-1 text-xs font-semibold text-[#820000]"
                >
                  {service}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-[#820000]" />
              <h3 className="text-lg font-bold text-zinc-900">
                Histórico recente
              </h3>
            </div>

            {activityChartData.length > 0 && (
              <div className="mb-6 p-3 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-lg border border-zinc-200">
                <p className="text-xs font-semibold uppercase text-zinc-600 mb-3 tracking-wide">
                   Distribuição por data
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart 
                    data={activityChartData}
                    margin={{ top: 5, right: 10, left: -5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="#d4d4d8" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      axisLine={{ stroke: "#e4e4e7" }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      axisLine={{ stroke: "#e4e4e7" }}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1.5px solid #820000",
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        padding: "6px 8px"
                      }}
                      formatter={(value) => [value, "Atividades"]}
                      labelStyle={{ color: "#000", fontSize: 12, fontWeight: 600 }}
                      cursor={{ fill: "rgba(130, 0, 0, 0.05)" }}
                    />
                    <Bar
                      dataKey="atividades"
                      fill="#820000"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-4">
              {currentStore.lastActivities.map((activity) => (
                <div key={activity.title} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#820000] shrink-0" />
                  <div className="min-w-0 flex-1 border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                      {activity.date}
                    </p>
                    <p className="text-sm font-bold text-zinc-900 mt-1">
                      {activity.title}
                    </p>
                    <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={18} className="text-[#820000]" />
              <h3 className="text-lg font-bold text-zinc-900">
                Contato e endereço
              </h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Endereço
                  </p>
                  <p className="text-zinc-900 mt-1 leading-relaxed">
                    {currentStore.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Telefone
                  </p>
                  <p className="text-zinc-900 mt-1">{currentStore.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    E-mail
                  </p>
                  <p className="text-zinc-900 mt-1 break-all">
                    {currentStore.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={16}
                  className="text-zinc-400 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Cadastro
                  </p>
                  <p className="text-zinc-900 mt-1">
                    {new Date(currentStore.createdAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              </div>
              {currentStore.approvedBy && (
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="text-zinc-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                      Aprovado por
                    </p>
                    <p className="text-zinc-900 mt-1">
                      {currentStore.approvedBy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-[#820000]" />
              <h3 className="text-lg font-bold text-zinc-900">
                Parceiros e notas
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-3">
                  Parceiros
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentStore.partners.map((partner) => (
                    <span
                      key={partner}
                      className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-3">
                  Notas operacionais
                </p>
                <div className="space-y-2">
                  {currentStore.recentNotes.map((note) => (
                    <div
                      key={note}
                      className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700 leading-relaxed"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-[#820000]" />
              <h3 className="text-lg font-bold text-zinc-900">
                Auditoria e conformidade
              </h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                  Situação da auditoria
                </p>
                <p className="text-sm font-bold text-zinc-900">
                  {currentStore.approvedAt
                    ? "Concluída"
                    : "Pendente de revisão"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <p className="text-xs font-semibold uppercase text-blue-700 mb-1">
                    Aprovação
                  </p>
                  <p className="text-sm font-bold text-blue-900">
                    {currentStore.approvedAt ?? "Ainda não aprovada"}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-700 mb-1">
                    Responsável
                  </p>
                  <p className="text-sm font-bold text-emerald-900">
                    {currentStore.approvedBy ?? "Sistema"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={openAuditModal}
              >
                <ShieldCheck size={16} />
                Abrir modal de auditoria
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Loja"
        size="lg"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={handleSaveEdit}
            >
              Salvar alterações
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome da loja"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              label="Responsável"
              value={editForm.owner}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, owner: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <Input
              label="E-mail"
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <Input
            label="Endereço"
            value={editForm.address}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, address: e.target.value }))
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Plano"
              value={editForm.plan}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, plan: e.target.value }))
              }
            />
            <Input
              label="Valor do plano"
              value={editForm.planPrice}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, planPrice: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Status operacional"
              value={editForm.operationalStatus}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  operationalStatus: e.target.value,
                }))
              }
            />
            <label className="flex flex-col gap-2 text-sm font-semibold text-zinc-700">
              Status da loja
              <select
                className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 outline-none transition focus:border-[#820000]"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: e.target.value as StoreStatus,
                  }))
                }
              >
                <option value="pending">Pendente</option>
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Auditoria da Loja"
        size="lg"
        footer={
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => setIsAuditModalOpen(false)}
          >
            Fechar
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                Loja
              </p>
              <p className="text-sm font-bold text-zinc-900">
                {currentStore.name}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                Status
              </p>
              <StatusBadge status={currentStore.status} />
            </div>
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                Data de aprovação
              </p>
              <p className="text-sm font-bold text-zinc-900">
                {currentStore.approvedAt ?? "Aguardando aprovação"}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                Aprovado por
              </p>
              <p className="text-sm font-bold text-zinc-900">
                {currentStore.approvedBy ?? "Sem registro"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500 mb-3">
              Histórico de auditoria
            </p>
            <div className="space-y-3">
              {currentStore.lastActivities.map((activity) => (
                <div
                  key={activity.title}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    {activity.date}
                  </p>
                  <p className="text-sm font-bold text-zinc-900 mt-1">
                    {activity.title}
                  </p>
                  <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500 mb-3">
              Observações gerais
            </p>
            <div className="space-y-2">
              {currentStore.recentNotes.map((note) => (
                <div
                  key={note}
                  className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700 leading-relaxed"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
