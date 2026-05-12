import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  customerName,
}: ReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] rounded-md bg-white shadow-2xl border border-zinc-200 p-3.5 sm:p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-dashed border-zinc-300 pb-2 mb-3">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#0B0B1A] uppercase">
            Recibo Autoestetica
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

        <div className="font-mono text-zinc-800">
          <div className="text-center border-b border-dashed border-zinc-300 pb-3 mb-3">
            <p className="mb-0 text-base">LAVA RAPIDO EXPRESS LTDA</p>
            <p className="mb-0 text-base">CNPJ: 12.345.678/0001-90</p>
          </div>

          <div className="border-b border-dashed border-zinc-300 pb-2.5 mb-2.5 text-sm">
            <p className="mb-1">
              <span className="font-bold">CLIENTE:</span> {customerName.toUpperCase()}
            </p>
            <p className="mb-0">
              <span className="font-bold">DATA:</span> 20/09/2023 | 14:30
            </p>
          </div>

          <div className="space-y-1.5 border-b border-dashed border-zinc-300 pb-2.5 mb-2.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span>Lavagem Premium</span>
              <span>R$ 150,00</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Cera de carnaúba</span>
              <span>R$ 0,00 (Combo)</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-dashed border-zinc-300 pb-2.5 mb-3 text-2xl font-bold">
            <span>TOTAL PAGO</span>
            <span>R$ 150,00</span>
          </div>

          <div className="text-center text-xs mb-3">
            <p className="mb-1">Pontos Acumulados nesta visita: +150 pts</p>
            <p className="mb-0">Obrigado pela preferência!</p>
          </div>
        </div>

        <Button className="w-full !rounded-md !py-2.5 text-base font-bold">
          Imprimir Recibo
        </Button>
      </div>
    </div>
  );
}
