import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
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
      alert("Erro ao carregar clientes da loja.");
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
        <Card className="rounded-md border-zinc-200 !p-4 md:!p-5">
          <div className="mb-5 max-w-[320px]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente por nome, e-mail ou telefone"
              className="w-full border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
            />
          </div>

          {loading && (
            <p className="text-sm text-zinc-500">Carregando clientes...</p>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <p className="text-sm text-zinc-500">
              Nenhum cliente encontrado para esta loja.
            </p>
          )}

          {!loading && filteredCustomers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-400">
                    <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                      Nome / Contato
                    </th>
                    <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                      Agendamentos
                    </th>
                    <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                      Última Visita
                    </th>
                    <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                      Total Gasto
                    </th>
                    <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                      Ticket Médio
                    </th>
                    <th className="text-right py-2 pl-2 font-medium text-zinc-800">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-zinc-400"
                    >
                      <td className="py-3 pr-2">
                        <p className="text-zinc-900 font-semibold mb-0">
                          {customer.name}
                        </p>
                        <p className="text-zinc-500 text-xs mb-0">
                          {customer.phone || "Sem telefone"}
                        </p>
                        <p className="text-zinc-400 text-xs mb-0">
                          {customer.email || "Sem e-mail"}
                        </p>
                      </td>

                      <td className="py-3 pr-2 text-zinc-900 font-semibold">
                        {customer.appointments_count}
                      </td>

                      <td className="py-3 pr-2 text-zinc-900 font-semibold">
                        {formatDate(customer.last_appointment)}
                      </td>

                      <td className="py-3 pr-2 text-green-700 font-bold">
                        {formatCurrency(customer.total_spent)}
                      </td>

                      <td className="py-3 pr-2 text-green-700 font-bold">
                        {formatCurrency(getAverageTicket(customer))}
                      </td>

                      <td className="py-2 pl-2 text-right">
                        <Button
                          variant="outline"
                          className="!rounded-md !py-1.5 !px-4 text-sm"
                          onClick={() =>
                            navigate(`/loja/clientes/${customer.id}`)
                          }
                        >
                          Ver detalhes/Fidelidade
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}