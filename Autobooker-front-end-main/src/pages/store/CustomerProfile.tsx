import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import ReceiptModal from "./modals/ReceiptModal";

interface CustomerVehicle {
  id: number;
  brand?: string;
  model?: string;
  plate?: string;
}

interface CustomerHistory {
  id: number;
  date: string;
  time?: string;
  service: string;
  vehicle?: string;
  plate?: string;
  value: number | string;
  status: string;
}

interface CustomerProfileData {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  vehicles: CustomerVehicle[];
  loyalty_points: number;
  appointments_count: number;
  total_spent: number | string;
  avg_ticket: number | string;
  last_visit?: string | null;
  history: CustomerHistory[];
}

export default function StoreCustomerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [profile, setProfile] = useState<CustomerProfileData | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get(`/store/customers/${id}`);

        setProfile(response.data.data);
      } catch (error) {
        console.error("Erro ao carregar cliente:", error);
        toast.error("Erro ao carregar dados do cliente.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProfile();
    }
  }, [id]);

  function getInitials(name?: string) {
    if (!name) return "?";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function formatCurrency(value: number | string) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(date?: string | null) {
    if (!date) return "Sem visita";

    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  }

  if (loading) {
    return <p>Carregando ficha do cliente...</p>;
  }

  if (!profile) {
    return (
      <div className="w-full flex flex-col gap-8 pb-10">
        <PageHeader title="Cliente não encontrado">
          <Button
            variant="outline"
            className="!rounded-md !py-2 !px-4 text-sm"
            onClick={() => navigate("/loja/clientes")}
          >
            ← Voltar
          </Button>
        </PageHeader>
      </div>
    );
  }

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
                {getInitials(profile.name)}
              </div>

              <div>
                <p className="text-zinc-900 font-bold mb-0">{profile.name}</p>
                <p className="text-zinc-500 text-sm mb-0">
                  {profile.phone || "Sem telefone"} •{" "}
                  {profile.email || "Sem e-mail"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {profile.vehicles.length > 0 ? (
                profile.vehicles.map((vehicle) => (
                  <p
                    key={vehicle.id}
                    className="text-zinc-800 font-semibold text-sm mb-0"
                  >
                    {vehicle.brand || "Veículo"} {vehicle.model || ""}
                    {vehicle.plate ? ` (${vehicle.plate})` : ""}
                  </p>
                ))
              ) : (
                <p className="text-zinc-500 text-sm mb-0">
                  Nenhum veículo encontrado.
                </p>
              )}
            </div>
          </Card>

          <Card className="rounded-md !p-4 bg-[#820000] text-white border-[#820000]">
            <h2 className="text-2xl font-bold mb-2 text-white">
              Resumo de Fidelidade
            </h2>

            <p className="text-red-100 font-semibold mb-1">Saldo Atual:</p>
            <p className="text-4xl font-black mb-3 text-white">
              {profile.loyalty_points} pts
            </p>

            <p className="text-red-100 font-semibold mb-1">
              Ticket Médio: {formatCurrency(profile.avg_ticket)}
            </p>

            <p className="text-red-100 font-semibold mb-1">
              Total Gasto: {formatCurrency(profile.total_spent)}
            </p>

            <p className="text-red-100 font-semibold mb-0">
              Última Visita: {formatDate(profile.last_visit)}
            </p>
          </Card>
        </div>

        <Card className="rounded-md border-zinc-200 !p-4">
          <h2 className="text-2xl font-bold text-zinc-900 mb-3">
            Histórico Completo de Serviços
          </h2>

          {profile.history.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum histórico encontrado.
            </p>
          ) : (
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
                      Veículo
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
                    <tr key={entry.id} className="border-b border-zinc-200">
                      <td className="py-2 pr-2 text-zinc-800">
                        {formatDate(entry.date)}
                      </td>

                      <td className="py-2 pr-2 text-zinc-800">
                        {entry.service}
                      </td>

                      <td className="py-2 pr-2 text-zinc-800">
                        {entry.vehicle || "Veículo"}
                        {entry.plate ? ` (${entry.plate})` : ""}
                      </td>

                      <td className="py-2 pr-2 text-zinc-800">
                        {formatCurrency(entry.value)}
                      </td>

                      <td className="py-1.5 pl-2 text-right">
                        <Button
                          variant="outline"
                          className="!rounded-md !py-1.5 !px-4 text-sm"
                          onClick={() => {
                            setSelectedReceipt(entry);
                            setIsReceiptModalOpen(true);
                          }}
                        >
                          Recibo
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

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceipt(null);
        }}
        customerName={profile.name}
        receipt={selectedReceipt}
      />
    </div>
  );
}