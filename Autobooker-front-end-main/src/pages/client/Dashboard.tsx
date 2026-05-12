import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAppointments } from "@/services/appointments.service";
import { listVehicles } from "@/services/vehicles.service";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_BASE_PATHS } from "@/utils/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import MetricCard from "@/components/shared/MetricCard";
import { listStores } from "@/services/stores.service";
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  ChevronRight,
  Car,
  Award,
  CalendarDays,
  ExternalLink,
  Store,
} from "lucide-react";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [nearStores, setNearStores] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [appointmentsData, vehiclesData, storesData] = await Promise.all([
          listAppointments(),
          listVehicles(),
          listStores({ status: "active", limit: 2 }),
        ]);

        setAppointments(appointmentsData);
        setVehicles(vehiclesData);
        setNearStores(storesData);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      }
    }

    loadDashboard();
  }, []);

  const activeAppointments = appointments.filter((a) =>
    ["pending", "waiting", "in_progress"].includes(a.status),
  );

  const nextAppointment = [...activeAppointments].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )[0];

  const activeAppointmentsCount = activeAppointments.length;
  const totalVehicles = vehicles.length;

  const loyaltyPoints =
    appointments.filter((a) => a.status === "completed").length * 50;

  const recentHistory = [...appointments]
    .filter((a) => ["completed", "cancelled"].includes(a.status))
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* Header Actions & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Olá, {user?.name?.split(" ")[0] || "Cliente"}!
          </h2>
          <p className="text-gray-500 mt-1.5 text-sm md:text-base font-medium">
            Acompanhe seus próximos serviços, veículos e benefícios
          </p>
        </div>
        <Button
          onClick={() =>
            navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
          }
          className="bg-[#820000] hover:bg-[#660000] text-white flex items-center gap-2 px-6 py-6 shadow-lg shadow-red-900/20 rounded-xl transition-all"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="font-bold text-base">Novo Agendamento</span>
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Agendamentos Ativos"
          value={activeAppointmentsCount.toString()}
          icon={Calendar}
          iconColorClass="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title="Veículos Cadastrados"
          value={totalVehicles.toString()}
          icon={Car}
          iconColorClass="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          title="Pontos Fidelidade"
          value={loyaltyPoints.toString()}
          icon={Award}
          iconColorClass="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Next Appointment Card (Modernized Hero) */}
          {nextAppointment && (

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Próximo Serviço
              </h3>
              <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm relative group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#820000]" />
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Date/Time Tile */}
                    <div className="flex items-center gap-5 sm:gap-6">
                      <div className="bg-red-50 text-[#820000] rounded-2xl p-4 flex flex-col items-center justify-center w-[85px] h-[90px] shadow-inner">
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">
                          {new Date(nextAppointment.scheduledAt).toLocaleDateString("pt-BR", {
                            weekday: "short",
                          })}
                        </span>
                        <span className="text-3xl font-black leading-none">
                          {new Date(nextAppointment.scheduledAt).getDate()}
                        </span>
                        <span className="text-xs font-semibold mt-1 opacity-90">
                          {new Date(nextAppointment.scheduledAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Center: Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="pending"
                            className="bg-orange-100 text-orange-700 border-none px-2.5 py-0.5 shadow-sm text-xs font-bold"
                          >
                            {nextAppointment.status.toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 mb-1">
                          {nextAppointment.service}
                        </h4>
                        <p className="text-gray-500 font-medium flex items-center gap-2 text-sm">
                          <Car className="w-4 h-4 text-gray-400" />{" "}
                          {nextAppointment.vehicle} {nextAppointment.plate ? `(${nextAppointment.plate})` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-3 min-w-[160px] mt-4 md:mt-0 border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-6">
                      <Button
                        className="bg-gray-900 hover:bg-gray-800 text-white w-full rounded-xl shadow-sm"
                        onClick={() => {
                          setSelectedAppointment(nextAppointment);
                          setShowDetailModal(true);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-gray-600 hover:text-gray-900 rounded-xl"
                        onClick={() =>
                          navigate(`/${ROLE_BASE_PATHS.client}/agendamentos`)
                        }
                      >
                        Ir para Agenda
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Near Services (Marketplace Teaser) */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Estéticas Próximas
                </h3>
                <p className="text-sm text-gray-500">
                  Descubra os melhores serviços ao seu redor
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
                }
                className="text-[#820000] hover:text-[#660000] text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                Ver todas <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {nearStores.map((service: any) => (
                <Card
                  key={service.id}
                  className="p-5 hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-red-100 group rounded-2xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-red-50 group-hover:text-[#820000] transition-colors shadow-sm">
                      <Store className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-md border border-yellow-100">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-extrabold text-yellow-700">
                        {service.rating ?? "—"}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                    {service.name}
                  </h4>

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <p className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-gray-400" />{" "}
                      {service.city && service.state ? `${service.city} / ${service.state}` : "Localização não informada"}
                    </p>
                    <span className="text-xs text-gray-400 font-medium">
                      ({service.reviews ?? 0} avaliações)
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-8">
          {/* Recent History */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Histórico Recente
              </h3>
            </div>

            <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
              <div className="space-y-5">
                {recentHistory.map((item: any, idx) => (
                    <div
                      key={item.id}
                      className={`flex justify-between items-center ${
                        idx !== recentHistory.length - 1
                          ? "pb-5 border-b border-gray-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                          <Clock className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {item.service}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.scheduledAt
                              ? new Date(item.scheduledAt).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      </div>  
                      <Badge
                        variant="success"
                        className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 shadow-sm font-bold"
                      >
                        CONCLUÍDO
                      </Badge>
                    </div>
                  ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 text-gray-600 hover:text-gray-900 transition-colors rounded-xl border-gray-200"
                onClick={() => navigate(`/${ROLE_BASE_PATHS.client}/historico`)}
              >
                Ver Histórico Completo
              </Button>
            </Card>
          </section>
        </div>
      </div>

      {/* Modernized Appointment Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalhes do Agendamento"
      >
        {selectedAppointment && (
          <div className="space-y-5">
            {/* Header / Ticket Style */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-inner">
              <div className="flex justify-between items-start mb-5 pb-5 border-b border-gray-200/80">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Status Atual
                  </p>
                  <Badge
                    variant="pending"
                    className="bg-orange-100 text-orange-700 border-orange-200 shadow-sm font-bold"
                  >
                    {selectedAppointment.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Data Marcada
                  </p>
                  <p className="font-extrabold text-gray-900 text-sm">
                    Amanhã, 14:00
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Serviço Ofertado
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedAppointment.service}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Veículo
                  </p>
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5 bg-white w-max px-2 py-0.5 rounded-md border border-gray-200">
                    <Car className="w-3.5 h-3.5 text-gray-500" />{" "}
                    {selectedAppointment.vehicle}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Duração Est.
                  </p>
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />{" "}
                    {selectedAppointment.duration}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Local
                  </p>
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-gray-500" /> Matrix
                    Detail
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500 mt-2 mb-2">
              Precisa alterar algo? Gerencie este agendamento pela sua Agenda.
            </p>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-gray-600 hover:bg-gray-100 rounded-xl"
                onClick={() => setShowDetailModal(false)}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 bg-[#820000] hover:bg-[#660000] text-white shadow-md flex items-center justify-center gap-2 rounded-xl"
                onClick={() => {
                  navigate(`/${ROLE_BASE_PATHS.client}/agendamentos`);
                  setShowDetailModal(false);
                }}
              >
                Ver na Agenda <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
