import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import api from "@/services/api";

interface RegisterExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterExpenseModal({
  isOpen,
  onClose,
}: RegisterExpenseModalProps) {
  const [motivo, setMotivo] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("fixas");

  if (!isOpen) return null;

  async function handleSubmit() {
    try {
      await api.post("/store/expenses", {
        description: motivo,
        amount: Number(valor),
        category: categoria,
      });
  
      toast.success("Despesa registrada com sucesso!");
  
      setMotivo("");
      setValor("");
      setCategoria("fixas");
  
      onClose();
    } catch (error) {
      console.error("Erro ao registrar despesa:", error);
  
      toast.error("Erro ao registrar despesa.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-md shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Registrar Despesa</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-md hover:bg-zinc-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Motivo (ex: Conta de Luz)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full border border-zinc-200 rounded-md px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#820000]/30"
          />
          <input
            type="number"
            placeholder="Valor (R$)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full border border-zinc-200 rounded-md px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#820000]/30"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border border-zinc-200 rounded-md px-4 py-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/30 bg-white"
          >
            <option value="fixas">Fixas (Aluguel, Luz)</option>
            <option value="variaveis">Variáveis (Insumos, Extras)</option>
            <option value="pessoal">Pessoal (Salários)</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        {/* Botão */}
        <Button
          variant="outline"
          onClick={handleSubmit}
          className="w-full justify-center mt-5 py-3 text-[#820000] border-[#820000] font-bold !rounded-md"
        >
          Lançar Saída
        </Button>
      </div>
    </div>
  );
}
