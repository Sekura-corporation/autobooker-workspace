import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { unmaskCurrency } from "@/utils/masks";

interface CreateStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}

export default function CreateStockItemModal({
  isOpen,
  onClose,
  onCreated,
}: CreateStockItemModalProps) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<"supply" | "product">("supply");
  const [unit, setUnit] = useState("un");
  const [currentStock, setCurrentStock] = useState("10");
  const [minimumStock, setMinimumStock] = useState("2");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function resetForm() {
    setItemName("");
    setCategory("supply");
    setUnit("un");
    setCurrentStock("10");
    setMinimumStock("2");
    setSalePrice("");
    setDescription("");
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!itemName.trim()) {
      toast.error("Informe o nome do item.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/store/stock/items", {
        name: itemName,
        type: category,
        quantity: Number(currentStock),
        min_quantity: Number(minimumStock),
        sale_price: category === "product" && salePrice ? unmaskCurrency(salePrice) : null,
      });

      toast.success("Item cadastrado com sucesso!");

      resetForm();

      if (onCreated) {
        await onCreated();
      }

      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar item:", error);
      toast.error(error?.response?.data?.message || "Erro ao cadastrar item.");
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
        className="w-full max-w-[960px] rounded-md bg-white shadow-2xl border border-zinc-200 p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-5">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#0B0B1A]">
            Cadastrar Novo Item
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Nome do Item *
            </label>

            <input
              type="text"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder="Ex: Cera de Carnaúba 500g ou Aromatizante de Maçã"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">
                Categoria / Tipo de Uso *
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as "supply" | "product")
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              >
                <option value="supply">Insumo (Uso Interno - Lavagem, etc)</option>
                <option value="product">Produto para Venda ao Cliente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">
                Unidade de Medida
              </label>

              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              >
                <option value="un">Unidade (un)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="l">Litro (l)</option>
                <option value="kg">Quilograma (kg)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Estoque Atual"
              type="number"
              min={0}
              mask="integer"
              value={currentStock}
              onChange={(event) => setCurrentStock(event.target.value)}
            />

            <Input
              label="Estoque Mínimo"
              type="number"
              min={0}
              mask="integer"
              value={minimumStock}
              onChange={(event) => setMinimumStock(event.target.value)}
            />

            {category === "product" && (
              <Input
                label="Preço de Venda (R$)"
                placeholder="R$ 15,00"
                mask="currency"
                value={salePrice}
                min={0}
                step="0.01"
                disabled={category !== "product"}
                onChange={(event) => setSalePrice(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] disabled:bg-zinc-100 disabled:text-zinc-400"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Descrição curta
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Informações adicionais para o estoque..."
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="!rounded-md !px-8 !py-2.5 text-base"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="!rounded-md !px-8 !py-2.5 text-base shadow-lg shadow-[#820000]/20"
            >
              {loading ? "Cadastrando..." : "Cadastrar no Sistema"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}