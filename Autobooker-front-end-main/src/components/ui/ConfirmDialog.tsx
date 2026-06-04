import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Mantém o modal aberto em caso de erro.
    } finally {
      setLoading(false);
    }
  }

  const confirmClassName =
    variant === "danger"
      ? "!bg-red-700 hover:!bg-red-800 !text-white"
      : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="!py-2.5 !px-5 !text-sm"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={loading}
            className={`!py-2.5 !px-5 !text-sm ${confirmClassName}`}
          >
            {loading ? "Processando..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-600 leading-relaxed">{message}</p>
    </Modal>
  );
}
