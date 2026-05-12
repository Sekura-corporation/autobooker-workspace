import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StockHistoryModal from "./modals/StockHistoryModal";
import CreateStockItemModal from "./modals/CreateStockItemModal";
import StockMovementModal from "./modals/StockMovementModal";

type StockKind = "insumo" | "venda";
type StockStatus = "repor" | "ok";

interface StockItem {
  id: number;
  product: string;
  kind: StockKind;
  quantity: string;
  salePrice: string;
  status: StockStatus;
}

const STOCK_ITEMS: StockItem[] = [
  {
    id: 1,
    product: "Shampoo Neutro",
    kind: "insumo",
    quantity: "2 / 5",
    salePrice: "-",
    status: "repor",
  },
  {
    id: 2,
    product: "Aromatizante New Car",
    kind: "venda",
    quantity: "15 / 5",
    salePrice: "R$ 12,90",
    status: "ok",
  },
];

const STOCK_FILTER_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "repor", label: "Repor" },
  { value: "ok", label: "OK" },
] as const;

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "venda", label: "Venda" },
  { value: "insumo", label: "Insumo" },
] as const;

const KIND_STYLE: Record<StockKind, string> = {
  insumo: "text-zinc-900 font-semibold",
  venda:
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
  const [movementItemName, setMovementItemName] = useState<string | null>(null);

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
      />
      <StockMovementModal
        isOpen={movementItemName !== null}
        onClose={() => setMovementItemName(null)}
        productName={movementItemName ?? undefined}
      />

      <div className="border-t border-zinc-300 pt-5">
        <Card className="rounded-md border-zinc-200 !p-4 md:!p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-5 w-full md:max-w-2xl">
            <input
              type="text"
              placeholder="Buscar Produtos..."
              className="w-full sm:w-[200px] border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
            />

            <select className="w-full sm:w-[200px] border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white">
              {STOCK_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select className="w-full sm:w-[200px] border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white">
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
                {STOCK_ITEMS.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-400">
                    <td className="py-3 pr-2 text-zinc-800">{item.product}</td>
                    <td className="py-3 pr-2">
                      {item.kind === "insumo" ? (
                        <span className={KIND_STYLE[item.kind]}>Insumo</span>
                      ) : (
                        <span className={KIND_STYLE[item.kind]}>venda</span>
                      )}
                    </td>
                    <td className="py-3 pr-2 text-zinc-900 font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-3 pr-2 text-zinc-900 font-semibold">
                      {item.salePrice}
                    </td>
                    <td className="py-3 pr-2">
                      <span className={STATUS_STYLE[item.status]}>
                        {item.status === "repor" ? "Repor" : "OK"}
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <Button
                        variant="outline"
                        className="!rounded-md !py-1.5 !px-4 text-sm"
                        onClick={() => setMovementItemName(item.product)}
                      >
                        Reg. entrada
                      </Button>
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
