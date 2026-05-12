import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export default function StockMovementModal({
  isOpen,
  onClose,
  productName,
}: StockMovementModalProps) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleMove = (action: "retirar" | "adicionar") => {
    console.log({
      action,
      quantity,
      reason,
      productName,
    });
    onClose();
  };

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
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Quantidade a alterar (Ex: 2)"
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
          />

          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo (Ex: Uso no box 1 / Chegada nota fiscal)"
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
          />

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleMove("retirar")}
              className="min-w-[128px] rounded-md border border-red-600 text-red-600 font-bold text-base py-2.5 px-6 hover:bg-red-50 transition-colors"
            >
              Retirar
            </button>
            <button
              type="button"
              onClick={() => handleMove("adicionar")}
              className="min-w-[152px] rounded-md bg-[#2E7D32] text-white font-bold text-base py-2.5 px-6 hover:bg-[#256A2A] transition-colors shadow-md"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
