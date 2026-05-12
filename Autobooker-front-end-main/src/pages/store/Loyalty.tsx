import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import NewRewardModal from "./modals/NewRewardModal";

interface Reward {
  id: number;
  name: string;
  points: string;
  status: "ativa" | "inativa";
}

export default function StoreLoyalty() {
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [spentValue, setSpentValue] = useState("1");
  const [pointsValue, setPointsValue] = useState("1");

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "Lavagem Simples Grátis",
      points: "400 pts",
      status: "ativa",
    },
    {
      id: 2,
      name: "Cera Cristalizadora (-50%)",
      points: "200 pts",
      status: "ativa",
    },
  ]);

  const activeRewards = rewards.filter((r) => r.status === "ativa");
  const inactiveRewards = rewards.filter((r) => r.status === "inativa");

  const handleUpdateConversion = () => {
    alert(`Regra atualizada: R$ ${spentValue} = ${pointsValue} ponto(s)`);
  };

  const handleOpenCreateModal = () => {
    setSelectedReward(null);
    setIsRewardModalOpen(true);
  };

  const handleOpenEditModal = (reward: Reward) => {
    setSelectedReward(reward);
    setIsRewardModalOpen(true);
  };

  const handleInactivate = (id: number) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "inativa" } : r))
    );
  };

  const handleActivate = (id: number) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "ativa" } : r))
    );
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      {/* Header */}
      <PageHeader
        title="Programa de Fidelidade"
        subtitle="Configure recompensas e regras de pontos para reter clientes"
      >
        <Button
          onClick={handleOpenCreateModal}
          className="shadow-md w-full sm:w-auto !rounded-md !px-5 !py-2.5"
        >
          + Criar Nova Recompensa
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Rules */}
        <div>
          <Card className="p-6 md:p-8 border-l-4 border-l-[#820000] shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              Regra de Conversão
            </h2>
            <p className="text-sm text-zinc-500 mb-6 font-medium">
              Atualmente, cada R$ {spentValue || "0"} gasto equivale a{" "}
              {pointsValue || "0"} ponto(s).
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  R$ Gasto
                </label>
                <input
                  type="text"
                  value={spentValue}
                  onChange={(e) => setSpentValue(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Total de Pontos Gerados
                </label>
                <input
                  type="text"
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000]"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleUpdateConversion}
              className="w-full !border-[#820000] !text-[#820000] hover:bg-[#820000]/10 font-bold py-3 !rounded-md"
            >
              Atualizar Conversão
            </Button>
          </Card>
        </div>

        {/* Right Column: Rewards */}
        <div className="space-y-10">
          {/* Active Rewards */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-6">
              Recompensas Ativas ({activeRewards.length})
            </h2>

            <div className="space-y-4">
              {activeRewards.map((reward) => (
                <Card
                  key={reward.id}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">
                      {reward.name}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-4 font-medium">
                      Custo para o cliente: {reward.points}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenEditModal(reward)}
                        className="!py-1.5 !px-6 text-sm font-bold !border-[#820000] !text-[#820000] hover:bg-[#820000]/10 !rounded-md"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleInactivate(reward.id)}
                        className="!py-1.5 !px-6 text-sm font-bold !border-[#820000] !text-[#820000] hover:bg-[#820000]/10 !rounded-md"
                      >
                        Inativar
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-1.5 rounded-full border border-[#2e8b57] bg-green-50/50">
                    <span className="text-[10px] font-bold text-[#2e8b57] tracking-widest">
                      ATIVA
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Inactive Rewards */}
          {inactiveRewards.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-6">
                Recompensas Inativadas ({inactiveRewards.length})
              </h2>

              <div className="space-y-4 opacity-75">
                {inactiveRewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm border-zinc-200 bg-zinc-50"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-zinc-500 mb-1">
                        {reward.name}
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4 font-medium">
                        Custo para o cliente: {reward.points}
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleActivate(reward.id)}
                          className="!py-1.5 !px-6 text-sm font-bold !border-zinc-300 !text-zinc-500 hover:bg-zinc-100 !rounded-md"
                        >
                          Reativar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-1.5 rounded-full border border-red-400 bg-red-50">
                      <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">
                        Inativada
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <NewRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        initialData={selectedReward}
      />
    </div>
  );
}
