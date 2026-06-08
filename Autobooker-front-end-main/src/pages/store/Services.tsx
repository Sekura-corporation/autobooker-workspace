import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import NewServiceModal, {
  type ServiceFormPayload,
  type ServiceModalInitial,
} from "./modals/NewServiceModal";
import api from "@/services/api";
import { useToast } from "@/hooks/useToast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type ApiService = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration?: number;
  durationMinutes?: number;
  duration_minutes?: number;
  category?: string | null;
  active?: boolean;
};

interface ServiceRow {
  id: string;
  name: string;
  description: string;
  averageDuration: string;
  price: string;
  category: string;
  active: boolean;
  /** minutos brutos para edição */
  durationMinutes: number;
  priceNumber: number;
}

function getDurationMinutes(raw: ApiService): number {
  if (typeof raw.duration === "number") return raw.duration;
  if (typeof raw.durationMinutes === "number") return raw.durationMinutes;
  if (typeof raw.duration_minutes === "number") return raw.duration_minutes;
  return 0;
}

function formatDurationLabel(minutes: number): string {
  if (!minutes || minutes < 1) return "—";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatPriceBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function mapApiToRow(raw: ApiService): ServiceRow {
  const durationMinutes = getDurationMinutes(raw);
  const priceNum = Number(raw.price) || 0;
  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description ?? "",
    averageDuration: formatDurationLabel(durationMinutes),
    price: formatPriceBrl(priceNum),
    category: raw.category ?? "",
    active: raw.active !== false,
    durationMinutes,
    priceNumber: priceNum,
  };
}

export default function StoreServices() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Cadastrar Novo Serviço");
  const [editingService, setEditingService] = useState<ServiceModalInitial | null>(
    null,
  );
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [serviceToDeactivate, setServiceToDeactivate] =
    useState<ServiceRow | null>(null);

  async function fetchServices() {
    setLoading(true);
    try {
      const { data } = await api.get<ApiService[]>("/store/services");
      const list = Array.isArray(data) ? data : [];
      setServices(list.map(mapApiToRow));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Não foi possível carregar os serviços.";
      toastError(message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carregar uma vez ao montar
  }, []);

  const openCreateModal = () => {
    setModalTitle("Cadastrar Novo Serviço");
    setEditingService(null);
    setIsNewServiceModalOpen(true);
  };

  const openEditModal = (row: ServiceRow) => {
    setModalTitle("Editar Serviço");
    setEditingService({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.priceNumber,
      duration: row.durationMinutes,
      category: row.category,
      active: row.active,
    });
    setIsNewServiceModalOpen(true);
  };

  const closeModal = () => {
    setIsNewServiceModalOpen(false);
    setEditingService(null);
  };

  const handleModalSubmit = async (payload: ServiceFormPayload) => {
    setModalSubmitting(true);
    try {
      const body = {
        name: payload.name,
        description: payload.description || null,
        price: payload.price,
        duration: payload.duration,
        category: payload.category || null,
        active: payload.active,
      };

      if (editingService) {
        await api.put(`/store/services/${editingService.id}`, body);
        toastSuccess("Serviço atualizado.");
      } else {
        await api.post("/store/services", body);
        toastSuccess("Serviço cadastrado.");
      }
      closeModal();
      await fetchServices();
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const msg =
        ax.response?.data?.message ??
        Object.values(ax.response?.data?.errors ?? {})?.[0]?.[0] ??
        "Erro ao salvar o serviço.";
      toastError(msg);
    } finally {
      setModalSubmitting(false);
    }
  };

  const confirmDeactivateService = async () => {
    if (!serviceToDeactivate) return;

    try {
      await api.delete(`/store/services/${serviceToDeactivate.id}`);
      toastSuccess("Serviço desativado.");
      await fetchServices();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Não foi possível desativar o serviço.";
      toastError(message);
      throw err;
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Serviços"
        subtitle="Gerenciamento de serviços oferecidos"
      >
        <Button
          onClick={openCreateModal}
          className="shadow-md w-full sm:w-auto !rounded-md !px-6 !py-2.5"
        >
          + Cadastrar Serviço
        </Button>
      </PageHeader>

      <div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-0 tracking-tight">
                Serviços Avulsos
              </h2>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6 whitespace-nowrap">Serviço</th>
                    <th className="py-4 px-6 whitespace-nowrap">Duração Média</th>
                    <th className="py-4 px-6 whitespace-nowrap">Valor</th>
                    <th className="w-[180px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-zinc-500 text-sm font-medium"
                      >
                        Carregando serviços...
                      </td>
                    </tr>
                  ) : services.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-zinc-500 text-sm font-medium"
                      >
                        Nenhum serviço cadastrado. Clique em "Cadastrar Serviço".
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr
                        key={service.id}
                        className={`hover:bg-zinc-50/50 transition-colors ${!service.active ? "opacity-60 bg-zinc-50/30" : ""}`}
                      >
                        <td className="py-4 px-6 text-zinc-800">
                          <div className="font-semibold text-sm mb-1">{service.name}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {service.category && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 tracking-wide uppercase border border-blue-100">
                                {service.category}
                              </span>
                            )}
                            {!service.active && (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 tracking-wide uppercase border border-red-100">
                                Inativo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-zinc-600 font-medium whitespace-nowrap">
                          {service.averageDuration}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#0B0B1A] whitespace-nowrap">
                          {service.price}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            onClick={() => openEditModal(service)}
                            className="!rounded-md !py-1.5 !px-4 text-xs font-semibold mr-2 bg-white hover:bg-zinc-100 transition-colors shadow-sm"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setServiceToDeactivate(service)}
                            className="!rounded-md !py-1.5 !px-4 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors bg-white shadow-sm"
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <NewServiceModal
        isOpen={isNewServiceModalOpen}
        onClose={closeModal}
        title={modalTitle}
        initialService={editingService}
        onSubmit={handleModalSubmit}
        isSubmitting={modalSubmitting}
      />

      <ConfirmDialog
        isOpen={serviceToDeactivate !== null}
        onClose={() => setServiceToDeactivate(null)}
        onConfirm={confirmDeactivateService}
        title="Desativar serviço"
        message={
          serviceToDeactivate
            ? `Desativar o serviço "${serviceToDeactivate.name}"? Ele deixará de aparecer para novos agendamentos.`
            : ""
        }
        confirmLabel="Desativar"
        variant="danger"
      />
    </div>
  );
}
