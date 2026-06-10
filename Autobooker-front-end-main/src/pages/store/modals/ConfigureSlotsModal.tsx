import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Plus, Trash2, X } from "lucide-react";

type TimeSlot = {
  time: string;
  capacity: number;
};

type DaySchedule = {
  open: boolean;
  start: string;
  end: string;
  slots?: TimeSlot[];
};

type WeeklySchedule = {
  [key: string]: DaySchedule;
};

interface ConfigureSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklySchedule: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => void;
}

const dayNames: { [key: string]: string } = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
  dom: "Domingo",
};

export default function ConfigureSlotsModal({
  isOpen,
  onClose,
  weeklySchedule,
  onSave,
}: ConfigureSlotsModalProps) {
  const [localSchedule, setLocalSchedule] = useState<WeeklySchedule>({});

  useEffect(() => {
    if (isOpen && weeklySchedule) {
      // Deep clone weeklySchedule to local state to allow canceling changes
      setLocalSchedule(JSON.parse(JSON.stringify(weeklySchedule)));
    }
  }, [isOpen, weeklySchedule]);

  if (!isOpen) return null;

  const handleDayToggle = (day: string) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        open: !prev[day].open,
      },
    }));
  };

  const handleTimeChange = (day: string, field: "start" | "end", value: string) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleAddSlot = (day: string) => {
    setLocalSchedule((prev) => {
      const dayData = prev[day];
      const slots = dayData.slots ? [...dayData.slots] : [];
      slots.push({ time: "09:00", capacity: 1 });
      return {
        ...prev,
        [day]: {
          ...dayData,
          slots,
        },
      };
    });
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setLocalSchedule((prev) => {
      const dayData = prev[day];
      const slots = dayData.slots ? dayData.slots.filter((_, i) => i !== index) : [];
      return {
        ...prev,
        [day]: {
          ...dayData,
          slots,
        },
      };
    });
  };

  const handleSlotChange = (day: string, index: number, field: "time" | "capacity", value: string | number) => {
    setLocalSchedule((prev) => {
      const dayData = prev[day];
      if (!dayData.slots) return prev;
      const slots = [...dayData.slots];
      slots[index] = {
        ...slots[index],
        [field]: field === "capacity" ? Math.max(1, Number(value)) : value,
      };
      return {
        ...prev,
        [day]: {
          ...dayData,
          slots,
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSchedule);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-md bg-white shadow-2xl border border-zinc-200 p-5 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Configurar Horários e Vagas
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded text-zinc-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[60vh] mb-4">
            {Object.keys(localSchedule).map((day) => {
              const sched = localSchedule[day];
              if (!sched) return null;
              return (
                <div key={day} className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-[130px]">
                      <input
                        type="checkbox"
                        checked={sched.open}
                        onChange={() => handleDayToggle(day)}
                        className="w-4 h-4 text-[#820000] border-zinc-300 rounded focus:ring-[#820000]/20 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-zinc-800">
                        {dayNames[day]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 sm:justify-end">
                      {sched.open ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={sched.start}
                            onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                            className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                          />
                          <span className="text-xs text-zinc-400 font-bold">às</span>
                          <input
                            type="time"
                            value={sched.end}
                            onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                            className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                          Fechado
                        </span>
                      )}
                    </div>
                  </div>

                  {sched.open && (
                    <div className="mt-2 pl-6 pt-3 border-t border-zinc-200/60">
                      <span className="block text-xs font-bold text-zinc-600 mb-2">
                        Vagas por Horário (Atendimentos Simultâneos)
                      </span>
                      
                      <div className="space-y-2 mb-3">
                        {(sched.slots || []).map((slot, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="time"
                              value={slot.time}
                              onChange={(e) => handleSlotChange(day, index, "time", e.target.value)}
                              className="rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-zinc-500 font-medium">Vagas:</span>
                              <input
                                type="number"
                                min="1"
                                value={slot.capacity}
                                onChange={(e) => handleSlotChange(day, index, "capacity", Number(e.target.value))}
                                className="w-16 rounded border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(day, index)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Remover horário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {(sched.slots || []).length === 0 && (
                          <p className="text-[11px] text-zinc-400 font-medium">
                            Nenhum horário cadastrado. Clique no botão abaixo para adicionar.
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSlot(day)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#820000] hover:text-[#660000] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 mr-0.5" />
                        Adicionar Horário
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="!rounded-md !px-6 !py-2.5 text-[#820000] border-[#820000] hover:bg-[#820000]/10 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="!rounded-md !px-6 !py-2.5 bg-[#5e0000] hover:bg-[#4a0000] text-white font-bold"
            >
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
