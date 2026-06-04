import { useEffect, useState } from "react";
import api from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import NewRewardModal from "./modals/NewRewardModal";

interface Reward {
  id: number;
  name: string;
  points_cost: number;
  active: boolean;
}

export default function StoreLoyalty() {
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const [spentValue, setSpentValue] = useState("1");
  const [pointsValue, setPointsValue] = useState("1");

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoyalty();
  }, []);
  
  async function loadLoyalty() {
    try {
      setLoading(true);
  
      const { data } = await api.get("/store/loyalty");
  
      setSpentValue(String(data.data.rule.spent_value));
      setPointsValue(String(data.data.rule.points_value));
      setRewards(data.data.rewards || []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar programa de fidelidade.");
    } finally {
      setLoading(false);
    }
  }

  const activeRewards = rewards.filter((reward) => reward.active);
  const inactiveRewards = rewards.filter((reward) => !reward.active);

  const handleUpdateConversion = async () => {
    try {
      await api.put("/store/loyalty/rule", {
        spent_value: Number(spentValue),
        points_value: Number(pointsValue),
      });
  
      alert("Regra atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar regra.");
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedReward(null);
    setIsRewardModalOpen(true);
  };

  const handleOpenEditModal = (reward: Reward) => {
    setSelectedReward(reward);
    setIsRewardModalOpen(true);
  };

  const handleToggleReward = async (id: number) => {
    try {
      await api.patch(`/store/loyalty/rewards/${id}/toggle`);
      await loadLoyalty();
    } catch (error) {
      console.error("Erro ao alterar status da recompensa:", error);
      alert("Erro ao alterar status da recompensa.");
    }
  };

  if (loading) {
    return <p>Carregando programa de fidelidade...</p>;
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
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

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-6">
              Recompensas Ativas ({activeRewards.length})
            </h2>

            <div className="space-y-4">
              {activeRewards.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Nenhuma recompensa ativa cadastrada.
                </p>
              )}

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
                      Custo para o cliente: {reward.points_cost} pts
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
                        onClick={() => handleToggleReward(reward.id)}
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
                        Custo para o cliente: {reward.points_cost} pts
                      </p>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleToggleReward(reward.id)}
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
        onSaved={loadLoyalty}
      />
    </div>
  );
}