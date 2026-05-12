import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, CheckCircle, Info } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/shared/StatusBadge";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";

interface Store {
  id: number;
  name: string;
  cnpj: string;
  owner: string;
  status: "active" | "pending" | "completed" | "cancelled" | "paused";
  createdAt: string;
  address?: string;
  phone?: string;
  email?: string;
  approvedAt?: string;
  approvedBy?: string;
  items?: number;
}

const MOCK_STORES: Store[] = [
  {
    id: 1,
    name: "Lava Jato Central",
    cnpj: "12.345.678/0001-90",
    owner: "Carlos Eduardo",
    status: "pending",
    createdAt: "2024-01-15",
    address: "Rua das Flores, 123 - São Paulo, SP",
    phone: "(11) 98765-4321",
    email: "contato@lavajato.com",
  },
  {
    id: 2,
    name: "Lava Jato Central",
    cnpj: "12.345.678/0001-90",
    owner: "Carlos Eduardo",
    status: "pending",
    createdAt: "2024-01-16",
    address: "Av. Principal, 456 - São Paulo, SP",
    phone: "(11) 99876-5432",
    email: "central@lavajato.com",
  },
  {
    id: 3,
    name: "Douglas Details",
    cnpj: "12.345.678/0001-90",
    owner: "Carlos Eduardo",
    status: "active",
    createdAt: "2024-01-17",
    address: "Rua de Teste, 789 - São Paulo, SP",
    phone: "(11) 91234-5678",
    email: "douglas@details.com",
    approvedAt: "2024-02-20",
    approvedBy: "Admin User",
    items: 1402,
  },
  {
    id: 4,
    name: "Auto Estética VIP",
    cnpj: "98.765.432/0001-10",
    owner: "Maria Silva",
    status: "active",
    createdAt: "2024-01-18",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    phone: "(11) 97777-8888",
    email: "vip@autoestetica.com",
    approvedAt: "2024-02-15",
    approvedBy: "Admin User",
    items: 2541,
  },
  {
    id: 5,
    name: "Detalhado Premium",
    cnpj: "55.666.777/0001-88",
    owner: "João Santos",
    status: "pending",
    createdAt: "2024-01-19",
    address: "Rua Premium, 555 - São Paulo, SP",
    phone: "(11) 95555-6666",
    email: "premium@detalhado.com",
  },
];

export default function AdminStores() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stores, setStores] = useState(MOCK_STORES);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  type StoreFormData = {
    name: string;
    cnpj: string;
    owner: string;
    address: string;
    phone: string;
    email: string;
  };

  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    cnpj: "",
    owner: "",
    address: "",
    phone: "",
    email: "",
  });

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.cnpj.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (store: Store) => {
    setSelectedStore(store);
    setIsApproveModalOpen(true);
  };

  const confirmApprove = () => {
    if (selectedStore) {
      const now = new Date().toLocaleDateString("pt-BR");
      setStores((prev) =>
        prev.map((s) =>
          s.id === selectedStore.id
            ? {
                ...s,
                status: "active",
                approvedAt: now,
                approvedBy: "Admin User",
                items: Math.floor(Math.random() * 3000) + 1000,
              }
            : s,
        ),
      );
      setIsApproveModalOpen(false);
      setTimeout(() => {
        const updatedStore = stores.find((s) => s.id === selectedStore.id);
        if (updatedStore) {
          setSelectedStore({
            ...updatedStore,
            approvedAt: now,
            approvedBy: "Admin User",
            status: "active",
            items: Math.floor(Math.random() * 3000) + 1000,
          });
          setIsAuditModalOpen(true);
        }
      }, 300);
    }
  };

  const confirmReject = () => {
    if (selectedStore) {
      setStores((prev) =>
        prev.map((s) =>
          s.id === selectedStore.id
            ? {
                ...s,
                status: "cancelled",
              }
            : s,
        ),
      );
      setIsApproveModalOpen(false);
      setSelectedStore({
        ...selectedStore,
        status: "cancelled",
      });
    }
  };

  const handleRegisterSubmit = () => {
    if (!formData.name || !formData.cnpj || !formData.owner) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const newStore: Store = {
      id: Math.max(...stores.map((s) => s.id), 0) + 1,
      name: formData.name,
      cnpj: formData.cnpj,
      owner: formData.owner,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setStores((prev) => [...prev, newStore]);
    setFormData({
      name: "",
      cnpj: "",
      owner: "",
      address: "",
      phone: "",
      email: "",
    });
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Lojas Ativas e Pendentes"
        subtitle="Gerenciamento de estéticas cadastradas"
      >
        <Button
          variant="primary"
          className="gap-2 w-full sm:w-auto"
          onClick={() => setIsRegisterModalOpen(true)}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Cadastrar Loja</span>
          <span className="sm:hidden">Cadastrar</span>
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
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <DataTable<Store>
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
                  <StatusBadge status={status as Store["status"]} />
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
                        onClick={() => handleApprove(row)}
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
        </div>
      </Card>

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Cadastrar Estética Manualmente"
        size="md"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={handleRegisterSubmit}
            >
              Cadastrar e Enviar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome Fantasia"
            placeholder="Ex: Lava Jato Central"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CNPJ"
              placeholder="12.345.678/0001-90"
              value={formData.cnpj}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
              }
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 98765-4321"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <Input
            label="Responsável"
            placeholder="Nome do proprietário"
            value={formData.owner}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, owner: e.target.value }))
            }
          />

          <Input
            label="E-mail"
            placeholder="seu@email.com"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <Input
            label="Endereço"
            placeholder="Rua, número - Cidade, Estado"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
          />
        </div>
      </Modal>

      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Aprovar Loja"
        size="sm"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              onClick={confirmReject}
            >
              Recusar
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={confirmApprove}
            >
              Confirmar
            </Button>
          </div>
        }
      >
        {selectedStore && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <Info size={20} className="text-amber-900 shrink-0 mt-0.5" />
              <p className="text-amber-900 text-sm">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita.
              </p>
            </div>
            <p className="text-zinc-700 break-word">
              Tem certeza que deseja aprovar a loja{" "}
              <strong>{selectedStore.name}</strong>?
            </p>
            <p className="text-sm text-zinc-500">
              A loja passará para o status "Ativo" e poderá começar a usar o
              sistema imediatamente.
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
        {selectedStore && selectedStore.approvedAt && (
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
                    {selectedStore.approvedAt}
                  </p>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-lg">
                <p className="text-xs text-zinc-500 font-semibold uppercase mb-2">
                  Aprovado Por
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {selectedStore.approvedBy}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-500 font-semibold uppercase">
                Métricas de Operação da Loja
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedStore.items?.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    Serviços Registrados
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-xs text-green-600 font-medium">
                    Comissão Ativa
                  </p>
                </div>
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
