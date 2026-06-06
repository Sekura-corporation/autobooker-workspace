import { useEffect, useState } from "react";
import { listAppointments } from "@/services/appointments.service";
import { listVehicles } from "@/services/vehicles.service";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { listProductOrders } from "@/services/product-orders.service";
import Modal from "@/components/ui/Modal";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  FileText,
  Download,
  Store,
} from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  store: string;
  service: string;
  vehicle: string;
  price: number;
  status: string;
  vehicleId: string;
  rawDate: string;
  scheduledAt: string;
  location?: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
  paymentMethod?: string;
}

export default function ClientHistory() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState<HistoryItem | null>(
    null,
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadHistory() {
      const [appointmentsData, vehiclesData, productOrders] = await Promise.all([
        listAppointments(),
        listVehicles(),
        listProductOrders(),
      ]);
  
      const normalizedHistory = appointmentsData
        .filter((apt: any) => ["completed", "cancelled"].includes(apt.status))
        .map((apt: any) => {
          const date = apt.scheduledAt ? new Date(apt.scheduledAt) : null;

          const appointmentTime =
            apt.time
              ? String(apt.time).slice(0, 5)
              : apt.appointment_time
                ? String(apt.appointment_time).slice(0, 5)
                : date
                  ? date.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
  
          return {
            id: apt.id,
            scheduledAt: apt.scheduledAt ?? "",
            rawDate: apt.scheduledAt ? apt.scheduledAt.slice(0, 7) : "",
            date: date ? date.toLocaleDateString("pt-BR") : "",
            time: appointmentTime,
            store: apt.storeName ?? "Loja selecionada",
            service: apt.service ?? "Serviço agendado",
            vehicle: apt.vehicle ?? "Veículo selecionado",
            price: Number(apt.price ?? 0),
            status: apt.status,
            location: apt.location ?? "",
            paymentMethod: "Pagamento não informado",
            vehicleId: String(apt.vehicleId ?? ""),
            items: [
              {
                name: apt.service ?? "Serviço agendado",
                price: Number(apt.price ?? 0),
              },
            ],
          };
        });

        const normalizedProductOrders = productOrders.map((order: any) => {
          const date = order.created_at ? new Date(order.created_at) : null;
        
          const items =
            order.items?.map((item: any) => ({
              name: `${item.product?.name || "Produto"} x${item.quantity}`,
              price: Number(item.total_price || 0),
            })) || [];
        
          return {
            id: `order-${order.id}`,
            scheduledAt: order.created_at ?? "",
            rawDate: order.created_at ? order.created_at.slice(0, 7) : "",
            date: date ? date.toLocaleDateString("pt-BR") : "",
            time: date
              ? date.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            store: order.store?.name || "Loja selecionada",
            service: "Compra na lojinha física",
            vehicle: "Produto físico",
            price: Number(order.total_price || 0),
            status: order.status || "completed",
            location: order.store?.address || "",
            paymentMethod: "Pagamento não informado",
            vehicleId: "product-order",
            items,
          };
        });
  
       setHistoryData([...normalizedHistory, ...normalizedProductOrders]);
      setVehicles(vehiclesData);
    }
  
    loadHistory();
  }, []);

  const vehicleOptions = [
    { id: "all", label: "Todos os Veículos" },
    ...vehicles.map((vehicle: any) => ({
      id: String(vehicle.id),
      label: `${vehicle.brand ?? "Veículo"} ${vehicle.model ?? ""}`,
    })),
  ];

  // Filtrar dados
  const filteredData = historyData.filter((item) => {
    const matchDate =
      !selectedDate ||
      item.rawDate?.startsWith(selectedDate);
      const matchVehicle =
      selectedVehicle === "all" ||
      item.vehicleId === selectedVehicle ||
      item.vehicleId === "product-order";
    return matchDate && matchVehicle;
  });

  const handleViewReceipt = (item: HistoryItem) => {
    setSelectedReceipt(item);
    setShowReceiptModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: "Data",
      render: (item: HistoryItem) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-gray-900">{item.date}</span>
        </div>
      ),
    },
    {
      header: "Estética",
      render: (item: HistoryItem) => (
        <span className="font-bold text-gray-900">{item.store}</span>
      ),
    },
    {
      header: "Item",
      render: (item: HistoryItem) => (
        <span className="text-gray-700">{item.service}</span>
      ),
    },
    {
      header: "Veículo",
      render: (item: HistoryItem) => (
        <div className="flex items-center gap-1.5 text-gray-700">
          <Car className="w-4 h-4 text-gray-400" />
          {item.vehicle}
        </div>
      ),
    },
    {
      header: "Valor",
      render: (item: HistoryItem) => (
        <span className="font-bold text-gray-900">
          R$ {item.price.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      render: (item: HistoryItem) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            item.status === "completed"
              ? "bg-green-100 text-green-700"
              : item.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {item.status === "completed"
            ? "Finalizado"
            : item.status === "cancelled"
              ? "Cancelado"
              : item.status}
        </span>
      ),
    },
    {
      header: "Detalhes",
      render: (item: HistoryItem) => (
        <Button
          onClick={() => handleViewReceipt(item)}
          variant="outline"
          className="text-[#820000] border-[#820000] hover:bg-red-50 text-xs font-bold py-1.5 px-3"
        >
          Ver Recibo
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Histórico de Serviços
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm md:text-base font-medium">
          Acompanhe todos os cuidados já realizados
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Período
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="month"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#820000]"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Veículo
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#820000]"
            >
              <option value="all">Todos os Veículos</option>
              {vehicleOptions
                .filter((v) => v.id !== "all")
                .map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.label}
                  </option>
                ))}
            </select>
          </div>

          <Button
            onClick={() => {
              setSelectedDate("");
              setSelectedVehicle("all");
            }}
            variant="outline"
            className="text-gray-600 hover:bg-gray-100 font-semibold py-2.5 px-6"
          >
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* Table */}
      {filteredData.length > 0 ? (
        <Card className="p-0 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col, idx) => (
                      <td key={idx} className="px-6 py-4 text-sm">
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum serviço encontrado
          </h3>
          <p className="text-gray-600">
            Não há serviços com os filtros selecionados.
          </p>
        </Card>
      )}

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedReceipt(null);
        }}
        title="Recibo de Serviço Concluído"
      >
        {selectedReceipt && (
          <div className="space-y-5">
            {/* Receipt Header */}
            <div className="p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-[#820000]" />
                </div>
              </div>
              <p className="text-center text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Total do Serviço
              </p>
              <p className="text-center text-4xl font-black text-[#820000] mb-2">
                R$ {selectedReceipt.price.toFixed(2)}
              </p>
              <p className="text-center text-sm text-gray-700 font-medium">
                Pago via {selectedReceipt.paymentMethod}
              </p>
            </div>

            {/* Store Info */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Estética
                  </p>
                  <p className="font-bold text-gray-900">
                    {selectedReceipt.store}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Local
                  </p>
                  <p className="font-bold text-gray-900">
                    {selectedReceipt.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Data Execução
                  </p>
                  <p className="font-bold text-gray-900">
                    {selectedReceipt.date} às {selectedReceipt.time || "Horário não informado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Veículo
                  </p>
                  <p className="font-bold text-gray-900">
                    {selectedReceipt.vehicle}
                  </p>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Serviços Realizados
              </p>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                {selectedReceipt.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <span className="text-sm text-gray-700 font-medium">
                      {item.name}
                    </span>
                    <span className="font-bold text-gray-900">
                      R$ {item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-bold text-green-700 uppercase tracking-wider">
                ✓ Pagamento Confirmado
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1 text-[#820000] border-[#820000] hover:bg-red-50 font-bold rounded-lg py-2.5 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Imprimir Recibo (PDF)
              </Button>
              <Button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg py-2.5"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
