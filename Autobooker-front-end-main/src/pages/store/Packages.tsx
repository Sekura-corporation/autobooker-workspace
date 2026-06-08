import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import NewPackageModal from "./modals/NewPackageModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ServicePackage {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  sessions: number;
  validity_days: number;
}

export default function StorePackages() {
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Cadastrar Novo Pacote");
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [packageToDelete, setPackageToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    try {
      setLoading(true);

      const { data } = await api.get("/store/packages");

      setPackages(data.data || []);
    } catch (error) {
      console.error("Erro ao carregar pacotes:", error);
      toast.error("Erro ao carregar pacotes.");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleOpenCreateModal() {
    setSelectedPackage(null);
    setModalTitle("Cadastrar Novo Pacote");
    setIsNewPackageModalOpen(true);
  }

  function handleOpenEditModal(pkg: ServicePackage) {
    setSelectedPackage(pkg);
    setModalTitle("Editar Pacote");
    setIsNewPackageModalOpen(true);
  }

  async function confirmDeletePackage() {
    if (packageToDelete === null) return;

    try {
      await api.delete(`/store/packages/${packageToDelete}`);
      toast.success("Pacote excluído com sucesso!");
      await loadPackages();
    } catch (error: unknown) {
      console.error("Erro ao excluir pacote:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Erro ao excluir pacote.");
      throw error;
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Combos e Pacotes"
        subtitle="Gerenciamento de combos e pacotes promocionais"
      >
        <Button
          onClick={handleOpenCreateModal}
          className="shadow-md w-full sm:w-auto !rounded-md !px-6 !py-2.5"
        >
          + Montar Pacote
        </Button>
      </PageHeader>

      <div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-200/40 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-0 tracking-tight">
                Combos e Pacotes
              </h2>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-4 px-6 whitespace-nowrap">Pacote</th>
                    <th className="py-4 px-6 whitespace-nowrap">Inclusos</th>
                    <th className="py-4 px-6 whitespace-nowrap">Sessões</th>
                    <th className="py-4 px-6 whitespace-nowrap">Validade</th>
                    <th className="py-4 px-6 whitespace-nowrap">Valor Promocional</th>
                    <th className="w-[180px]"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm font-medium">
                        Carregando pacotes...
                      </td>
                    </tr>
                  )}

                  {!loading && packages.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm font-medium">
                        Nenhum pacote cadastrado. Clique em "Montar Pacote".
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 px-6 text-zinc-800">
                          <div className="font-semibold text-sm mb-1">{pkg.name}</div>
                        </td>

                        <td className="py-4 px-6 text-zinc-600 font-medium">
                          {pkg.description || <span className="text-zinc-400 italic">Sem descrição</span>}
                        </td>

                        <td className="py-4 px-6 text-zinc-700 font-medium whitespace-nowrap">
                          {pkg.sessions} {pkg.sessions === 1 ? "sessão" : "sessões"}
                        </td>

                        <td className="py-4 px-6 text-zinc-700 font-medium whitespace-nowrap">
                          {pkg.validity_days} dias
                        </td>

                        <td className="py-4 px-6 font-bold text-emerald-700 whitespace-nowrap">
                          {formatCurrency(pkg.price)}
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleOpenEditModal(pkg)}
                              className="!rounded-md !py-1.5 !px-4 text-xs font-semibold mr-2 bg-white hover:bg-zinc-100 transition-colors shadow-sm"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setPackageToDelete(pkg.id)}
                              className="!rounded-md !py-1.5 !px-4 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors bg-white shadow-sm"
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

      <NewPackageModal
        isOpen={isNewPackageModalOpen}
        onClose={() => setIsNewPackageModalOpen(false)}
        title={modalTitle}
        initialData={selectedPackage}
        onSaved={loadPackages}
      />

      <ConfirmDialog
        isOpen={packageToDelete !== null}
        onClose={() => setPackageToDelete(null)}
        onConfirm={confirmDeletePackage}
        title="Excluir pacote"
        message="Tem certeza que deseja excluir este pacote? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}