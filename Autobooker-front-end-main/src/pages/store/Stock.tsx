import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StockHistoryModal from "./modals/StockHistoryModal";
import CreateStockItemModal from "./modals/CreateStockItemModal";
import StockMovementModal from "./modals/StockMovementModal";

type StockStatus = "repor" | "ok";

interface StockItem {
  id: number;
  name: string;
  type: "supply" | "product";
  quantity: number;
  min_quantity: number;
  sale_price: number | null;
  status: StockStatus;
}

const STOCK_FILTER_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "repor", label: "Repor" },
  { value: "ok", label: "OK" },
] as const;

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "product", label: "Venda" },
  { value: "supply", label: "Insumo" },
] as const;

const KIND_STYLE = {
  supply: "text-zinc-900 font-semibold",
  product:
    "inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#820000] text-white font-bold text-xs",
};

const STATUS_STYLE: Record<StockStatus, string> = {
  repor:
    "inline-flex items-center justify-center min-w-[72px] px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs",
  ok: "inline-flex items-center justify-center min-w-[72px] px-3 py-1 rounded-full bg-green-100 border border-green-500 text-green-700 font-bold text-xs",
};

export default function StoreStock() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "supply" | "product">(
    "all",
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStock();
  }, []);

  async function loadStock() {
    try {
      setLoading(true);

      const { data } = await api.get("/store/stock");

      setStockItems(data.data || []);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      alert("Erro ao carregar estoque.");
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesType = typeFilter === "all" || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [stockItems, searchTerm, statusFilter, typeFilter]);

  async function handleDeleteItem(id: number) {
    const confirmed = confirm("Tem certeza que deseja excluir este item do estoque?");
  
    if (!confirmed) return;
  
    try {
      await api.delete(`/store/stock/items/${id}`);
  
      alert("Item excluído com sucesso!");
  
      await loadStock();
    } catch (error: any) {
      console.error("Erro ao excluir item:", error);
  
      alert(
        error?.response?.data?.message ||
          "Erro ao excluir item."
      );
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Controle de Estoque"
        subtitle="Gerenciamento de insumos internos e produtos para venda ao cliente"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="!px-5 !py-3 text-sm !rounded-md"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            Histórico
          </Button>

          <Button
            className="!px-5 !py-3 text-sm shadow-md !rounded-md"
            onClick={() => setIsCreateItemModalOpen(true)}
          >
            + Novo Produto
          </Button>
        </div>
      </PageHeader>

      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <CreateStockItemModal
        isOpen={isCreateItemModalOpen}
        onClose={() => setIsCreateItemModalOpen(false)}
        onCreated={loadStock}
      />

      <StockMovementModal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onCreated={loadStock}
      />

      <div className="border-t border-zinc-300 pt-5">
        <Card className="rounded-md border-zinc-200 !p-4 md:!p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-5 w-full md:max-w-2xl">
            <input
              type="text"
              placeholder="Buscar Produtos..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full sm:w-[200px] border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | StockStatus)
              }
              className="w-full sm:w-[200px] border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
            >
              {STOCK_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as "all" | "supply" | "product",
                )
              }
              className="w-full sm:w-[200px] border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
            >
              {TYPE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-400">
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Produtos
                  </th>
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Tipo
                  </th>
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Estoque
                  </th>
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Preço da Venda
                  </th>
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Status
                  </th>
                  <th className="text-right py-2 pl-2 font-medium text-zinc-800">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-4 text-zinc-500">
                      Carregando estoque...
                    </td>
                  </tr>
                )}

                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-zinc-500">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-400">
                      <td className="py-3 pr-2 text-zinc-800">{item.name}</td>

                      <td className="py-3 pr-2">
                        {item.type === "supply" ? (
                          <span className={KIND_STYLE.supply}>Insumo</span>
                        ) : (
                          <span className={KIND_STYLE.product}>Venda</span>
                        )}
                      </td>

                      <td className="py-3 pr-2 text-zinc-900 font-semibold">
                        {item.quantity} / {item.min_quantity}
                      </td>

                      <td className="py-3 pr-2 text-zinc-900 font-semibold">
                        {item.sale_price
                          ? Number(item.sale_price).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "-"}
                      </td>

                      <td className="py-3 pr-2">
                        <span className={STATUS_STYLE[item.status]}>
                          {item.status === "repor" ? "Repor" : "OK"}
                        </span>
                      </td>

                      <td className="py-2 pl-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="!rounded-md !py-1.5 !px-4 text-sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          Movimentar
                        </Button>

                        <Button
                          variant="outline"
                          className="!rounded-md !py-1.5 !px-4 text-sm !border-red-600 !text-red-600 hover:!bg-red-50"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}