import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import StockHistoryModal from "./modals/StockHistoryModal";
import CreateStockItemModal from "./modals/CreateStockItemModal";
import StockMovementModal from "./modals/StockMovementModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  supply: "inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 tracking-wide uppercase border border-zinc-200",
  product:
    "inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 tracking-wide uppercase border border-blue-100",
};

const STATUS_STYLE: Record<StockStatus, string> = {
  repor:
    "inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 tracking-wide uppercase border border-red-100",
  ok: "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 tracking-wide uppercase border border-emerald-100",
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
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

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
      toast.error("Erro ao carregar estoque.");
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

  async function confirmDeleteItem() {
    if (itemToDelete === null) return;

    try {
      await api.delete(`/store/stock/items/${itemToDelete}`);
      toast.success("Item excluído com sucesso!");
      await loadStock();
    } catch (error: unknown) {
      console.error("Erro ao excluir item:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Erro ao excluir item.",
      );
      throw error;
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

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteItem}
        title="Excluir item"
        message="Tem certeza que deseja excluir este item do estoque? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
      />

      <div className="border-t border-zinc-300 pt-5">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="p-5 md:p-6 flex flex-col gap-4 border-b border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Filtros de Estoque</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-3xl">
              <input
                type="text"
                placeholder="Buscar Produtos..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full sm:w-[240px] border border-zinc-300 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-zinc-50"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | StockStatus)
                }
                className="w-full sm:w-[200px] border border-zinc-300 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-zinc-50"
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
                className="w-full sm:w-[200px] border border-zinc-300 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-zinc-50"
              >
                {TYPE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-4 px-6 whitespace-nowrap">Produtos</th>
                  <th className="py-4 px-6 whitespace-nowrap">Tipo</th>
                  <th className="py-4 px-6 whitespace-nowrap">Estoque (Atual / Mín)</th>
                  <th className="py-4 px-6 whitespace-nowrap">Preço da Venda</th>
                  <th className="py-4 px-6 whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 whitespace-nowrap text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm font-medium">
                      Carregando estoque...
                    </td>
                  </tr>
                )}

                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm font-medium">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6 text-zinc-800">
                        <div className="font-semibold text-sm mb-1">{item.name}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={KIND_STYLE[item.type]}>
                          {item.type === "supply" ? "Insumo" : "Venda"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-zinc-700 font-medium whitespace-nowrap">
                        <span className="font-bold text-zinc-900">{item.quantity}</span> <span className="text-zinc-400 mx-1">/</span> {item.min_quantity}
                      </td>

                      <td className="py-4 px-6 text-zinc-900 font-bold whitespace-nowrap">
                        {item.sale_price
                          ? Number(item.sale_price).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : <span className="text-zinc-400 font-medium">-</span>}
                      </td>

                      <td className="py-4 px-6">
                        <span className={STATUS_STYLE[item.status]}>
                          {item.status === "repor" ? "Repor" : "OK"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="!rounded-md !py-1.5 !px-4 text-xs font-semibold mr-2 bg-white hover:bg-zinc-100 transition-colors shadow-sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            Movimentar
                          </Button>

                          <Button
                            variant="outline"
                            className="!rounded-md !py-1.5 !px-4 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors bg-white shadow-sm"
                            onClick={() => setItemToDelete(item.id)}
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
        </div>
      </div>
    </div>
  );
}