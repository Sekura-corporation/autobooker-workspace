import { X } from "lucide-react";

interface StockHistoryEntry {
  id: number;
  when: string;
  person: string;
  movement: string;
  tone: "positive" | "negative";
}

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HISTORY_ENTRIES: StockHistoryEntry[] = [
  {
    id: 1,
    when: "Hoje 10:30",
    person: "Lucas",
    movement: "-1 Cera Cristalizadora",
    tone: "negative",
  },
  {
    id: 2,
    when: "Ontem 18:00",
    person: "João Admin",
    movement: "+10 Shampoo Automotivo (Nota Fis)",
    tone: "positive",
  },
];

export default function StockHistoryModal({
  isOpen,
  onClose,
}: StockHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-md bg-white shadow-2xl border border-zinc-200 p-4 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-2">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#0B0B1A]">
            Auditoria de Insumos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          {HISTORY_ENTRIES.map((entry, index) => (
            <div
              key={entry.id}
              className={`grid grid-cols-2 gap-4 py-4 ${
                index < HISTORY_ENTRIES.length - 1 ? "border-b border-zinc-200" : ""
              }`}
            >
              <p className="text-zinc-900 text-sm sm:text-base leading-relaxed mb-0">
                {entry.when} - {entry.person}
              </p>
              <p
                className={`text-sm sm:text-base font-medium leading-relaxed mb-0 ${
                  entry.tone === "negative" ? "text-red-600" : "text-green-700"
                }`}
              >
                {entry.movement}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
