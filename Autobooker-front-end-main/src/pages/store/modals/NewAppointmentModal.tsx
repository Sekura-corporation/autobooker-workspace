import { useState } from "react";
import { createAppointment } from "@/services/appointments.service";
import { CalendarDays, ChevronDown, Clock3, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES = [
  "Lavagem Simples (R$ 50)",
  "Lavagem Completa SUV (R$ 95)",
  "Polimento Cristalizado (R$ 180)",
  "Higienizacao Interna (R$ 130)",
] as const;

export default function NewAppointmentModal({
  isOpen,
  onClose,
}: NewAppointmentModalProps) {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState<(typeof SERVICES)[number]>(SERVICES[0]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      const [day, month, year] = date.split("/");
  
      await createAppointment({
        client_id: 1,
        store_id: 1,
        vehicle_id: 1,
        service_id: 1,
        appointment_date: `${year}-${month}-${day}`,
        appointment_time: `${time}:00`,
      } as any);
  
      alert("Agendamento criado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Erro ao criar agendamento");
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
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Celular do Cliente (Ex: 11 99999-9999)"
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                placeholder="dd/mm/aaaa"
                className="w-full rounded-md border border-zinc-300 bg-white px-4 pr-10 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              />
              <CalendarDays
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                placeholder="--:--"
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
              value={service}
              onChange={(event) => setService(event.target.value as (typeof SERVICES)[number])}
              className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-4 pr-10 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
            >
              {SERVICES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-800"
            />
          </div>

          <Button
            type="submit"
            className="w-full !rounded-md !py-3 text-lg font-bold shadow-lg shadow-[#820000]/20"
          >
            Confirmar Horario
          </Button>
        </form>
      </div>
    </div>
  );
}
