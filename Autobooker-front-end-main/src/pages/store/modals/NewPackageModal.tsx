import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface NewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const AVAILABLE_SERVICES = [
  { id: 1, name: "Lavagem Simples", price: 50 },
  { id: 2, name: "Cera de Carnaúba", price: 30 },
  { id: 3, name: "Polimento Farol", price: 50 },
  { id: 4, name: "Aromatizante Interno", price: 15 },
];

export default function NewPackageModal({ isOpen, onClose, title = "Cadastrar Novo Pacote" }: NewPackageModalProps) {
  const [packageName, setPackageName] = useState("");
  const [selectedServices, setSelectedServices] = useState<number[]>([1, 2, 4]); // Default selection from image
  const [packagePrice, setPackagePrice] = useState("79.90");

  if (!isOpen) return null;

  const toggleService = (id: number) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const totalAvulso = selectedServices.reduce((acc, currId) => {
    const service = AVAILABLE_SERVICES.find((s) => s.id === currId);
    return acc + (service ? service.price : 0);
  }, 0);

  const priceNum = parseFloat(packagePrice.replace(",", ".")) || 0;
  const savings = totalAvulso - priceNum;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      packageName,
      selectedServices,
      packagePrice,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] rounded-md bg-white shadow-2xl border border-zinc-200 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-5">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Nome do Pacote (Combo) *
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Ex: Combo Master: Polimento + Lavagem"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Serviços / Adicionais Inclusos
            </label>
            <div className="border border-zinc-300 rounded-md bg-white divide-y divide-zinc-200">
              {AVAILABLE_SERVICES.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-600 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-800">
                    {service.name} (R$ {service.price.toFixed(2).replace(".", ",")})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-zinc-200 rounded-md p-4 bg-white flex flex-col justify-center">
              <span className="text-sm text-zinc-500 mb-2">Soma dos Itens Avulsos:</span>
              <span className="text-2xl font-black text-zinc-900">
                R$ {totalAvulso.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="border border-green-600 rounded-md p-4 bg-white flex flex-col justify-center">
              <label className="text-sm text-zinc-500 mb-2 block">Preço do Pacote *</label>
              <input
                type="text"
                value={packagePrice}
                onChange={(e) => setPackagePrice(e.target.value)}
                placeholder="79,90"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-green-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 mb-1"
                required
              />
              {savings > 0 && (
                <span className="text-sm font-medium text-green-700">
                  Economia p/ Cliente: R$ {savings.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="!rounded-md !px-6 !py-2.5 text-[#820000] border-[#820000] hover:bg-[#820000]/10 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="!rounded-md !px-6 !py-2.5 bg-[#5e0000] hover:bg-[#4a0000] text-white font-bold"
            >
              Criar e Publicar Pacote
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
