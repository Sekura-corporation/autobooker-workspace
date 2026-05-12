import { useState } from "react";
import { updateAppointmentStatus } from "@/services/appointments.service";
import { useEffect } from "react";
import { listAppointments } from "@/services/appointments.service";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
type ClientAppointmentItem = any;
import {
  Trash2,
  CheckCircle,
  Calendar,
  Phone,
  Car,
  Truck,
  AlertCircle,
  Store,
} from "lucide-react";

export default function ClientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await listAppointments();
  
        const normalized = data.map((apt: any) => {
          const serviceObj = typeof apt.service === "object" ? apt.service : null;
          const storeObj = typeof apt.store === "object" ? apt.store : null;
          const vehicleObj = typeof apt.vehicle === "object" ? apt.vehicle : null;
        
          const scheduledAt =
            apt.scheduledAt ??
            apt.scheduled_at ??
            `${apt.appointment_date}T${apt.appointment_time}`;
        
          const rawDuration =
            serviceObj?.duration_minutes ??
            serviceObj?.duration ??
            apt.duration ??
            60;
        
          const duration =
            typeof rawDuration === "string"
              ? rawDuration.replace(" min min", " min")
              : `${rawDuration} min`;
        
          return {
            ...apt,
            scheduledAt,
        
            service:
              serviceObj?.name ??
              (typeof apt.service === "string" ? apt.service : null) ??
              apt.serviceName ??
              apt.service_name ??
              "Serviço agendado",
        
            storeName:
              storeObj?.name ??
              apt.storeName ??
              apt.store_name ??
              "Loja selecionada",
        
            vehicle:
              vehicleObj?.brand && vehicleObj?.model
                ? `${vehicleObj.brand} ${vehicleObj.model}`
                : typeof apt.vehicle === "string"
                  ? apt.vehicle
                  : apt.vehicleName ??
                    apt.vehicle_name ??
                    "Veículo selecionado",
        
            plate:
              vehicleObj?.plate ??
              apt.plate ??
              "",
        
            duration,
        
            price: Number(
              apt.price ??
              serviceObj?.price ??
              0
            ),
        
            loyaltyPoints: apt.loyaltyPoints ?? apt.loyalty_points ?? 0,
            hasPickup: apt.hasPickup ?? apt.has_pickup ?? false,
          };
        });
  
        setAppointments(normalized);
      } catch (error) {
        console.error("Erro ao buscar agendamentos", error);
      }
    }
  
    fetchAppointments();
  }, []);

  // Separar agendamentos por status
  const activeAppointment = appointments.find(
    (apt) =>
      apt.status === "pending" ||
      apt.status === "waiting" ||
      apt.status === "in_progress",
  );
  const completedAppointments = appointments
    .filter((apt) => apt.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Aguardando",
      waiting: "Aguardando",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const handleCancel = async (id: string) => {
    try {
      await updateAppointmentStatus(id, "cancelled");
  
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: "cancelled" } : apt,
        ),
      );
    } catch (error) {
      console.error("Erro ao cancelar agendamento", error);
      alert("Erro ao cancelar agendamento");
    }
  };

  // Calcular total com taxa e coleta
  const calculateTotal = (apt: ClientAppointmentItem) => {
    const subtotal = apt.price;
    const serviceFee = subtotal * 0.1; // 10%
    const pickupCost = apt.hasPickup ? 25 : 0;
    return {
      subtotal,
      serviceFee,
      pickupCost,
      total: subtotal + serviceFee + pickupCost,
    };
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Acompanhar Agendamentos
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm md:text-base font-medium">
          Visualize seus serviços agendados e histórico
        </p>
      </div>

      {/* STATUS ATUAL */}
      {activeAppointment && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Status Atual
          </h2>
          <Card className="p-0 overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#820000]" />
            <div className="p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                {/* TOP ROW: Date + Service Info - Compacto */}
                <div className="flex items-center gap-5">
                  {/* Date Box - Menor */}
                  <div className="bg-red-50 text-[#820000] rounded-xl p-3 flex flex-col items-center justify-center w-[80px] h-[80px] shadow-inner flex-shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-80">
                      {new Date(
                        activeAppointment.scheduledAt,
                      ).toLocaleDateString("pt-BR", { weekday: "short" })}
                    </span>
                    <span className="text-3xl font-black leading-none">
                      {new Date(activeAppointment.scheduledAt).getDate()}
                    </span>
                    <span className="text-xs font-semibold mt-1 opacity-90">
                      {new Date(
                        activeAppointment.scheduledAt,
                      ).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Details - Resumido */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-orange-100 text-orange-700 border-none px-3 py-0.5 text-xs font-bold">
                        {getStatusLabel(activeAppointment.status)}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                      {activeAppointment.service}
                    </h3>
                    <div className="flex flex-col gap-1 text-sm text-gray-600 font-medium">
                      <p className="flex items-center gap-1.5">
                        <Store className="w-4 h-4 flex-shrink-0" />
                        {activeAppointment.storeName}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Car className="w-4 h-4 flex-shrink-0" />
                        {activeAppointment.vehicle} ({activeAppointment.plate})
                      </p>
                    </div>
                  </div>

                  {/* Total - Destaque à direita */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">
                      Total
                    </p>
                    <p className="text-2xl font-extrabold text-[#820000]">
                      R$ {calculateTotal(activeAppointment).total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="border-t border-gray-200"></div>

                {/* COMPACT INFO ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1.5">
                      Duração
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {activeAppointment.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1.5">
                      Subtotal
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      R$ {calculateTotal(activeAppointment).subtotal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1.5">
                      Taxa
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      R${" "}
                      {calculateTotal(activeAppointment).serviceFee.toFixed(2)}
                    </p>
                  </div>
                  {activeAppointment.hasPickup && (
                    <div>
                      <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1.5">
                        Coleta
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        R${" "}
                        {calculateTotal(activeAppointment).pickupCost.toFixed(
                          2,
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* ALERTS & LOYALTY */}
                <div className="space-y-2.5">
                  {activeAppointment.hasPickup && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-900 font-medium">
                        <strong>Coleta em Domicílio:</strong> Buscaremos em sua
                        casa.
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 font-medium">
                      <strong>
                        +{activeAppointment.loyaltyPoints} Pontos Fidelidade
                      </strong>{" "}
                      nesta visita.
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-[#820000] hover:bg-[#660000] text-white rounded-lg shadow-sm font-bold py-2 flex items-center justify-center gap-2 text-sm"
                    onClick={() => alert("Entrando em contato...")}
                  >
                    <Phone className="w-4 h-4" />
                    Atendente
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-gray-600 hover:text-gray-900 border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2"
                    onClick={() => handleCancel(activeAppointment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Cancelar</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* HISTÓRICO RECENTE */}
      {completedAppointments.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Histórico Recente
            </h2>
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => navigate("/cliente/historico")}
            >
              Ver Todo o Histórico
            </Button>
          </div>

          <div className="space-y-3">
            {completedAppointments.slice(0, 3).map((appointment) => (
              <Card
                key={appointment.id}
                className="p-4 border border-gray-200 hover:border-gray-300 transition-colors rounded-lg"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-500">
                        {new Date(appointment.scheduledAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {appointment.service}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {appointment.vehicle}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-500">Serviço</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {appointment.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VAZIO */}
      {!activeAppointment && (
        <Card className="p-12 text-center rounded-2xl">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum agendamento
          </h3>
          <p className="text-gray-600 mb-6">
            Você ainda não possui agendamentos. Comece agora!
          </p>
          <Button
            className="bg-[#820000] hover:bg-[#660000] text-white font-bold"
            onClick={() => navigate("/cliente/novo-agendamento")}
          >
            Agendar um Serviço
          </Button>
        </Card>
      )}
    </div>
  );
}
