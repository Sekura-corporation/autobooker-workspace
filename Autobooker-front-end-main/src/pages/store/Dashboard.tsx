import { useEffect, useState } from "react";
import api from "@/services/api";
import { Calendar, DollarSign, Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import MetricCard from "@/components/shared/MetricCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ShareLinkModal from "./modals/ShareLinkModal";
import RegisterExpenseModal from "./modals/RegisterExpenseModal";
import AdvanceStatusModal from "./modals/AdvanceStatusModal";

type DashboardData = {
  store: {
    id: number;
    name: string;
  };
  monthlyRevenue: number;
  todayAppointmentsCount: number;
  servedClients: number;
  lowStockCount: number;
  nextAppointment: any | null;
  recentServices: any[];
  todayAppointments: any[];
};

export default function StoreDashboard() {
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get("/store/dashboard");
  
        setDashboard(response.data.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
  
    loadDashboard();
  }, []);

  // ──────────────────────────────────────────────────────────
  // 1. DADOS DE RESUMO
  // ──────────────────────────────────────────────────────────
  const metricas = [
    {
      label: "Agendamento Hoje",
      valor: dashboard?.todayAppointmentsCount ?? 0,
      icone: Calendar,
      cor: "bg-zinc-100 text-zinc-600",
    },
    {
      label: "Faturamento (Mês)",
      valor: Number(
        dashboard?.monthlyRevenue ?? 0
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icone: DollarSign,
      cor: "bg-zinc-100 text-zinc-600",
    },
    {
      label: "Clientes Atendidos",
      valor: dashboard?.servedClients ?? 0,
      icone: Users,
      cor: "bg-zinc-100 text-zinc-600",
    },
    {
      label: "Estoque e Produtos Baixo",
      valor: `${dashboard?.lowStockCount ?? 0} ${
        (dashboard?.lowStockCount ?? 0) === 1 ? "Item" : "Itens"
      }`,
      icone: AlertCircle,
      cor: "bg-zinc-100 text-zinc-600",
    },
  ];

  // ──────────────────────────────────────────────────────────
  // 2. DADOS DE AGENDAMENTOS
  // ──────────────────────────────────────────────────────────
  const agendamentos =
  dashboard?.todayAppointments?.map((appointment: any) => ({
    id: appointment.id,

    hora: appointment.appointment_time?.slice(0, 5),

    cliente: appointment.client?.name || "Cliente",

    servico: `${appointment.service?.name || "Serviço não informado"} - ${
      appointment.vehicle?.model || "Veículo"
    }`,

    status:
      appointment.status === "completed"
        ? "completed"
        : "pending",

    borderColor:
      appointment.status === "completed"
        ? "border-l-green-500"
        : "border-l-orange-400",
  })) || [];

  // ──────────────────────────────────────────────────────────
  // 3. AÇÕES RÁPIDAS
  // ──────────────────────────────────────────────────────────
  const acoesRapidas: {
    texto: string;
    variante: "primary" | "secondary" | "outline";
    onClick?: () => void;
  }[] = [
    {
      texto: "+ Novo Agendamento (Balcão)",
      variante: "primary",
      onClick: () => navigate("/loja/agenda"),
    },
    {
      texto: "+ Cadastrar Cliente",
      variante: "secondary",
      onClick: () => navigate("/loja/clientes"),
    },
    {
      texto: "+ Registrar Despesas",
      variante: "outline",
      onClick: () => setIsExpenseModalOpen(true),
    },
  ];

  // ──────────────────────────────────────────────────────────
  // 4. MAPEAMENTO DE STATUS PARA BADGE
  // ──────────────────────────────────────────────────────────
  const statusMap: Record<
    "pending" | "completed",
    {
      variant: "success" | "pending" | "error" | "neutral" | "loyalty";
      label: string;
    }
  > = {
    pending: { variant: "pending", label: "AGUARDANDO" },
    completed: { variant: "success", label: "CONCLUÍDO" },
  };

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* SEÇÃO 1: CABEÇALHO */}
      <PageHeader
        title={dashboard?.store?.name || "Minha Loja"}
        subtitle="Dashboard / Resumo do dia"
      >
        <Button
          variant="outline"
          onClick={() => setIsShareModalOpen(true)}
          className="!rounded-md"
        >
          Compartilhar Link da Loja
        </Button>
      </PageHeader>

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storeSlug={
          dashboard?.store?.name
            ?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, "-")
        }
      />

      <RegisterExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
      <AdvanceStatusModal
        isOpen={selectedAppointmentId !== null}
        onClose={() => setSelectedAppointmentId(null)}
        onMoveToWashing={() => {
          console.log("Mover para: EM LAVAGEM", selectedAppointmentId);
          setSelectedAppointmentId(null);
        }}
        onFinishService={() => {
          console.log("Mover para: FINALIZADO E PRONTO", selectedAppointmentId);
          setSelectedAppointmentId(null);
        }}
      />

      {/* SEÇÃO 2: 4 CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica) => (
          <MetricCard
            key={metrica.label}
            title={metrica.label}
            value={metrica.valor}
            icon={metrica.icone}
            iconColorClass={metrica.cor}
          />
        ))}
      </div>

      {/* SEÇÃO 3: AGENDAMENTOS + AÇÕES RÁPIDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AGENDAMENTOS */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-zinc-900">
              Próximo Agendamento
            </h2>
          </div>

          <div className="space-y-4">
            {agendamentos.length > 0 ? (
              agendamentos.map((agendamento) => {
                const statusInfo = statusMap[agendamento.status];

                return (
                  <Card
                    key={agendamento.id}
                    className={`border-l-4 ${agendamento.borderColor} p-4!`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-zinc-900">
                            {agendamento.hora} - {agendamento.cliente}
                          </p>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <p className="text-xs text-zinc-500 mt-1">
                         {agendamento.servico}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        className="bg-red-900 hover:bg-red-800 text-white text-xs px-3 py-1.5 !rounded-md"
                        onClick={() => navigate(`/loja/agenda/${agendamento.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500">
                Nenhum agendamento para hoje.
              </p>
            )}
          </div>
        </div>

        {/* AÇÕES RÁPIDAS */}
        <div>
          <Card className="flex flex-col gap-3 rounded-md border-zinc-100 p-6">
            <h2 className="text-xl font-semibold text-black mb-1">
              Ações Rápidas
            </h2>
            {acoesRapidas.map((acao, idx) => (
              <Button
                key={idx}
                variant={acao.variante}
                onClick={acao.onClick}
                className="w-full justify-center text-sm py-3 !rounded-md"
              >
                {acao.texto}
              </Button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
