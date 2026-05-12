import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function NewProductModal({ isOpen, onClose, title = "Cadastrar Produto" }: NewProductModalProps) {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      productName,
      description,
      price,
      stock,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-md bg-white shadow-2xl border border-zinc-200 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Aromatizante Centralsul"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">
              Marca / Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ex: Fragrância Carro Novo (Manga/Maçã)"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">
                Preço de Venda (R$)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15.00"
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">
                Estoque Disponível
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ex: 20"
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
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
              className="!rounded-md !px-6 !py-2.5 bg-[#5e0000] hover:bg-[#4a0000] text-white font-bold"
            >
              Salvar Produto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
