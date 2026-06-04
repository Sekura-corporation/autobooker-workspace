import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import api from "@/services/api";

interface NewRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: {
    id?: number;
    name: string;
    points_cost?: number;
    points?: string;
    active?: boolean;
    status?: string;
  } | null;
  onSaved?: () => void;
}

export default function NewRewardModal({
  isOpen,
  onClose,
  title,
  initialData,
  onSaved,
}: NewRewardModalProps) {
  const [rewardName, setRewardName] = useState(initialData?.name || "");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState(
    String(initialData?.points_cost ?? initialData?.points?.replace(" pts", "") ?? "")
  );
  const [status, setStatus] = useState(
    initialData?.active === false || initialData?.status === "inativa" ? "pausada" : "ativa"
  );

  // Reset form when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRewardName(initialData?.name || "");
      setPointsCost(
        String(initialData?.points_cost ?? initialData?.points?.replace(" pts", "") ?? "")
      );
      setStatus(
        initialData?.active === false || initialData?.status === "inativa" ? "pausada" : "ativa"
      );
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    try {
      const payload = {
        name: rewardName,
        points_cost: Number(pointsCost),
      };
  
      let savedReward;
  
      if (initialData?.id) {
        const response = await api.put(
          `/store/loyalty/rewards/${initialData.id}`,
          payload
        );
  
        savedReward = response.data.data;
      } else {
        const response = await api.post("/store/loyalty/rewards", payload);
  
        savedReward = response.data.data;
      }
  
      if (savedReward && status === "pausada" && savedReward.active === true) {
        await api.patch(`/store/loyalty/rewards/${savedReward.id}/toggle`);
      }
  
      if (savedReward && status === "ativa" && savedReward.active === false) {
        await api.patch(`/store/loyalty/rewards/${savedReward.id}/toggle`);
      }
  
      toast.success(initialData ? "Recompensa atualizada!" : "Recompensa criada!");
  
      if (onSaved) {
        onSaved();
      }
  
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar recompensa:", error);
      toast.error(error?.response?.data?.message || "Erro ao salvar recompensa.");
    }
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
