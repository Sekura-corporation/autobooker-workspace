import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import QuickCustomerModal from "./modals/QuickCustomerModal";

interface StoreCustomer {
  id: number;
  name: string;
  contact: string;
  vehicle: string;
  lastVisit: string;
  needsAttention?: boolean;
  avgTicket: string;
}

const CUSTOMERS: StoreCustomer[] = [
  {
    id: 1,
    name: "João da Silva",
    contact: "(88)9 9999-9999",
    vehicle: "Jeep Compass",
    lastVisit: "Hoje",
    avgTicket: "R$ 150,00",
  },
  {
    id: 2,
    name: "Maria aline",
    contact: "(88)9 9999-9999",
    vehicle: "Honda Civic",
    lastVisit: "Ha 45 dias",
    needsAttention: true,
    avgTicket: "R$ 80,00",
  },
];

export default function StoreCustomers() {
  const navigate = useNavigate();
  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] =
    useState(false);

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
      />

      <div className="border-t border-zinc-300 pt-5">
        <Card className="rounded-md border-zinc-200 !p-4 md:!p-5">
          <div className="mb-5 max-w-[260px]">
            <input
              type="text"
              placeholder="Buscar Cliente por nome ou.."
              className="w-full border border-zinc-700 rounded-md px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] bg-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-400">
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Nome / Contato
                  </th>
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Veículos cadastrados
                  </th>
                  <th className="text-left py-2 pr-2 font-medium text-zinc-800">
                    Última Visita
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
                {CUSTOMERS.map((customer) => (
                  <tr key={customer.id} className="border-b border-zinc-400">
                    <td className="py-3 pr-2">
                      <p className="text-zinc-900 font-semibold mb-0">
                        {customer.name}
                      </p>
                      <p className="text-zinc-500 text-xs mb-0">
                        {customer.contact}
                      </p>
                    </td>
                    <td className="py-3 pr-2 text-zinc-900 font-semibold">
                      {customer.vehicle}
                    </td>
                    <td className="py-3 pr-2 text-zinc-900 font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{customer.lastVisit}</span>
                        {customer.needsAttention && (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 border border-orange-400 text-orange-600 font-bold text-xs">
                            Atenção
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-green-700 font-bold">
                      {customer.avgTicket}
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
        </Card>
      </div>
    </div>
  );
}
