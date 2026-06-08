import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { CalendarDays, ChevronDown, Clock3, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type StoreService = {
  id: number | string;
  name: string;
  price: number | string;
};

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onCreated,
}: NewAppointmentModalProps) {
  const [phone, setPhone] = useState("");
  const [client, setClient] = useState<any | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState<StoreService[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadServices() {
      try {
        const response = await api.get("/store/services");
        setServices(response.data || []);

        if (response.data?.length > 0) {
          setServiceId(String(response.data[0].id));
        }
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        toast.error("Erro ao carregar serviços da loja.");
      }
    }

    loadServices();
  }, [isOpen]);

  if (!isOpen) return null;

  function resetForm() {
    setPhone("");
    setClient(null);
    setVehicles([]);
    setVehicleId("");
    setAppointmentDate("");
    setAppointmentTime("");
    setServiceId("");
  }

  async function handleSearchClient() {
    if (!phone) {
      toast.error("Informe o telefone do cliente.");
      return;
    }

    try {
      const response = await api.get("/store/customers/by-phone", {
        params: { phone },
      });

      const foundClient = response.data.data;

      setClient(foundClient);
      setVehicles(foundClient.vehicles || []);

      if (foundClient.vehicles?.length > 0) {
        setVehicleId(String(foundClient.vehicles[0].id));
      }

      toast.success(`Cliente encontrado: ${foundClient.name}`);
    } catch (error: any) {
      console.error("Erro ao buscar cliente:", error);

      setClient(null);
      setVehicles([]);
      setVehicleId("");

      toast.error(error?.response?.data?.message || "Cliente não encontrado.");
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phone || !vehicleId || !appointmentDate || !appointmentTime || !serviceId) {
      toast.error("Preencha todos os campos e selecione um veículo.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/store/appointments/manual", {
        phone,
        vehicle_id: vehicleId,
        appointment_date: appointmentDate,
        appointment_time: `${appointmentTime}:00`,
        service_id: serviceId,
      });

      toast.success("Agendamento criado com sucesso!");

      resetForm();
      onClose();

      if (onCreated) {
        onCreated();
      }
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);

      const message =
        error?.response?.data?.message || "Erro ao criar agendamento.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-md bg-white shadow-2xl border border-zinc-200 p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0B0B1A]">
            Lançar Novo Agendamento
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Celular do Cliente (Ex: 11 99999-9999)"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleSearchClient}
              className="!rounded-md whitespace-nowrap"
            >
              Buscar
            </Button>
          </div>

          {client && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-sm font-bold text-zinc-900">
                Cliente: {client.name}
              </p>
              <p className="text-xs text-zinc-500">
                Telefone: {client.phone}
              </p>
            </div>
          )}

          {vehicles.length > 0 && (
            <div className="relative">
              <select
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
                className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 pr-10 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand || vehicle.make || "Veículo"}{" "}
                    {vehicle.model || ""}{" "}
                    {vehicle.plate ? `- ${vehicle.plate}` : ""}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-800"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 pr-10 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              />

              <CalendarDays
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700"
              />
            </div>

            <div className="relative">
              <input
                type="time"
                value={appointmentTime}
                onChange={(event) => setAppointmentTime(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 pr-10 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              />

              <Clock3
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700"
              />
            </div>
          </div>

          <div className="relative">
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 pr-10 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
            >
              {services.length === 0 ? (
                <option value="">Nenhum serviço cadastrado</option>
              ) : (
                services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (
                    {Number(service.price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                    )
                  </option>
                ))
              )}
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-800"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full !rounded-md !py-3 text-lg font-bold shadow-lg shadow-[#820000]/20"
          >
            {loading ? "Criando..." : "Confirmar Horário"}
          </Button>
        </form>
      </div>
    </div>
  );
}