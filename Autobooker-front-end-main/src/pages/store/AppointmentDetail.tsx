import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Wrench,
  Car,
  FileText,
  Check,
  RefreshCw,
  MapPin,
  Clock,
  CalendarDays,
  Phone,
  ArrowLeft,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import AdvanceStatusModal from "./modals/AdvanceStatusModal";
import {
  getStoreAppointment,
  updateStoreAppointmentStatus,
} from "@/services/storeAppointments.service";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatSchedule(scheduledAt?: string) {
  if (!scheduledAt) return "Data não informada";

  const date = new Date(scheduledAt);

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    pending: "AGUARDANDO",
    waiting: "AGUARDANDO",
    in_progress: "EM ANDAMENTO",
    completed: "FINALIZADO",
    cancelled: "CANCELADO",
  };

  return labels[status ?? ""] ?? "AGUARDANDO";
}

export default function StoreAppointmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState("");
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  async function loadDetail() {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getStoreAppointment(id);
      setDetail(data);
      setInternalNotes(data?.notes ?? "");
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      alert("Erro ao carregar detalhes do agendamento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function handleUpdateStatus(nextStatus: string) {
    if (!id) return;

    try {
      await updateStoreAppointmentStatus(id, nextStatus);
      setIsAdvanceModalOpen(false);
      await loadDetail();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do agendamento.");
    }
  }

  if (loading) {
    return <p className="p-8 text-zinc-600">Carregando detalhes...</p>;
  }

  if (!detail) {
    return <p className="p-8 text-zinc-600">Agendamento não encontrado.</p>;
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-10 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Detalhes do Agendamento">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="!rounded-lg !py-2.5 !px-4 text-sm flex items-center gap-2 shadow-sm border-zinc-200 hover:bg-zinc-50 flex-1 sm:flex-none"
            onClick={() => navigate("/loja/agenda")}
          >
            <ArrowLeft size={16} /> Voltar
          </Button>

          {detail.status !== "completed" && detail.status !== "cancelled" && (
            <Button
              className="!rounded-lg !py-2.5 !px-6 text-sm shadow-sm flex items-center justify-center gap-2 bg-[#820000] hover:bg-[#6b0000] text-white flex-1 sm:flex-none"
              onClick={() => setIsAdvanceModalOpen(true)}
            >
              <RefreshCw size={16} /> Avançar Status
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#820000]/10 flex items-center justify-center text-[#820000] shrink-0">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {detail.customer}
            </h2>
            <p className="text-zinc-500 font-medium mt-1">
              {detail.vehicle}
              {detail.vehicleColor ? ` (${detail.vehicleColor})` : ""}
              <span className="mx-2">•</span>
              <span className="uppercase">{detail.plate ?? "Sem placa"}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 md:gap-12 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100">
          <div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
              Status Atual
            </p>
            <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-bold text-xs shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 animate-pulse" />
              {getStatusLabel(detail.status)}
            </span>
          </div>

          <div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1.5">
              Valor Total
            </p>
            <p className="text-2xl font-extrabold text-green-600">
              {formatMoney(Number(detail.price ?? 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-zinc-200/80 p-6 lg:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2 border-b border-zinc-100 pb-4">
              <Wrench className="text-zinc-400" size={22} /> Detalhes do Serviço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Serviço Contratado
                </p>
                <p className="text-zinc-900 font-semibold text-lg">
                  {detail.service}
                </p>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Data e Horário
                </p>
                <p className="text-zinc-900 font-semibold text-lg flex items-center gap-2">
                  <CalendarDays size={18} className="text-[#820000]" />
                  {formatSchedule(detail.scheduledAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Tempo Estimado
                </p>
                <p className="text-zinc-900 font-medium flex items-center gap-2">
                  <Clock size={16} className="text-zinc-500" />
                  {detail.duration}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-zinc-200/80 p-6 lg:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2 border-b border-zinc-100 pb-4">
              <Car className="text-zinc-400" size={22} /> Informações do Veículo
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Modelo do Veículo
                </p>
                <p className="text-zinc-900 font-semibold">{detail.vehicle}</p>
              </div>

              <div className="col-span-1">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Placa
                </p>
                <div className="inline-block bg-zinc-100 px-3 py-1 rounded-md border border-zinc-200 text-zinc-900 font-bold uppercase tracking-widest text-sm">
                  {detail.plate ?? "—"}
                </div>
              </div>

              <div className="col-span-1">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Cor
                </p>
                <p className="text-zinc-900 font-semibold">
                  {detail.vehicleColor ?? "Não informada"}
                </p>
              </div>

              <div className="col-span-2 md:col-span-4 mt-2">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Telefone / WhatsApp
                </p>
                <p className="text-zinc-900 font-medium flex items-center gap-2 text-lg">
                  <Phone size={18} className="text-green-600" />
                  {detail.customerPhone ?? "Não informado"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-[#820000]/20 bg-gradient-to-b from-[#820000]/5 to-white p-6 shadow-sm relative overflow-hidden">
            <MapPin className="absolute -right-6 -top-6 w-32 h-32 text-[#820000]/5 rotate-12" />

            <h3 className="text-lg font-bold text-[#820000] mb-6 flex items-center gap-2 relative z-10">
              <MapPin size={22} /> Coleta Leva e Traz
            </h3>

            <div className="mb-8 relative z-10 bg-white/60 p-4 rounded-xl border border-white backdrop-blur-sm shadow-sm">
              <p className="text-xs text-[#820000] font-bold uppercase tracking-wider mb-1.5">
                Endereço de Coleta
              </p>
              <p className="text-sm text-zinc-900 font-medium leading-relaxed">
                Não informado
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-zinc-200/80 space-y-7 mt-2 z-10 ml-2">
              <div className="relative">
                <div className="absolute -left-[35px] top-[-2px] w-7 h-7 rounded-full bg-green-500 ring-4 ring-white flex items-center justify-center shadow-sm">
                  <Check size={14} className="text-white stroke-[3]" />
                </div>
                <p className="text-sm font-bold text-zinc-900">
                  Agendamento recebido
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Aguardando atendimento
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[35px] top-[-2px] w-7 h-7 rounded-full ring-4 ring-white flex items-center justify-center bg-[#820000] shadow-sm">
                  <RefreshCw
                    size={14}
                    className="text-white stroke-[2.5] animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                </div>
                <p className="text-sm font-bold text-[#820000]">
                  Serviço em acompanhamento
                </p>
                <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                  Status: {getStatusLabel(detail.status)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-zinc-200/80 p-6 shadow-sm bg-white">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <FileText className="text-zinc-400" size={22} /> Observações
              Internas
            </h3>

            <textarea
              value={internalNotes}
              onChange={(event) => setInternalNotes(event.target.value)}
              placeholder="Adicione notas visíveis apenas para a equipe da loja..."
              rows={4}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] resize-none transition-all"
            />

            <Button className="w-full mt-4 !rounded-xl !py-3 text-sm font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 shadow-sm">
              Salvar Notas
            </Button>
          </Card>
        </div>
      </div>

      <AdvanceStatusModal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onMoveToWashing={() => handleUpdateStatus("in_progress")}
        onFinishService={() => handleUpdateStatus("completed")}
      />
    </div>
  );
}