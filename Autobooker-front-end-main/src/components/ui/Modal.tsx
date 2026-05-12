import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  closeButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: "max-w-[min(92vw,28rem)]",
    md: "max-w-[min(94vw,42rem)]",
    lg: "max-w-[min(96vw,56rem)]",
    xl: "max-w-[min(98vw,72rem)]",
    "2xl": "max-w-[min(98vw,80rem)]",
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="modal-backdrop"
            role="presentation"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            key="modal-shell"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div
              className={`pointer-events-auto flex max-h-[min(90vh,880px)] w-full min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${sizeClasses[size]}`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
            >
              {(title || closeButton) && (
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                  {title && (
                    <h2
                      id="modal-title"
                      className="min-w-0 flex-1 text-lg font-bold text-[#050505] sm:text-xl"
                    >
                      {title}
                    </h2>
                  )}
                  {closeButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-[#050505]"
                      aria-label="Fechar"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
                {children}
              </div>

              {footer && (
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50 px-5 py-4 sm:px-6">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
