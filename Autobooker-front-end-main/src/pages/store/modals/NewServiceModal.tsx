import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { unmaskCurrency } from "@/utils/masks";

export type ServiceFormPayload = {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  active: boolean;
};

export type ServiceModalInitial = ServiceFormPayload & { id: string };

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** null = novo cadastro */
  initialService: ServiceModalInitial | null;
  onSubmit: (payload: ServiceFormPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyForm: ServiceFormPayload = {
  name: "",
  description: "",
  price: 0,
  duration: 45,
  category: "",
  active: true,
};

export default function NewServiceModal({
  isOpen,
  onClose,
  title = "Cadastrar Novo Serviço",
  initialService,
  onSubmit,
  isSubmitting = false,
}: NewServiceModalProps) {
  const { error: toastError } = useToast();
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    if (initialService) {
      setServiceName(initialService.name);
      setDescription(initialService.description ?? "");
      setPrice(
        Number.isFinite(initialService.price)
          ? String(initialService.price)
          : "",
      );
      setDurationMinutes(String(initialService.duration));
      setCategory(initialService.category ?? "");
      setActive(initialService.active);
    } else {
      setServiceName(emptyForm.name);
      setDescription(emptyForm.description);
      setPrice("");
      setDurationMinutes(String(emptyForm.duration));
      setCategory(emptyForm.category);
      setActive(emptyForm.active);
    }
  }, [isOpen, initialService]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const priceNum = unmaskCurrency(price);
    const durationNum = parseInt(durationMinutes, 10);

    if (!serviceName.trim()) {
      toastError("Informe o nome do serviço.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toastError("Informe um preço válido.");
      return;
    }
    if (!Number.isFinite(durationNum) || durationNum < 1) {
      toastError("Informe a duração em minutos (mínimo 1).");
      return;
    }

    await onSubmit({
      name: serviceName.trim(),
      description: description.trim(),
      price: priceNum,
      duration: durationNum,
      category: category.trim(),
      active,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-md bg-white shadow-2xl border border-zinc-200 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Serviço *"
            placeholder="Ex: Higienização de Ar Condicionado"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalhes do que está incluso..."
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preço (R$) *"
              placeholder="R$ 150,00"
              mask="currency"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Duração (minutos) *"
              type="number"
              min={1}
              mask="integer"
              placeholder="45"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
          </div>

          <Input
            label="Categoria"
            placeholder="Ex: Estética, Lavagem..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <label className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Serviço ativo (visível para agendamento)
          </label>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="!rounded-md !px-6 !py-2.5 text-[#820000] border-[#820000] hover:bg-[#820000]/10 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="!rounded-md !px-6 !py-2.5 bg-[#5e0000] hover:bg-[#4a0000] text-white font-bold"
            >
              {isSubmitting ? "Salvando..." : "Salvar Serviço"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
