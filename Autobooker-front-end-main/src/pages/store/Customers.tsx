import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import QuickCustomerModal from "./modals/QuickCustomerModal";

interface StoreCustomer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  appointments_count: number;
  total_spent: number | string;
  last_appointment?: string | null;
}

export default function StoreCustomers() {
  const navigate = useNavigate();

  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] =
    useState(false);

  const [customers, setCustomers] = useState<StoreCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCustomers() {
    try {
      setLoading(true);

      const response = await api.get("/store/customers");

      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes da loja.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return customers;

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.phone?.toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  function formatCurrency(value: number | string) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(date?: string | null) {
    if (!date) return "Sem atendimento";

    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function getAverageTicket(customer: StoreCustomer) {
    if (!customer.appointments_count) return 0;

    return Number(customer.total_spent || 0) / customer.appointments_count;
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Clientes da Loja"
        subtitle="Acompanhe a retenção e o perfil dos seus clientes"
      >
        <Button
          className="!px-5 !py-3 text-sm shadow-md !rounded-md"
          onClick={() => setIsQuickCustomerModalOpen(true)}
        >
          + Novo Registro
        </Button>
      </PageHeader>

      <QuickCustomerModal
        isOpen={isQuickCustomerModalOpen}
        onClose={() => setIsQuickCustomerModalOpen(false)}
        onCreated={loadCustomers}
      />

      <div className="border-t border-zinc-300 pt-5">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="p-5 md:p-6 flex flex-col gap-4 border-b border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">Carteira de Clientes</h2>
            <div className="w-full md:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cliente por nome, e-mail ou telefone"
                className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-zinc-50"
              />
            </div>
          </div>

          <div className="p-5 md:p-6 border-b border-zinc-100 hidden">
            {/* Espaço reservado para métricas futuras se necessário */}
          </div>

          {loading && (
            <div className="py-12 text-center text-zinc-500 text-sm font-medium">Carregando clientes...</div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-sm font-medium">
              Nenhum cliente encontrado para esta loja.
            </div>
          )}

          {!loading && filteredCustomers.length > 0 && (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-y border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6 whitespace-nowrap">Nome / Contato</th>
                    <th className="py-4 px-6 whitespace-nowrap">Agendamentos</th>
                    <th className="py-4 px-6 whitespace-nowrap">Última Visita</th>
                    <th className="py-4 px-6 whitespace-nowrap">Total Gasto</th>
                    <th className="py-4 px-6 whitespace-nowrap">Ticket Médio</th>
                    <th className="py-4 px-6 whitespace-nowrap text-right">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="text-zinc-900 font-bold mb-1 text-sm">
                          {customer.name}
                        </p>
                        <p className="text-zinc-500 font-medium text-xs mb-0.5">
                          {customer.phone || "Sem telefone"}
                        </p>
                        <p className="text-zinc-400 text-xs mb-0">
                          {customer.email || "Sem e-mail"}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-zinc-700 font-medium whitespace-nowrap">
                        {customer.appointments_count}
                      </td>

                      <td className="py-4 px-6 text-zinc-700 font-medium whitespace-nowrap">
                        {formatDate(customer.last_appointment)}
                      </td>

                      <td className="py-4 px-6 text-emerald-700 font-bold whitespace-nowrap">
                        {formatCurrency(customer.total_spent)}
                      </td>

                      <td className="py-4 px-6 text-emerald-700 font-bold whitespace-nowrap">
                        {formatCurrency(getAverageTicket(customer))}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          className="!rounded-md !py-1.5 !px-4 text-xs font-semibold bg-white hover:bg-zinc-100 transition-colors shadow-sm"
                          onClick={() =>
                            navigate(`/loja/clientes/${customer.id}`)
                          }
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}