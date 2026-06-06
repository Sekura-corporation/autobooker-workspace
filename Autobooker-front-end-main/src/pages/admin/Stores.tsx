import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, Info, Loader2, RefreshCw } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/shared/StatusBadge";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import {
  listAdminStores,
  approveStore,
  rejectStore,
  type AdminStore,
} from "@/services/admin.service";

export default function AdminStores() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminStores();
      setStores(data);
    } catch (err) {
      toast.error("Erro ao carregar lojas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.cnpj && store.cnpj.includes(searchTerm));
    const matchesStatus =
      statusFilter === "all" || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveClick = (store: AdminStore) => {
    setSelectedStore(store);
    setIsApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedStore) return;
    setActionLoading(true);
    try {
      await approveStore(selectedStore.id);
      toast.success("Loja aprovada com sucesso!");
      
      setStores((prev) =>
        prev.map((s) => (s.id === selectedStore.id ? { ...s, status: "active" } : s))
      );
      
      setIsApproveModalOpen(false);
      setIsAuditModalOpen(true);
    } catch (err) {
      toast.error("Erro ao aprovar a loja.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedStore) return;
    setActionLoading(true);
    try {
      await rejectStore(selectedStore.id);
      toast.success("Loja rejeitada.");
      setStores((prev) => prev.filter((s) => s.id !== selectedStore.id));
      setIsApproveModalOpen(false);
    } catch (err) {
      toast.error("Erro ao rejeitar a loja.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Lojas Ativas e Pendentes"
        subtitle="Gerenciamento de estéticas cadastradas"
      >
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={fetchStores}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 rounded-lg border-2 border-zinc-200 transition-all font-medium text-sm focus:outline-none focus:border-[#820000] w-full sm:w-auto sm:min-w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="active">Ativo</option>
          <option value="rejected">Rejeitado</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-[#820000]" />
            </div>
          ) : (
            <DataTable<AdminStore>
              columns={[
                {
                  key: "name",
                  label: "Estética",
                  sortable: true,
                },
                {
                  key: "cnpj",
                  label: "CNPJ",
                  sortable: false,
                },
                {
                  key: "owner",
                  label: "Responsável",
                  sortable: true,
                },
                {
                  key: "status",
                  label: "Status",
                  sortable: true,
                  render: (status: unknown) => (
                    <StatusBadge status={status as AdminStore["status"]} />
                  ),
                },
                {
                  key: "id",
                  label: "Ações",
                  sortable: false,
                  render: (_, row) => (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-2 whitespace-nowrap"
                        onClick={() => navigate(`/admin/lojas/${row.id}`)}
                      >
                        Detalhe
                      </Button>
                      {row.status === "pending" && (
                        <Button
                          variant="primary"
                          className="text-xs px-3 py-2 whitespace-nowrap"
                          onClick={() => handleApproveClick(row)}
                        >
                          Aprovar
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
              data={filteredStores}
              emptyMessage="Nenhuma loja encontrada"
            />
          )}
        </div>
      </Card>

      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => !actionLoading && setIsApproveModalOpen(false)}
        title="Aprovar Loja"
        size="sm"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              onClick={confirmReject}
              disabled={actionLoading}
            >
              Recusar
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={confirmApprove}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "Confirmar"}
            </Button>
          </div>
        }
      >
        {selectedStore && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <Info size={20} className="text-amber-900 shrink-0 mt-0.5" />
              <p className="text-amber-900 text-sm">
                <strong>Atenção:</strong> Esta ação afetará o acesso do lojista.
              </p>
            </div>
            <p className="text-zinc-700 break-word">
              O que deseja fazer com a loja{" "}
              <strong>{selectedStore.name}</strong>?
            </p>
            <p className="text-sm text-zinc-500">
              Aprovar ativará a conta no sistema. Recusar irá bloquear o acesso.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Auditoria"
        size="md"
        footer={
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => setIsAuditModalOpen(false)}
          >
            Concluído
          </Button>
        }
      >
        {selectedStore && (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-zinc-200">
              <div className="flex justify-center mb-3">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 truncate px-2">
                {selectedStore.name}
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                Auditoria: Estética Ativa
              </p>
              <StatusBadge status="active" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-lg">
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                  Data de Aprovação
                </p>
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar size={18} className="text-[#820000] shrink-0" />
                  <p className="text-sm font-semibold text-zinc-900">
                    {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-lg">
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                  Aprovado Por
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  Administrador
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <Info size={20} className="text-amber-900 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-900 font-semibold uppercase mb-1">
                  Informação
                </p>
                <p className="text-xs text-amber-900">
                  Esta loja foi aprovada e está ativa no sistema. Use este
                  registro para auditoria e rastreamento de aprovações.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
