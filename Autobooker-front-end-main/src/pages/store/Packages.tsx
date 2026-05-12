import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NewPackageModal from "./modals/NewPackageModal";

interface ServicePackage {
  id: number;
  name: string;
  includes: string;
  promoPrice: string;
}

const PACKAGES: ServicePackage[] = [
  {
    id: 1,
    name: "Premium Wash",
    includes: "Lavagem + Enceramento + Interna",
    promoPrice: "R$ 150,00",
  },
];

export default function StorePackages() {
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Cadastrar Novo Pacote");

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Combos e Pacotes"
        subtitle="Gerenciamento de combos e pacotes promocionais"
      >
        <Button
          onClick={() => {
            setModalTitle("Cadastrar Novo Pacote");
            setIsNewPackageModalOpen(true);
          }}
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
                  <th className="text-left py-3 pr-2 font-bold text-zinc-700 w-32">
                    Valor
                    <br />
                    Promocional
                  </th>
                  <th className="w-[100px]" />
                </tr>
              </thead>
              <tbody>
                {PACKAGES.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-zinc-200">
                    <td className="py-4 pr-2 font-bold text-zinc-900">
                      {pkg.name}
                    </td>
                    <td className="py-4 pr-2 text-zinc-500">{pkg.includes}</td>
                    <td className="py-4 pr-2 text-emerald-600 font-medium">
                      {pkg.promoPrice}
                    </td>
                    <td className="py-4 pl-2 text-right">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setModalTitle("Editar Pacote");
                          setIsNewPackageModalOpen(true);
                        }}
                        className="!rounded-md !py-1.5 !px-5 text-sm font-bold text-[#820000] border-[#820000] hover:bg-[#820000]/10"
                      >
                        Editar
                      </Button>
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
      />
    </div>
  );
}
