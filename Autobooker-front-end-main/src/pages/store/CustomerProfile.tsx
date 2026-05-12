import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import ReceiptModal from "./modals/ReceiptModal";

interface CustomerProfileData {
  id: number;
  name: string;
  phone: string;
  email: string;
  initials: string;
  vehicles: string[];
  loyaltyPoints: string;
  avgTicket: string;
  lastVisit: string;
  history: Array<{
    date: string;
    service: string;
    value: string;
  }>;
}

const CUSTOMER_PROFILES: CustomerProfileData[] = [
  {
    id: 1,
    name: "Marcos Silva",
    phone: "(11) 98765-4321",
    email: "marcos@email.com",
    initials: "MS",
    vehicles: ["JEEP COMPASS (ABC-1234)", "CHEVROLET ONIX (XYZ-9876)"],
    loyaltyPoints: "240 pts",
    avgTicket: "R$ 115,00",
    lastVisit: "Há 12 dias",
    history: [
      { date: "20/09/2023", service: "Lavagem Premium", value: "R$ 150,00" },
      { date: "05/08/2023", service: "Ducha Simples", value: "R$ 40,00" },
      { date: "12/07/2023", service: "Polimento + Cera", value: "R$ 220,00" },
    ],
  },
  {
    id: 2,
    name: "Marcos Silva",
    phone: "(11) 98765-4321",
    email: "marcos@email.com",
    initials: "MS",
    vehicles: ["JEEP COMPASS (ABC-1234)", "CHEVROLET ONIX (XYZ-9876)"],
    loyaltyPoints: "240 pts",
    avgTicket: "R$ 115,00",
    lastVisit: "Há 12 dias",
    history: [
      { date: "20/09/2023", service: "Lavagem Premium", value: "R$ 150,00" },
      { date: "05/08/2023", service: "Ducha Simples", value: "R$ 40,00" },
      { date: "12/07/2023", service: "Polimento + Cera", value: "R$ 220,00" },
    ],
  },
];

export default function StoreCustomerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const customerId = Number(id);
  const profile =
    CUSTOMER_PROFILES.find((item) => item.id === customerId) ??
    CUSTOMER_PROFILES[0];

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader title={`Ficha Técnica: ${profile.name}`}>
        <Button
          variant="outline"
          className="!rounded-md !py-2 !px-4 text-sm"
          onClick={() => navigate("/loja/clientes")}
        >
          ← Voltar
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="rounded-md border-zinc-200 !p-4">
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">
              Perfil e Veículos
            </h2>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#820000] text-white font-bold text-lg flex items-center justify-center">
                {profile.initials}
              </div>
              <div>
                <p className="text-zinc-900 font-bold mb-0">{profile.name}</p>
                <p className="text-zinc-500 text-sm mb-0">
                  {profile.phone} • {profile.email}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {profile.vehicles.map((vehicle) => (
                <p
                  key={vehicle}
                  className="text-zinc-800 font-semibold text-sm mb-0"
                >
                  {vehicle}
                </p>
              ))}
            </div>
          </Card>

          <Card className="rounded-md !p-4 bg-[#820000] text-white border-[#820000]">
            <h2 className="text-2xl font-bold mb-2 text-white">
              Resumo de Fidelidade
            </h2>
            <p className="text-red-100 font-semibold mb-1">Saldo Atual:</p>
            <p className="text-4xl font-black mb-3 text-white">
              {profile.loyaltyPoints}
            </p>
            <p className="text-red-100 font-semibold mb-1">
              Ticket Médio: {profile.avgTicket}
            </p>
            <p className="text-red-100 font-semibold mb-0">
              Última Visita: {profile.lastVisit}
            </p>
          </Card>
        </div>

        <Card className="rounded-md border-zinc-200 !p-4">
          <h2 className="text-2xl font-bold text-zinc-900 mb-3">
            Histórico Completo de Serviços
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-300">
                  <th className="text-left py-2 pr-2 font-bold text-zinc-900">
                    Data
                  </th>
                  <th className="text-left py-2 pr-2 font-bold text-zinc-900">
                    Serviço
                  </th>
                  <th className="text-left py-2 pr-2 font-bold text-zinc-900">
                    Valor
                  </th>
                  <th className="text-right py-2 pl-2 font-bold text-zinc-900">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {profile.history.map((entry) => (
                  <tr
                    key={`${entry.date}-${entry.service}`}
                    className="border-b border-zinc-200"
                  >
                    <td className="py-2 pr-2 text-zinc-800">{entry.date}</td>
                    <td className="py-2 pr-2 text-zinc-800">{entry.service}</td>
                    <td className="py-2 pr-2 text-zinc-800">{entry.value}</td>
                    <td className="py-1.5 pl-2 text-right">
                      <Button
                        variant="outline"
                        className="!rounded-md !py-1.5 !px-4 text-sm"
                        onClick={() => setIsReceiptModalOpen(true)}
                      >
                        Recibo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        customerName={profile.name}
      />
    </div>
  );
}
