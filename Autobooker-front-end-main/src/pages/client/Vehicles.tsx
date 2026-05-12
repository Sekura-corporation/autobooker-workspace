import { useState } from "react";
import { listVehicles, createVehicle, deleteVehicle, updateVehicle } from "@/services/vehicles.service";
import { useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Car, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";


interface Vehicle {
  id: string;
  brand: string;
  model: string;
  color: string;
  plate: string;
  year: number;
}

export default function ClientVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const normalizeVehicle = (vehicle: any): Vehicle => ({
    id: String(vehicle.id),
    brand: vehicle.brand ?? "Veículo",
    model: vehicle.model ?? "",
    color: vehicle.color ?? "Não informado",
    plate: vehicle.plate ?? "",
    year: Number(vehicle.year ?? new Date().getFullYear()),
  });
  
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await listVehicles();
        setVehicles(data.map(normalizeVehicle));
      } catch (error) {
        console.error("Erro ao buscar veículos", error);
      }
    }
  
    fetchVehicles();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Vehicle, "id">>({
    brand: "",
    model: "",
    color: "",
    plate: "",
    year: new Date().getFullYear(),
  });

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      color: "",
      plate: "",
      year: new Date().getFullYear(),
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      plate: vehicle.plate,
      year: vehicle.year,
    });
    setEditingId(vehicle.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.brand ||
      !formData.model ||
      !formData.color ||
      !formData.plate
    ) {
      alert("Preencha todos os campos");
      return;
    }
  
    try {
      const payload = {
        plate: formData.plate,
        model: formData.model,
        brand: formData.brand,
        color: formData.color,
        year: formData.year,
      };
  
      if (editingId) {
        const updatedVehicle = await updateVehicle(editingId, payload);
  
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.id === editingId ? normalizeVehicle(updatedVehicle) : vehicle
          )
        );
      } else {
        const newVehicle = await createVehicle(payload);
  
        setVehicles((prev) => [...prev, normalizeVehicle(newVehicle)]);
      }
  
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar veículo", error);
      console.error("Status:", error?.response?.status);
      console.error("Resposta da API:", error?.response?.data);
    
      alert(
        error?.response?.data?.message ||
        "Erro ao salvar veículo."
      );
    }
  };

  const handleDelete = async (id: string) => {
    await deleteVehicle(id);
    setVehicles(vehicles.filter((v) => v.id !== id));
    setShowDeleteConfirm(null);
  };

  const formatPlate = (plate: string) => {
    const cleaned = plate.replace(/[^a-zA-Z0-9]/g, "");
    if (cleaned.length <= 4) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Meus Veículos
          </h2>
          <p className="text-gray-500 mt-1.5 text-sm md:text-base font-medium">
            Sua garagem virtual para agendamentos mais rápidos
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-[#820000] hover:bg-[#660000] text-white flex items-center gap-2 px-6 py-6 shadow-lg shadow-red-900/20 rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold text-base">Novo Veículo</span>
        </Button>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="p-0 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#820000]" />
              <div className="p-6 lg:p-7">
                <div className="flex items-start gap-4 mb-6">
                  {/* Vehicle Icon */}
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car className="w-8 h-8 text-[#820000]" />
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-gray-900 truncate">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
                        {vehicle.plate}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {vehicle.year}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {vehicle.color}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4"></div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleOpenEdit(vehicle)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold py-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(vehicle.id)}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 rounded-lg font-semibold py-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center rounded-2xl border border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum veículo cadastrado
          </h3>
          <p className="text-gray-600 mb-6">
            Comece adicionando seu primeiro veículo para agendar serviços mais
            rapidamente.
          </p>
          <Button
            onClick={handleOpenAdd}
            className="bg-[#820000] hover:bg-[#660000] text-white font-bold"
          >
            Adicionar Primeiro Veículo
          </Button>
        </Card>
      )}

      {/* Add/Edit Vehicle Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingId ? "Editar Veículo" : "Novo Veículo"}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Marca
            </label>
            <Input
              placeholder="Ex: Jeep, Toyota, Honda"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Modelo
            </label>
            <Input
              placeholder="Ex: Compass, Corolla, Civic"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cor
              </label>
              <Input
                placeholder="Ex: Preto, Branco"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ano
              </label>
              <Input
                type="number"
                placeholder="2024"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: parseInt(e.target.value) || new Date().getFullYear(),
                  })
                }
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Placa
            </label>
            <Input
              placeholder="ABC-1234"
              value={formData.plate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  plate: formatPlate(e.target.value).toUpperCase(),
                })
              }
              maxLength={8}
              className="w-full uppercase"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 text-gray-600 hover:bg-gray-100 rounded-xl"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#820000] hover:bg-[#660000] text-white rounded-xl font-bold"
              onClick={handleSave}
            >
              {editingId ? "Salvar Alterações" : "Adicionar Veículo"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Deletar Veículo"
      >
        <div className="space-y-5">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-900 font-medium">
              Tem certeza que deseja deletar este veículo? Esta ação não pode
              ser desfeita.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-gray-600 hover:bg-gray-100 rounded-xl"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              onClick={() =>
                showDeleteConfirm && handleDelete(showDeleteConfirm)
              }
            >
              Deletar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
