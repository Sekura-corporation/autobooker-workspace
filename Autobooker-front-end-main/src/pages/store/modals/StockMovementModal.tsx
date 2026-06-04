import { useState } from "react";
import api from "@/services/api";
import { X } from "lucide-react";

interface StockItem {
  id: number;
  name: string;
}

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: StockItem | null;
  onCreated?: () => void | Promise<void>;
}

export default function StockMovementModal({
  isOpen,
  onClose,
  item,
  onCreated,
}: StockMovementModalProps) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleMove(type: "entry" | "exit") {
    if (!item) return;

    if (!quantity || Number(quantity) <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    try {
      setLoading(true);

      await api.post(`/store/stock/items/${item.id}/movement`, {
        type,
        quantity: Number(quantity),
        reason,
      });

      alert("Movimentação registrada com sucesso.");

      setQuantity("");
      setReason("");

      if (onCreated) {
        await onCreated();
      }

      onClose();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Erro ao registrar movimentação."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-md bg-white shadow-2xl border border-zinc-200 p-4 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-4">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#0B0B1A]">
            Movimentar Estoque
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 text-sm text-zinc-600">
          Produto:
          <span className="font-bold ml-1 text-zinc-900">
            {item?.name}
          </span>
        </div>

        <div className="space-y-4">
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Quantidade"
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm"
          />

          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo da movimentação"
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm"
          />

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleMove("exit")}
              className="min-w-[128px] rounded-md border border-red-600 text-red-600 font-bold text-base py-2.5 px-6 hover:bg-red-50"
            >
              Retirar
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleMove("entry")}
              className="min-w-[152px] rounded-md bg-[#2E7D32] text-white font-bold text-base py-2.5 px-6"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}