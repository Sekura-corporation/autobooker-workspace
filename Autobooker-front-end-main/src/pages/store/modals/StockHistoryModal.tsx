import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "@/services/api";

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StockMovement {
  id: number;
  item_name: string;
  type: "entry" | "exit";
  quantity: number;
  reason: string | null;
  created_at: string;
}

export default function StockHistoryModal({
  isOpen,
  onClose,
}: StockHistoryModalProps) {
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadHistory() {
      try {
        setLoading(true);

        const { data } = await api.get("/store/stock/history");

        setHistory(data.data || []);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[650px] rounded-md bg-white shadow-2xl border border-zinc-200 p-4 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-2">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#0B0B1A]">
            Auditoria de Estoque
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-700 hover:bg-zinc-100 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="py-6 text-center text-zinc-500">
            Carregando...
          </div>
        ) : history.length === 0 ? (
          <div className="py-6 text-center text-zinc-500">
            Nenhuma movimentação registrada.
          </div>
        ) : (
          <div>
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className={`grid grid-cols-2 gap-4 py-4 ${
                  index < history.length - 1
                    ? "border-b border-zinc-200"
                    : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    {new Date(entry.created_at).toLocaleString("pt-BR")}
                  </p>

                  {entry.reason && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {entry.reason}
                    </p>
                  )}
                </div>

                <p
                  className={`text-sm font-bold ${
                    entry.type === "exit"
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {entry.type === "exit" ? "-" : "+"}
                  {entry.quantity} {entry.item_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}