import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import NewAppointmentModal from "./modals/NewAppointmentModal";
import {
  listStoreAppointments,
  updateStoreAppointmentStatus,
} from "@/services/storeAppointments.service";

type AppointmentStatus =
  | "pending"
  | "waiting"
  | "in_progress"
  | "completed"
  | "cancelled";

interface AgendaAppointment {
  id: string;
  scheduledAt?: string;
  time: string;
  duration: string;
  vehicle: string;
  plate?: string;
  customer: string;
  service: string;
  status: AppointmentStatus;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "pending", label: "Aguardando" },
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Finalizado" },
  { value: "cancelled", label: "Cancelado" },
] as const;

const STATUS_BADGE_MAP: Record<
  AppointmentStatus,
  {
    badgeVariant: "success" | "pending" | "error" | "neutral" | "loyalty";
    label: string;
    action: string;
    actionVariant: "primary" | "outline";
    borderColor: string;
  }
> = {
  pending: {
    badgeVariant: "pending",
    label: "AGUARDANDO",
    action: "Iniciar",
    actionVariant: "outline",
    borderColor: "border-l-orange-400",
  },
  waiting: {
    badgeVariant: "pending",
    label: "AGUARDANDO",
    action: "Iniciar",
    actionVariant: "outline",
    borderColor: "border-l-orange-400",
  },
  in_progress: {
    badgeVariant: "error",
    label: "EM ANDAMENTO",
    action: "Finalizar",
    actionVariant: "primary",
    borderColor: "border-l-[#820000]",
  },
  completed: {
    badgeVariant: "success",
    label: "FINALIZADO",
    action: "Ver Detalhes",
    actionVariant: "outline",
    borderColor: "border-l-green-500",
  },
  cancelled: {
    badgeVariant: "neutral",
    label: "CANCELADO",
    action: "Ver Detalhes",
    actionVariant: "outline",
    borderColor: "border-l-gray-400",
  },
};

function normalizeAppointment(appointment: any): AgendaAppointment {
  const scheduledAt = appointment.scheduledAt ?? appointment.scheduled_at;

  const time =
    appointment.time?.slice(0, 5) ??
    (scheduledAt
      ? new Date(scheduledAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--");

  return {
    id: String(appointment.id),
    scheduledAt,
    time,
    duration: appointment.duration ?? "60 min",
    vehicle: appointment.vehicle ?? "Veículo",
    plate: appointment.plate ?? "",
    customer: appointment.customer ?? "Cliente",
    service: appointment.service ?? "Serviço",
    status: appointment.status ?? "pending",
  };
}

export default function StoreAgenda() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");

  const [appointments, setAppointments] = useState<AgendaAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  async function loadAppointments() {
    try {
      setLoading(true);

      const data = await listStoreAppointments({
        date: selectedDate || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      const normalized = Array.isArray(data)
        ? data.map(normalizeAppointment)
        : [];

      setAppointments(normalized);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
      toast.error("Erro ao carregar agenda do lojista.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, statusFilter]);

  const filteredAppointments = useMemo(() => {
    return appointments;
  }, [appointments]);

  const handleActionClick = async (
    appointmentId: string,
    status: AppointmentStatus,
  ) => {
    try {
      if (status === "pending" || status === "waiting") {
        await updateStoreAppointmentStatus(appointmentId, "in_progress");
        await loadAppointments();
        return;
      }

      if (status === "in_progress") {
        await updateStoreAppointmentStatus(appointmentId, "completed");
        await loadAppointments();
        return;
      }

      navigate(`/loja/agenda/${appointmentId}`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do agendamento.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Agenda do Dia"
        subtitle="Gerenciamento de atendimentos diarios"
      >
        <Button
          className="!px-5 !py-3 text-sm shadow-md !rounded-md"
          onClick={() => setIsNewAppointmentOpen(true)}
        >
          + Novo Registro
        </Button>
      </PageHeader>

      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onCreated={loadAppointments}
      />

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300">
        <div className="p-5 md:p-6 border-b border-zinc-100 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">Filtros de Agendamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:max-w-xl">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-zinc-50"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as (typeof STATUS_OPTIONS)[number]["value"],
                )
              }
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-zinc-50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-5 md:p-6 bg-zinc-50/50">
          {loading && (
            <div className="py-12 text-center text-zinc-500 text-sm font-medium">Carregando agendamentos...</div>
          )}

          {!loading && filteredAppointments.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-sm font-medium">
              Nenhum agendamento encontrado para estes filtros.
            </div>
          )}

          <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusInfo =
              STATUS_BADGE_MAP[appointment.status] ??
              STATUS_BADGE_MAP.pending;

            return (
              <div
                key={appointment.id}
                className={`bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200 border-l-[6px] ${statusInfo.borderColor} p-5`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-start gap-5">
                    <div className="min-w-[84px] bg-red-50/80 p-3.5 rounded-xl border border-red-100/80 text-center flex flex-col justify-center">
                      <p className="text-2xl leading-none font-black text-[#820000]">
                        {appointment.time}
                      </p>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1.5">
                        {appointment.duration}
                      </p>
                    </div>

                    <div className="pt-1">
                      <p className="text-xl leading-tight font-bold text-zinc-900 mb-1">
                        {appointment.vehicle}
                        {appointment.plate && (
                          <span className="ml-2 bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border border-zinc-200 uppercase">
                            {appointment.plate}
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-medium text-zinc-500">
                        <span className="text-zinc-800 font-semibold">{appointment.customer}</span> • {appointment.service}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                    <Badge variant={statusInfo.badgeVariant}>
                      {statusInfo.label}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/loja/agenda/${appointment.id}`)
                        }
                        className="!py-1.5 !px-4 text-xs font-semibold bg-white hover:bg-zinc-100 transition-colors shadow-sm !rounded-md"
                      >
                        Ver Detalhes
                      </Button>

                      {appointment.status !== "completed" &&
                        appointment.status !== "cancelled" && (
                          <Button
                            variant={statusInfo.actionVariant === "primary" ? "primary" : "outline"}
                            onClick={() =>
                              handleActionClick(
                                appointment.id,
                                appointment.status,
                              )
                            }
                            className={
                              statusInfo.actionVariant === "primary"
                                ? "!py-1.5 !px-4 text-xs font-semibold shadow-sm !rounded-md"
                                : "!py-1.5 !px-4 text-xs font-semibold bg-white hover:bg-zinc-100 transition-colors shadow-sm !rounded-md"
                            }
                          >
                            {statusInfo.action}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}