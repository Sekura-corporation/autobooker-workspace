import { useEffect, useState } from "react";
import api from "@/services/api";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NewPackageModal from "./modals/NewPackageModal";

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
      alert("Erro ao carregar pacotes.");
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

  async function handleDeletePackage(id: number) {
    const confirmed = confirm("Tem certeza que deseja excluir este pacote?");

    if (!confirmed) return;

    try {
      await api.delete(`/store/packages/${id}`);

      alert("Pacote excluído com sucesso!");

      await loadPackages();
    } catch (error: any) {
      console.error("Erro ao excluir pacote:", error);
      alert(error?.response?.data?.message || "Erro ao excluir pacote.");
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
        <Card className="rounded-md border-zinc-200 !p-4 md:!p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl sm:text-2xl font-bold text-zinc-900 mb-0">
              Combos e Pacotes
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-300">
                  <th className="text-left py-3 pr-2 font-bold text-zinc-700">
                    Pacote
                  </th>
                  <th className="text-left py-3 pr-2 font-bold text-zinc-700">
                    Inclusos
                  </th>
                  <th className="text-left py-3 pr-2 font-bold text-zinc-700">
                    Sessões
                  </th>
                  <th className="text-left py-3 pr-2 font-bold text-zinc-700">
                    Validade
                  </th>
                  <th className="text-left py-3 pr-2 font-bold text-zinc-700 w-32">
                    Valor
                    <br />
                    Promocional
                  </th>
                  <th className="w-[160px]" />
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-4 text-zinc-500">
                      Carregando pacotes...
                    </td>
                  </tr>
                )}

                {!loading && packages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-zinc-500">
                      Nenhum pacote cadastrado.
                    </td>
                  </tr>
                )}

                {!loading &&
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-zinc-200">
                      <td className="py-4 pr-2 font-bold text-zinc-900">
                        {pkg.name}
                      </td>

                      <td className="py-4 pr-2 text-zinc-500">
                        {pkg.description || "Sem descrição"}
                      </td>

                      <td className="py-4 pr-2 text-zinc-700 font-medium">
                        {pkg.sessions} {pkg.sessions === 1 ? "sessão" : "sessões"}
                      </td>

                      <td className="py-4 pr-2 text-zinc-700 font-medium">
                        {pkg.validity_days} dias
                      </td>

                      <td className="py-4 pr-2 text-emerald-600 font-medium">
                        {formatCurrency(pkg.price)}
                      </td>

                      <td className="py-4 pl-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleOpenEditModal(pkg)}
                            className="!rounded-md !py-1.5 !px-5 text-sm font-bold text-[#820000] border-[#820000] hover:bg-[#820000]/10"
                          >
                            Editar
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="!rounded-md !py-1.5 !px-5 text-sm font-bold !text-red-600 !border-red-600 hover:!bg-red-50"
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
        </Card>
      </div>

      <NewPackageModal
        isOpen={isNewPackageModalOpen}
        onClose={() => setIsNewPackageModalOpen(false)}
        title={modalTitle}
        initialData={selectedPackage}
        onSaved={loadPackages}
      />
    </div>
  );
}