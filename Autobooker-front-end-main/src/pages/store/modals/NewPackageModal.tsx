import React, { useEffect, useState } from "react";
import api from "@/services/api";
import Button from "@/components/ui/Button";

interface PackageData {
  id?: number;
  name: string;
  description?: string | null;
  price: number;
  sessions: number;
  validity_days: number;
}

interface NewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: PackageData | null;
  onSaved?: () => void | Promise<void>;
}

export default function NewPackageModal({
  isOpen,
  onClose,
  title = "Cadastrar Novo Pacote",
  initialData,
  onSaved,
}: NewPackageModalProps) {
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [packagePrice, setPackagePrice] = useState("79.90");
  const [sessions, setSessions] = useState("1");
  const [validityDays, setValidityDays] = useState("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setPackageName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setPackagePrice(
      initialData?.price !== undefined ? String(initialData.price) : "79.90"
    );
    setSessions(
      initialData?.sessions !== undefined ? String(initialData.sessions) : "1"
    );
    setValidityDays(
      initialData?.validity_days !== undefined
        ? String(initialData.validity_days)
        : "30"
    );
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!packageName.trim()) {
      alert("Informe o nome do pacote.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: packageName,
        description,
        price: Number(packagePrice.replace(",", ".")),
        sessions: Number(sessions),
        validity_days: Number(validityDays),
      };

      if (initialData?.id) {
        await api.put(`/store/packages/${initialData.id}`, payload);
        alert("Pacote atualizado com sucesso!");
      } else {
        await api.post("/store/packages", payload);
        alert("Pacote criado com sucesso!");
      }

      if (onSaved) {
        await onSaved();
      }

      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar pacote:", error);
      alert(error?.response?.data?.message || "Erro ao salvar pacote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] rounded-md bg-white shadow-2xl border border-zinc-200 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-5">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Nome do Pacote *
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Ex: Combo Diamante"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Descrição / Itens Inclusos
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Lavagem + Higienização + Cera"
              rows={3}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">
                Preço *
              </label>
              <input
                type="text"
                value={packagePrice}
                onChange={(e) => setPackagePrice(e.target.value)}
                placeholder="Ex: 180.00"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-green-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">
                Sessões *
              </label>
              <input
                type="number"
                min={1}
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">
                Validade/dias *
              </label>
              <input
                type="number"
                min={1}
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="!rounded-md !px-6 !py-2.5 text-[#820000] border-[#820000] hover:bg-[#820000]/10 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="!rounded-md !px-6 !py-2.5 bg-[#5e0000] hover:bg-[#4a0000] text-white font-bold"
            >
              {loading
                ? "Salvando..."
                : initialData
                  ? "Salvar Alterações"
                  : "Criar e Publicar Pacote"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}