import { useState } from "react";
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

// ── Componentes de UI e Shared ──
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const data = [
  { name: "Jan", value: -50 },
  { name: "Feb", value: -40 },
  { name: "Mar", value: -30 },
  { name: "Apr", value: -10 },
  { name: "Mai", value: 20 },
  { name: "Jun", value: 50 },
];

const metrics = [
  {
    label: "Lojas Ativas",
    value: "152",
    icon: Home,
    color: "bg-zinc-100 text-zinc-600",
  },
  {
    label: "Clientes",
    value: "5.555",
    icon: Users2,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Agendamentos (Mês)",
    value: "4.555",
    icon: Calendar,
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "Receita Assinatura",
    value: "R$ 12.522",
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
  },
];

const pendingStores = [
  { name: "Lava Jato Central", cnpj: "CNPJ: 12.345.678/0001-90" },
  { name: "Lava Jato VIP", cnpj: "CNPJ: 98.765.432/0001-10" },
  { name: "Estética Auto Prime", cnpj: "CNPJ: 11.222.333/0001-44" },
];

const reportData = {
  period: "Últimos 30 dias",
  stores: 124,
  clients: 8430,
  revenue: 12270,
  pendingStores: 2,
  growth: "+15%",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleGenerateReport = () => {
    setIsReportModalOpen(true);
  };

  const handleExportCSV = () => {
    const csv = `Dados Consolidados (${reportData.period})
Lojas Ativas,${reportData.stores}
Clientes Atendidos,${reportData.clients}
Receita do Sistema,R$ ${reportData.revenue.toLocaleString()}
Lojas Pendentes,${reportData.pendingStores}`;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(csv),
    );
    element.setAttribute("download", "relatorio.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportPDF = () => {
    alert("Exportar em PDF ativado! (Implementar com biblioteca PDF)");
  };

  const handleAnalisarCadastro = () => {
    navigate("/admin/lojas");
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* 1. Usando o nosso PageHeader */}
      <PageHeader
        title="Visão Geral"
        subtitle="Aqui está o resumo da sua operação hoje."
      >
        <Button variant="secondary" className="gap-3">
          <Calendar size={18} className="text-zinc-400" />
          Últimos 30 dias
          <ChevronDown size={16} className="text-zinc-400 ml-2" />
        </Button>

        <Button variant="primary" onClick={handleGenerateReport}>
          Gerar Relatório
        </Button>
      </PageHeader>

      {/* 2. Grid de Métricas Limpo usando o MetricCard */}
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
        {/* 3. Container do Gráfico usando o Card refatorado */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-900">
              Crescimento de Assinatura
            </h3>
            <MoreVertical size={20} className="text-zinc-400 cursor-pointer" />
          </div>
          <div className="h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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

        {/* 4. Lista lateral (Pedidos de Loja) usando Card, Badge e Button */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Solicitações</h3>
              <p className="text-zinc-400 text-xs mt-1">(Lojas Pendentes)</p>
            </div>
            <Badge variant="pending">{pendingStores.length} Pendentes</Badge>
          </div>

          <div className="space-y-4">
            {pendingStores.map((store, i) => (
              <Card key={i} variant="highlight" className="bg-zinc-50">
                <h4 className="font-bold text-zinc-900 mb-1">{store.name}</h4>
                <p className="text-zinc-400 text-[10px] mb-6 font-medium uppercase tracking-tight">
                  {store.cnpj}
                </p>
                <Button
                  variant="primary"
                  className="w-full text-xs py-3"
                  onClick={handleAnalisarCadastro}
                >
                  Analisar Cadastro
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MODAL DE RELATÓRIO MELHORADO ─── */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Relatório de Desempenho"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsReportModalOpen(false)}
            >
              Fechar
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportCSV}
            >
              <Download size={16} />
              CSV
            </Button>
            <Button
              variant="primary"
              className="gap-2"
              onClick={handleExportPDF}
            >
              <FileText size={16} />
              PDF
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Período */}
          <div className="text-center pb-4 border-b border-zinc-200">
            <p className="text-sm text-zinc-500 font-semibold uppercase">
              Período do Relatório
            </p>
            <p className="text-2xl font-bold text-[#820000] mt-1">
              {reportData.period}
            </p>
          </div>

          {/* Grid de Métricas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Lojas Ativas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Store size={20} className="text-blue-600" />
                <TrendingUp size={18} className="text-green-500" />
              </div>
              <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                Lojas Ativas
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {reportData.stores}
              </p>
            </motion.div>

            {/* Clientes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Users2 size={20} className="text-emerald-600" />
                <TrendingUp size={18} className="text-green-500" />
              </div>
              <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">
                Clientes Atendidos
              </p>
              <p className="text-3xl font-bold text-emerald-900">
                {reportData.clients.toLocaleString()}
              </p>
            </motion.div>

            {/* Receita */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} className="text-amber-600" />
                <TrendingUp size={18} className="text-green-500" />
              </div>
              <p className="text-xs text-amber-600 font-semibold uppercase mb-1">
                Receita do Sistema
              </p>
              <p className="text-2xl font-bold text-amber-900">
                R$ {(reportData.revenue / 1000).toFixed(1)}k
              </p>
            </motion.div>

            {/* Pendências */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-linear-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingDown size={20} className="text-red-600" />
                <Badge variant="pending">Ação</Badge>
              </div>
              <p className="text-xs text-red-600 font-semibold uppercase mb-1">
                Lojas Pendentes
              </p>
              <p className="text-3xl font-bold text-red-900">
                {reportData.pendingStores}
              </p>
            </motion.div>
          </div>

          {/* Destaque de Crescimento */}
          <div className="bg-linear-to-r from-[#820000] to-[#4F0000] rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white opacity-90">
                  Crescimento do Período
                </p>
                <p className="text-4xl font-black mt-2 text-white">
                  {reportData.growth}
                </p>
              </div>
              <TrendingUp size={48} className="text-white opacity-60" />
            </div>
          </div>

          {/* Informação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-900 font-semibold mb-1">
              Nota Importante
            </p>
            <p className="text-xs text-blue-800">
              O arquivo de exportação contém histórico financeiro detalhado de
              todas as operações e lojas parceiras durante o período
              selecionado.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
