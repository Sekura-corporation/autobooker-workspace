import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface AdvanceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoveToWashing: () => void;
  onFinishService: () => void;
}

export default function AdvanceStatusModal({
  isOpen,
  onClose,
  onMoveToWashing,
  onFinishService,
}: AdvanceStatusModalProps) {
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
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-4">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#0B0B1A]">
            Avançar Status do Serviço
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

        <p className="text-center text-zinc-500 text-sm sm:text-base leading-relaxed mb-5">
          Notificaremos o cliente sobre esta mudança através do App do Cliente.
        </p>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={onMoveToWashing}
            className="w-full !rounded-md !py-2.5 text-base font-bold !border-orange-500 !text-orange-500 hover:!bg-orange-50"
          >
            Mover para: EM LAVAGEM
          </Button>

          <button
            type="button"
            onClick={onFinishService}
            className="w-full py-2.5 text-base font-bold text-white bg-[#2E7D32] hover:bg-[#256A2A] transition-colors rounded-md"
          >
            Mover para: FINALIZADO E PRONTO
          </button>
        </div>
      </div>
    </div>
  );
}
