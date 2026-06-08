import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function QuickCustomerModal({
  isOpen,
  onClose,
  onCreated,
}: QuickCustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!name || !phone) {
      toast.error("Informe nome e telefone.");
      return;
    }
  
    try {
      setLoading(true);
  
      await api.post("/store/customers", {
        name,
        phone,
        plate,
      });
  
      toast.success("Cliente cadastrado com sucesso!");
  
      setName("");
      setPhone("");
      setPlate("");
  
      if (onCreated) {
        onCreated();
      }
  
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error(error?.response?.data?.message || "Erro ao cadastrar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-md bg-white shadow-2xl border border-zinc-200 p-4 sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-4">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#0B0B1A]">
            Cadastrar Cliente
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nome Completo"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              mask="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Telefone (WhatsApp)"
            />
            <Input
              mask="plate"
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
              placeholder="Placa do Veículo Preferencial"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full !rounded-md !py-3 text-lg font-bold shadow-lg shadow-[#820000]/20"
          >
            {loading ? "Salvando..." : "Salvar Cliente na Base"}
          </Button>
        </form>
      </div>
    </div>
  );
}
