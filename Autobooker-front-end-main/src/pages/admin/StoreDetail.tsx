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
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/shared/StatusBadge";

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

const MOCK_STORE_DETAILS: StoreDetailData[] = [
  {
    id: 1,
    name: "Lava Jato Central",
    cnpj: "12.345.678/0001-90",
    owner: "Carlos Eduardo",
    status: "pending",
    createdAt: "2024-01-15",
    address: "Rua das Flores, 123 - São Paulo, SP",
    phone: "(11) 98765-4321",
    email: "contato@lavajato.com",
    plan: "Plano Pro",
    planPrice: "R$ 99,90 / mês",
    storeManager: "Carlos Eduardo",
    totalAppointments: 248,
    monthlyRevenue: "R$ 18.420,00",
    rating: 4.7,
    activeServices: 14,
    activeClients: 382,
    teamSize: 5,
    operationalStatus: "Em processo de aprovação",
    services: [
      "Lavagem Completa",
      "Polimento Técnico",
      "Higienização Interna",
      "Proteção de Pintura",
    ],
    recentNotes: [
      "Documentação enviada para análise final.",
      "Loja solicitou ativação de múltiplos usuários.",
      "Última validação cadastral realizada ontem.",
    ],
    lastActivities: [
      {
        date: "Hoje",
        title: "Cadastro atualizado",
        description: "Dados de contato revisados pela equipe administrativa.",
      },
      {
        date: "Ontem",
        title: "Aguardando aprovação",
        description: "Cadastro permanece pendente até confirmação manual.",
      },
    ],
    partners: ["Fiat Auto", "Central Autopeças", "Porto Seguros"],
  },
  {
    id: 3,
    name: "Douglas Details",
    cnpj: "12.345.678/0001-90",
    owner: "Carlos Eduardo",
    status: "active",
    createdAt: "2024-01-17",
    approvedAt: "2024-02-20",
    approvedBy: "Admin User",
    address: "Rua de Teste, 789 - São Paulo, SP",
    phone: "(11) 91234-5678",
    email: "douglas@details.com",
    plan: "Plano Master",
    planPrice: "R$ 497,90 / mês",
    storeManager: "Carlos Eduardo",
    totalAppointments: 1240,
    monthlyRevenue: "R$ 74.320,00",
    rating: 4.9,
    activeServices: 26,
    activeClients: 1042,
    teamSize: 12,
    operationalStatus: "Operação estabilizada",
    services: [
      "Estética Premium",
      "Vitrificação",
      "Martelinho",
      "Revisão Express",
    ],
    recentNotes: [
      "Taxa de conversão acima da média da rede.",
      "Parceiro ativo com fluxo recorrente de clientes.",
      "Indicador de satisfação acima de 95%.",
    ],
    lastActivities: [
      {
        date: "Hoje",
        title: "Rotina normal",
        description: "Não houve alertas operacionais nas últimas 24h.",
      },
      {
        date: "Ontem",
        title: "Check-in de auditoria",
        description: "Auditoria de rotina concluída sem pendências.",
      },
    ],
    partners: ["BMW Motors", "Porto Seguros", "Auto Shine Premium"],
  },
  {
    id: 4,
    name: "Auto Estética VIP",
    cnpj: "98.765.432/0001-10",
    owner: "Maria Silva",
    status: "active",
    createdAt: "2024-01-18",
    approvedAt: "2024-02-15",
    approvedBy: "Admin User",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    phone: "(11) 97777-8888",
    email: "vip@autoestetica.com",
    plan: "Plano Plus",
    planPrice: "R$ 997,90 / mês",
    storeManager: "Maria Silva",
    totalAppointments: 1892,
    monthlyRevenue: "R$ 122.540,00",
    rating: 5.0,
    activeServices: 38,
    activeClients: 2048,
    teamSize: 18,
    operationalStatus: "Operação premium ativa",
    services: [
      "Polimento Premium",
      "Proteção Cerâmica",
      "Estética Completa",
      "Detalhamento Interno",
    ],
    recentNotes: [
      "Maior receita da rede no mês corrente.",
      "Integração com parceiros funcionando normalmente.",
      "Equipe treinada para atendimento premium.",
    ],
    lastActivities: [
      {
        date: "Hoje",
        title: "Operação normal",
        description: "Volume alto de pedidos e confirmação automática ativa.",
      },
      {
        date: "Ontem",
        title: "Atualização de catálogo",
        description: "Novos serviços premium adicionados ao pacote.",
      },
    ],
    partners: ["BMW Motors", "Fiat Auto", "Porto Seguros"],
  },
];

export default function AdminStoreDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const initialStore = useMemo(
    () =>
      MOCK_STORE_DETAILS.find((item) => String(item.id) === params.id) ?? null,
    [params.id],
  );

  const [currentStore, setCurrentStore] = useState<StoreDetailData | null>(
    initialStore,
  );
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
    setCurrentStore((prev) =>
      prev
        ? {
            ...prev,
            name: editForm.name,
            owner: editForm.owner,
            phone: editForm.phone,
            email: editForm.email,
            address: editForm.address,
            plan: editForm.plan,
            planPrice: editForm.planPrice,
            operationalStatus: editForm.operationalStatus,
            status: editForm.status,
          }
        : prev,
    );
    setIsEditModalOpen(false);
  };

  const openAuditModal = () => {
    setIsAuditModalOpen(true);
  };

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
