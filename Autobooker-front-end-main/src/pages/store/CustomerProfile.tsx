import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
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
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300">
            <div className="p-5 md:p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-0">
                Perfil e Veículos
              </h2>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#820000] to-[#590000] text-white font-bold text-xl flex items-center justify-center shadow-md border-2 border-white ring-2 ring-zinc-100">
                  {getInitials(profile.name)}
                </div>

                <div>
                  <p className="text-zinc-900 font-bold text-lg mb-0">{profile.name}</p>
                  <p className="text-zinc-500 font-medium text-sm mb-0">
                    {profile.phone || "Sem telefone"} • {profile.email || "Sem e-mail"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Veículos Registrados</h3>
                {profile.vehicles.length > 0 ? (
                  profile.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-zinc-200 shadow-sm"
                    >
                      <span className="text-zinc-800 font-semibold text-sm">
                        {vehicle.brand || "Veículo"} {vehicle.model || ""}
                      </span>
                      {vehicle.plate && (
                        <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-bold tracking-widest border border-zinc-200">
                          {vehicle.plate}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm mb-0 italic">
                    Nenhum veículo encontrado.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#820000] to-[#4A0000] text-white shadow-lg shadow-[#820000]/20 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-6 text-white/90 tracking-tight flex items-center gap-2">
                Resumo de Fidelidade
              </h2>

              <div className="mb-8">
                <p className="text-white font-medium text-sm mb-1 uppercase tracking-wider">Saldo Atual</p>
                <p className="text-5xl font-black mb-0 text-white tracking-tight drop-shadow-md">
                  {profile.loyalty_points} <span className="text-xl font-bold text-red-200/70">pts</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-black/10 rounded-xl p-4 border border-white/10">
              <div>
                <p className="text-white font-medium text-xs mb-1 uppercase tracking-wider">
                  Ticket Médio
                </p>
                <p className="text-white font-bold text-lg mb-0">{formatCurrency(profile.avg_ticket)}</p>
              </div>
              
              <div>
                <p className="text-white font-medium text-xs mb-1 uppercase tracking-wider">
                  Total Gasto
                </p>
                <p className="text-white font-bold text-lg mb-0">{formatCurrency(profile.total_spent)}</p>
              </div>
              
              <div className="col-span-2 mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
                <p className="text-white font-medium text-xs mb-0 uppercase tracking-wider">
                  Última Visita
                </p>
                <p className="text-white font-semibold text-sm mb-0 bg-black/20 px-3 py-1 rounded-full">
                  {formatDate(profile.last_visit)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300">
          <div className="p-5 md:p-6 border-b border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-0">
              Histórico Completo de Serviços
            </h2>
          </div>

          {profile.history.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-zinc-500 mb-0">
                Nenhum histórico encontrado para este cliente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6 whitespace-nowrap">Data</th>
                    <th className="py-4 px-6 whitespace-nowrap">Serviço</th>
                    <th className="py-4 px-6 whitespace-nowrap">Veículo</th>
                    <th className="py-4 px-6 whitespace-nowrap">Valor</th>
                    <th className="py-4 px-6 whitespace-nowrap text-right">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {profile.history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6 text-zinc-800 font-medium whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>

                      <td className="py-4 px-6 text-zinc-800 font-semibold">
                        {entry.service}
                      </td>

                      <td className="py-4 px-6 text-zinc-600">
                        {entry.vehicle || "Veículo"}
                        {entry.plate ? ` (${entry.plate})` : ""}
                      </td>

                      <td className="py-4 px-6 font-bold text-[#0B0B1A] whitespace-nowrap">
                        {formatCurrency(entry.value)}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          className="!rounded-md !py-1.5 !px-4 text-xs font-semibold bg-white hover:bg-zinc-100 transition-colors shadow-sm"
                          onClick={() => {
                            setSelectedReceipt(entry);
                            setIsReceiptModalOpen(true);
                          }}
                        >
                          Ver Recibo
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