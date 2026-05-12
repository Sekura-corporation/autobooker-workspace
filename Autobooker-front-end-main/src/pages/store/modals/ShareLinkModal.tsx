import { useRef, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import Button from "@/components/ui/Button";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug?: string;
}

export default function ShareLinkModal({
  isOpen,
  onClose,
  storeSlug = "lava-rapido-express",
}: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const storeUrl = `app.autoestetica.com/loja/${storeSlug}`;

  function handleCopy() {
    navigator.clipboard.writeText(`https://${storeUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-md shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">
            Seu Link de Marketplace
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-md hover:bg-zinc-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ícone central */}
        <div className="flex justify-center my-6">
          <div className="w-20 h-20 rounded-md bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-400/30">
            <div className="grid grid-cols-3 gap-[3px]">
              {["bg-red-400","bg-yellow-300","bg-blue-400","bg-blue-500","bg-orange-400","bg-green-400","bg-yellow-400","bg-red-500","bg-blue-300"].map(
                (color, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
                )
              )}
            </div>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-center text-sm text-zinc-500 mb-4 leading-relaxed">
          Compartilhe sua página com os clientes para que eles agendem sozinhos:
        </p>

        {/* Input do link */}
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={storeUrl}
          className="w-full border border-zinc-200 rounded-md px-4 py-3 text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#820000]/30 cursor-text mb-4"
          onFocus={() => inputRef.current?.select()}
        />

        {/* Botão Copiar */}
        <Button
          onClick={handleCopy}
          className="w-full justify-center gap-2 bg-[#820000] hover:bg-[#660000] text-white py-3 !rounded-md"
        >
          {copied ? (
            <>
              <Check size={16} />
              Link Copiado!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copiar Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
