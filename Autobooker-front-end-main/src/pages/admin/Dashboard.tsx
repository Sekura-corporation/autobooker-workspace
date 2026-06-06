import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Home,
  Users2,
  ChevronDown,
  MoreVertical,
  Download,
  FileText,
  Store,
  TrendingDown,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  getAdminDashboard,
  approveStore,
  rejectStore,
  type DashboardData,
  type PendingStore,
} from "@/services/admin.service";

// Gráfico fixo decorativo (crescimento simulado)
const chartData = [
  { name: "Jan", value: 10 },
  { name: "Fev", value: 20 },
  { name: "Mar", value: 35 },
  { name: "Abr", value: 30 },
  { name: "Mai", value: 55 },
  { name: "Jun", value: 70 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}k`;
  }
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // ─── Busca dados do dashboard ───────────────────────────────────────────────

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const data = await getAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        toast.error("Não foi possível carregar os dados do painel.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // ─── Ações de aprovação / rejeição ─────────────────────────────────────────

  async function handleApprove(store: PendingStore) {
    setApprovingId(store.id);
    try {
      await approveStore(store.id);
      toast.success(`Loja "${store.name}" aprovada com sucesso!`);
      // Atualiza localmente removendo da lista de pendentes
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                active_stores: prev.stats.active_stores + 1,
                pending_stores: prev.stats.pending_stores - 1,
              },
              pending_stores: prev.pending_stores.filter((s) => s.id !== store.id),
            }
          : prev
      );
    } catch {
      toast.error("Erro ao aprovar a loja. Tente novamente.");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(store: PendingStore) {
    if (!confirm(`Tem certeza que deseja rejeitar a loja "${store.name}"?`)) return;

    setRejectingId(store.id);
    try {
      await rejectStore(store.id);
      toast.success(`Loja "${store.name}" rejeitada.`);
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                pending_stores: prev.stats.pending_stores - 1,
              },
              pending_stores: prev.pending_stores.filter((s) => s.id !== store.id),
            }
          : prev
      );
    } catch {
      toast.error("Erro ao rejeitar a loja. Tente novamente.");
    } finally {
      setRejectingId(null);
    }
  }

  // ─── Export CSV ─────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    if (!dashboardData) return;
    const { stats } = dashboardData;
    const csv = `Dados Consolidados
Lojas Ativas,${stats.active_stores}
Lojas Pendentes,${stats.pending_stores}
Total de Usuários,${stats.total_users}
Clientes,${stats.clients}
Lojistas,${stats.store_owners}
Agendamentos Totais,${stats.total_appointments}
Receita Mensal de Assinaturas,R$ ${stats.monthly_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

    const el = document.createElement("a");
    el.href = "data:text/plain;charset=utf-8," + encodeURIComponent(csv);
    el.download = "relatorio-admin.csv";
    el.style.display = "none";
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  // ─── Métricas dinâmicas ─────────────────────────────────────────────────────

  const stats = dashboardData?.stats;

  const metrics = [
    {
      label: "Lojas Ativas",
      value: loading ? "…" : String(stats?.active_stores ?? 0),
      icon: Home,
      color: "bg-zinc-100 text-zinc-600",
    },
    {
      label: "Clientes",
      value: loading ? "…" : (stats?.clients ?? 0).toLocaleString("pt-BR"),
      icon: Users2,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Agendamentos",
      value: loading ? "…" : (stats?.total_appointments ?? 0).toLocaleString("pt-BR"),
      icon: Calendar,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Receita Assinatura",
      value: loading ? "…" : formatCurrency(stats?.monthly_revenue ?? 0),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const pendingStores = dashboardData?.pending_stores ?? [];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Header */}
      <PageHeader
        title="Visão Geral"
        subtitle="Aqui está o resumo da sua operação hoje."
      >
        <Button variant="secondary" className="gap-3">
          <Calendar size={18} className="text-zinc-400" />
          Últimos 30 dias
          <ChevronDown size={16} className="text-zinc-400 ml-2" />
        </Button>
        <Button variant="primary" onClick={() => setIsReportModalOpen(true)}>
          Gerar Relatório
        </Button>
      </PageHeader>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            key={metric.label}
          >
            <MetricCard
              title={metric.label}
              value={metric.value}
              icon={metric.icon}
              iconColorClass={metric.color}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfico de crescimento */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-900">
              Crescimento de Assinatura
            </h3>
            <MoreVertical size={20} className="text-zinc-400 cursor-pointer" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  dx={-15}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--brand-primary)"
                  strokeWidth={4}
                  dot={{
                    fill: "var(--brand-primary)",
                    r: 6,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lojas pendentes */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Solicitações</h3>
              <p className="text-zinc-400 text-xs mt-1">(Lojas Pendentes)</p>
            </div>
            <Badge variant="pending">
              {loading ? "…" : pendingStores.length} Pendentes
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[#820000]" />
            </div>
          ) : pendingStores.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <CheckCircle2 size={28} className="text-emerald-500" />
              <p className="text-sm font-semibold text-zinc-700">
                Nenhuma loja pendente
              </p>
              <p className="text-xs text-zinc-400">
                Todas as lojas foram homologadas.
              </p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {pendingStores.map((store) => (
                <Card key={store.id} variant="highlight" className="bg-zinc-50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-zinc-900 text-sm leading-snug">
                      {store.name}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                      Pendente
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-tight mb-1">
                    {store.cnpj || "CNPJ não informado"}
                  </p>
                  <p className="text-zinc-500 text-xs mb-1">
                    <span className="font-semibold">Responsável:</span> {store.owner}
                  </p>
                  {store.created_at && (
                    <p className="text-zinc-400 text-[10px] flex items-center gap-1 mb-4">
                      <Clock size={10} />
                      Cadastrado em {formatDate(store.created_at)}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-1 text-xs py-2"
                      onClick={() => handleApprove(store)}
                      disabled={approvingId === store.id || rejectingId === store.id}
                    >
                      {approvingId === store.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Aprovar"
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 text-xs py-2 !text-red-600 hover:!bg-red-50"
                      onClick={() => handleReject(store)}
                      disabled={approvingId === store.id || rejectingId === store.id}
                    >
                      {rejectingId === store.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Rejeitar"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs py-2 px-3"
                      onClick={() => navigate(`/admin/lojas/${store.id}`)}
                    >
                      Ver
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal de Relatório ─── */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Relatório de Desempenho"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReportModalOpen(false)}>
              Fechar
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download size={16} />
              CSV
            </Button>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => toast.success("PDF em breve!")}
            >
              <FileText size={16} />
              PDF
            </Button>
          </>
        }
      >
        {loading || !dashboardData ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#820000]" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-zinc-200">
              <p className="text-sm text-zinc-500 font-semibold uppercase">
                Dados em Tempo Real
              </p>
              <p className="text-2xl font-bold text-[#820000] mt-1">
                Painel Administrativo
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Store size={20} className="text-blue-600" />
                  <TrendingUp size={18} className="text-green-500" />
                </div>
                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                  Lojas Ativas
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats?.active_stores ?? 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users2 size={20} className="text-emerald-600" />
                  <TrendingUp size={18} className="text-green-500" />
                </div>
                <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">
                  Total de Clientes
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {(stats?.clients ?? 0).toLocaleString("pt-BR")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={20} className="text-amber-600" />
                  <TrendingUp size={18} className="text-green-500" />
                </div>
                <p className="text-xs text-amber-600 font-semibold uppercase mb-1">
                  Receita / Mês
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(stats?.monthly_revenue ?? 0)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown size={20} className="text-red-600" />
                  <Badge variant="pending">Ação</Badge>
                </div>
                <p className="text-xs text-red-600 font-semibold uppercase mb-1">
                  Lojas Pendentes
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {stats?.pending_stores ?? 0}
                </p>
              </motion.div>
            </div>

            <div className="bg-gradient-to-r from-[#820000] to-[#4F0000] rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white opacity-90">
                    Total de Usuários na Plataforma
                  </p>
                  <p className="text-4xl font-black mt-2 text-white">
                    {(stats?.total_users ?? 0).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Users2 size={48} className="text-white opacity-60" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900 font-semibold mb-1">
                Dados em tempo real
              </p>
              <p className="text-xs text-blue-800">
                Esses números refletem o estado atual do banco de dados.
                O CSV exportado incluirá todos os dados acima consolidados.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
