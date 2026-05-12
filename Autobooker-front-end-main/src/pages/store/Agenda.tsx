import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
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
      alert("Erro ao carregar agenda do lojista.");
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
      alert("Erro ao atualizar status do agendamento.");
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
      />

      <Card className="rounded-md border-zinc-200 !p-5 md:!p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-full border border-zinc-200 rounded-md px-4 py-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as (typeof STATUS_OPTIONS)[number]["value"],
              )
            }
            className="w-full border border-zinc-200 rounded-md px-4 py-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="text-sm text-zinc-500">Carregando agendamentos...</p>
        )}

        {!loading && filteredAppointments.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nenhum agendamento encontrado.
          </p>
        )}

        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const statusInfo =
              STATUS_BADGE_MAP[appointment.status] ??
              STATUS_BADGE_MAP.pending;

            return (
              <Card
                key={appointment.id}
                className={`border-l-4 ${statusInfo.borderColor} !p-4`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="min-w-[72px]">
                      <p className="text-2xl leading-none font-black text-zinc-900">
                        {appointment.time}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        {appointment.duration}
                      </p>
                    </div>

                    <div className="pt-0.5">
                      <p className="text-2xl md:text-xl leading-tight font-black text-zinc-900">
                        {appointment.vehicle}
                        {appointment.plate ? ` (${appointment.plate})` : ""}
                      </p>
                      <p className="text-sm text-zinc-600">
                        {appointment.customer} • {appointment.service}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <Badge variant={statusInfo.badgeVariant}>
                      {statusInfo.label}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        onClick={() =>
                          navigate(`/loja/agenda/${appointment.id}`)
                        }
                        className="!py-2.5 !px-5 text-sm !rounded-md"
                      >
                        Ver Detalhes
                      </Button>

                      {appointment.status !== "completed" &&
                        appointment.status !== "cancelled" && (
                          <Button
                            variant={statusInfo.actionVariant}
                            onClick={() =>
                              handleActionClick(
                                appointment.id,
                                appointment.status,
                              )
                            }
                            className="!py-2.5 !px-5 text-sm !rounded-md"
                          >
                            {statusInfo.action}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
}