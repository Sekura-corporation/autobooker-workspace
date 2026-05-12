import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface NewRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: {
    name: string;
    points: string;
    status: string;
  } | null;
}

export default function NewRewardModal({ isOpen, onClose, title, initialData }: NewRewardModalProps) {
  const [rewardName, setRewardName] = useState(initialData?.name || "");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState(initialData?.points.replace(" pts", "") || "");
  const [status, setStatus] = useState(initialData?.status || "ativa");

  // Reset form when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRewardName(initialData?.name || "");
      setPointsCost(initialData?.points.replace(" pts", "") || "");
      setStatus(initialData?.status || "ativa");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      rewardName,
      description,
      pointsCost,
      status,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-md bg-white shadow-2xl border border-zinc-200 p-6 md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {initialData ? "Editar Recompensa" : (title || "Criar Nova Recompensa")}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Nome do Brinde / Vantagem *
            </label>
            <input
              type="text"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder="Ex: Lavagem Grátis ou Desconto de 30%"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Descrição para o Cliente
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explique como o cliente aproveita o benefício..."
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Custo em Pontos para Resgate *
            </label>
            <input
              type="number"
              value={pointsCost}
              onChange={(e) => setPointsCost(e.target.value)}
              placeholder="Ex: 500"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-3">
              Status da Recompensa
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="reward_status"
                  value="ativa"
                  checked={status === "ativa"}
                  onChange={() => setStatus("ativa")}
                  className="w-4 h-4 text-purple-600 border-zinc-300 focus:ring-purple-600 accent-purple-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700">Ativa (Visível na loja)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="reward_status"
                  value="pausada"
                  checked={status === "pausada"}
                  onChange={() => setStatus("pausada")}
                  className="w-4 h-4 text-purple-600 border-zinc-300 focus:ring-purple-600 accent-purple-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700">Pausada / Rascunho</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full justify-center !rounded-md !py-3.5 bg-[#820000] hover:bg-[#660000] text-white font-bold text-base"
            >
              {initialData ? "Salvar Alterações" : "Criar Recompensa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
