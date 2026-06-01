import { useEffect, useState, type ComponentType } from "react";
import api from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cs";
import {
  Gift,
  Search,
  Check,
  AlertCircle,
  Copy,
  Download,
  Sparkles,
  Store,
  CircleCheck,
  Gem,
  Droplets,
  Shield,
  Percent,
  Coins,
  Star,
  Trophy,
  Ticket,
  Medal,
} from "lucide-react";

type RewardIconId =
  | "gift"
  | "sparkles"
  | "gem"
  | "droplets"
  | "shield"
  | "percent"
  | "coins"
  | "star";

const REWARD_ICONS: Record<
  RewardIconId,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  gift: Gift,
  sparkles: Sparkles,
  gem: Gem,
  droplets: Droplets,
  shield: Shield,
  percent: Percent,
  coins: Coins,
  star: Star,
};

interface Store {
  id: string;
  name: string;
  points: number;
  status: "active" | "inactive";
  /** Classes Tailwind para gradiente do cabeçalho da loja */
  headerGradient: string;
  headerAccent: string;
  rewards: Array<{
    id: string;
    name: string;
    cost: number;
    description: string;
    iconId: RewardIconId;
  }>;
}

interface RewardClaim {
  id: string;
  storeId: string;
  storeName: string;
  rewardName: string;
  pointsSpent: number;
  voucher: string;
  date: string;
  status: "pending" | "used" | "expired";
}

function RewardIcon({
  id,
  className,
}: {
  id: RewardIconId;
  className?: string;
}) {
  const Icon = REWARD_ICONS[id];
  return <Icon className={className} strokeWidth={1.75} />;
}

function handlePrint() {
  window.print();
}

export default function ClientLoyalty() {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState<Store[]>([]);

  const [claims, setClaims] = useState<RewardClaim[]>([]);

  const [selectedReward, setSelectedReward] = useState<{
    store: Store;
    reward: Store["rewards"][0];
  } | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState<RewardClaim | null>(
    null,
  );

  useEffect(() => {
    loadLoyalty();
  }, []);
  
  async function loadLoyalty() {
    try {
      const { data } = await api.get("/loyalty");
  
      const mappedStores = data.stores.map((store: any) => ({
        id: String(store.storeId),
        name: store.storeName,
        points: store.points,
        status: "active",
  
        headerGradient:
          "from-slate-900 via-blue-950 to-slate-900",
  
        headerAccent:
          "text-blue-300/90",
  
        rewards: (store.rewards || []).map((reward: any) => ({
          id: String(reward.id),
          name: reward.name,
          cost: reward.points_cost,
          description: "Benefício disponível para resgate.",
          iconId: "gift",
        })),
      }));
  
      setStores(mappedStores);
      setClaims(data.claims || []);
    } catch (error) {
      console.error("Erro ao carregar fidelidade:", error);
    }
  }

  const totalPoints = stores.reduce((sum, store) => sum + store.points, 0);

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleClaimReward = async () => {
    if (!selectedReward) return;
  
    try {
      const { data } = await api.post("/loyalty/redeem", {
        reward_id: Number(selectedReward.reward.id),
      });
  
      const newClaim = data.data;
  
      setShowVoucherModal(newClaim);
      setShowClaimModal(false);
      setSelectedReward(null);
  
      await loadLoyalty();
  
      toast.success("Recompensa resgatada com sucesso.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao resgatar recompensa."
      );
    }
  };

  const copyVoucher = (voucher: string) => {
    void navigator.clipboard.writeText(voucher);
    toast.success("Código copiado para a área de transferência.");
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1400px] mx-auto animate-fade-in">
      {/* Hero + busca */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            Fidelidade
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--neutral-black)] font-[family-name:var(--font-display)]">
            Clube de vantagens
          </h1>
          <p className="text-base text-zinc-600 leading-relaxed">
            Os pontos são por loja: acumule na estética em que você é cliente e
            troque por benefícios exclusivos na mesma unidade.
          </p>
        </div>
        <div className="relative w-full lg:max-w-sm shrink-0">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400 pointer-events-none"
            strokeWidth={2}
          />
          <Input
            placeholder="Buscar loja filiada…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-zinc-200/80 bg-white shadow-sm text-[15px] placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Resumo total */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 p-6 shadow-lg shadow-zinc-900/5 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-dark)] text-white">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-10 bottom-0 opacity-[0.12]">
            <Sparkles className="w-24 h-24" strokeWidth={1} />
          </div>
          <p className="mb-0 text-sm font-medium text-white/90">
            Pontos em todas as lojas
          </p>
          <p className="mt-2 mb-0 text-4xl font-bold tabular-nums tracking-tight text-white">
            {totalPoints}
            <span className="text-lg font-semibold text-white/90 ml-1.5">
              pts
            </span>
          </p>
          <p className="mt-3 mb-0 text-xs text-white/80">
            {stores.length} parceiros na sua rede
          </p>
        </Card>
        <Card className="p-6 rounded-2xl border border-zinc-200/80 bg-white shadow-sm sm:col-span-1 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
              <Ticket className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-[var(--neutral-black)]">
                Como resgatar
              </p>
              <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
                Escolha a loja, confira o saldo e gere o voucher ao resgatar.
                Apresente o código na recepção — válido apenas na loja do
                resgate.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lojas em grade */}
      {filteredStores.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {filteredStores.map((store) => (
            <section
              key={store.id}
              className="flex flex-col gap-5 rounded-3xl border border-zinc-200/90 bg-white p-1 shadow-sm"
            >
              {/* Cabeçalho da loja */}
              <div
                className={cn(
                  "relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br px-6 py-7 text-white",
                  store.headerGradient,
                )}
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Store
                        className="h-5 w-5 shrink-0 opacity-90"
                        strokeWidth={2}
                      />
                      <h2 className="text-xl font-bold tracking-tight truncate">
                        {store.name}
                      </h2>
                    </div>
                    <p className="mb-0 text-sm font-medium text-white/95">
                      Saldo nesta estética
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 border-0 font-semibold text-[11px] uppercase tracking-wide",
                      store.status === "active"
                        ? "bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-400/40"
                        : "bg-white/10 text-white/80 ring-1 ring-white/20",
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      <CircleCheck className="w-3.5 h-3.5" />
                      {store.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </Badge>
                </div>
                <div className="relative mt-6 flex items-end justify-between gap-4">
                  <p className="mb-0 text-4xl sm:text-5xl font-bold tabular-nums tracking-tight text-white">
                    {store.points}
                    <span className="ml-2 text-lg sm:text-xl font-semibold text-white/90">
                      pts
                    </span>
                  </p>
                  <div
                    className={cn(
                      "hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15",
                      store.headerAccent,
                    )}
                  >
                    <Sparkles className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="px-4 pb-5 sm:px-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <Gift className="h-4 w-4 text-[var(--brand-primary)]" />
                  Recompensas da loja
                </h3>
                <ul className="flex flex-col gap-3">
                  {store.rewards.map((reward) => {
                    const hasEnoughPoints = store.points >= reward.cost;
                    const isClaimed = claims.some(
                      (c) =>
                        c.storeId === store.id &&
                        c.rewardName === reward.name &&
                        c.status === "used",
                    );
                    const progress = Math.min(
                      100,
                      Math.round((store.points / reward.cost) * 100),
                    );

                    return (
                      <li key={reward.id}>
                        <Card
                          className={cn(
                            "rounded-2xl border p-4 transition-all duration-200",
                            isClaimed
                              ? "border-emerald-200 bg-emerald-50/50"
                              : hasEnoughPoints
                                ? "border-[color-mix(in_srgb,var(--brand-primary)_35%,transparent)] bg-[var(--brand-light)]/40 shadow-[0_0_0_1px_color-mix(in_srgb,var(--brand-primary)_12%,transparent)]"
                                : "border-zinc-100 bg-zinc-50/60",
                          )}
                        >
                          <div className="flex gap-3">
                            <div
                              className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                                hasEnoughPoints && !isClaimed
                                  ? "bg-white text-[var(--brand-primary)] shadow-sm ring-1 ring-black/[0.04]"
                                  : "bg-white/80 text-zinc-500 ring-1 ring-zinc-200/80",
                              )}
                            >
                              <RewardIcon
                                id={reward.iconId}
                                className="h-6 w-6"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <h4 className="font-semibold text-zinc-900 leading-snug pr-2">
                                  {reward.name}
                                </h4>
                                {isClaimed ? (
                                  <Badge className="shrink-0 border-emerald-200 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold">
                                    <span className="inline-flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Resgatado
                                    </span>
                                  </Badge>
                                ) : hasEnoughPoints ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                                    <CircleCheck className="w-3.5 h-3.5" />
                                    Disponível
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-zinc-500 leading-relaxed">
                                {reward.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                                <span className="font-medium text-zinc-500">
                                  Custo:{" "}
                                  <span className="text-zinc-600 tabular-nums">
                                    {reward.cost} pts
                                  </span>
                                </span>
                                {!isClaimed && !hasEnoughPoints && (
                                  <span className="tabular-nums text-zinc-400">
                                    {store.points} / {reward.cost} pts
                                  </span>
                                )}
                              </div>
                              {!isClaimed && !hasEnoughPoints && (
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/90">
                                  <div
                                    className="h-full rounded-full bg-zinc-400/90 transition-[width] duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              )}
                              {!isClaimed && (
                                <div className="flex justify-end pt-1">
                                  <Button
                                    onClick={() => {
                                      setSelectedReward({ store, reward });
                                      setShowClaimModal(true);
                                    }}
                                    disabled={!hasEnoughPoints}
                                    className={cn(
                                      "!py-2.5 !px-4 !text-sm !rounded-xl min-w-[7.5rem]",
                                      hasEnoughPoints
                                        ? "!shadow-md"
                                        : "!opacity-50 !cursor-not-allowed !bg-zinc-300 !text-zinc-600 hover:!bg-zinc-300",
                                    )}
                                  >
                                    Resgatar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
                {store.rewards.length === 0 && (
                  <p className="text-sm text-zinc-500 py-2">
                    Nenhuma recompensa disponível no momento.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">
            Nenhuma loja encontrada
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Ajuste o termo de busca ou limpe o campo para ver todas as filiadas.
          </p>
        </Card>
      )}

      {claims.length > 0 && (
        <div className="space-y-4 border-t border-zinc-200 pt-10">
          <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <Trophy className="h-5 w-5 text-amber-600" strokeWidth={2} />
            Seus resgates
          </h3>
          <ul className="space-y-3">
            {claims.map((claim) => (
              <li key={claim.id}>
                <Card className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                        <Medal className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">
                          {claim.rewardName}
                        </p>
                        <p className="text-sm text-zinc-500 truncate">
                          {claim.storeName} · {claim.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge
                        className={cn(
                          "text-[10px] uppercase font-bold border",
                          claim.status === "used"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-900 border-amber-200",
                        )}
                      >
                        {claim.status === "used" ? (
                          <span className="inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Utilizado
                          </span>
                        ) : (
                          "Pendente"
                        )}
                      </Badge>
                      <Button
                        type="button"
                        onClick={() => copyVoucher(claim.voucher)}
                        variant="outline"
                        className="!py-2 !px-3 !text-xs !rounded-xl"
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copiar código
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        isOpen={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          setSelectedReward(null);
        }}
        title="Confirmar resgate"
      >
        {selectedReward && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-[var(--brand-primary)] ring-1 ring-black/[0.06]">
                <RewardIcon
                  id={selectedReward.reward.iconId}
                  className="h-8 w-8"
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {selectedReward.store.name}
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">
                {selectedReward.reward.name}
              </p>
              <div className="mt-4 rounded-2xl bg-zinc-900 px-4 py-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
                  Pontos a usar
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                  {selectedReward.reward.cost}{" "}
                  <span className="text-base font-semibold text-white/80">
                    pts
                  </span>
                </p>
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                Saldo após o resgate:{" "}
                <strong className="font-semibold text-zinc-600 tabular-nums">
                  {selectedReward.store.points - selectedReward.reward.cost} pts
                </strong>
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-950 leading-relaxed">
              <strong className="font-semibold">Importante:</strong> ao
              confirmar, um voucher exclusivo será gerado. Guarde o código e
              apresente na loja para retirar o benefício.
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowClaimModal(false);
                  setSelectedReward(null);
                }}
                variant="outline"
                className="flex-1 !py-3"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleClaimReward}
                className="flex-1 !py-3"
              >
                Gerar voucher
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!showVoucherModal}
        onClose={() => setShowVoucherModal(null)}
        title="Voucher gerado"
      >
        {showVoucherModal && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-emerald-950">
                Resgate confirmado
              </h3>
              <p className="mt-1 text-sm text-emerald-800/90">
                Use o código abaixo na recepção da loja.
              </p>
            </div>

            <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-xl">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Código exclusivo
              </p>
              <div className="mt-3 break-all rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center font-mono text-lg font-semibold tracking-wide">
                {showVoucherModal.voucher}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  onClick={() => copyVoucher(showVoucherModal.voucher)}
                  className="flex-1 !bg-white/15 !text-white hover:!bg-white/25 !py-2.5 !rounded-xl border border-white/10"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
                <Button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 !bg-white/15 !text-white hover:!bg-white/25 !py-2.5 !rounded-xl border border-white/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </div>
              <p className="mt-4 border-t border-white/10 pt-4 text-center text-xs text-white/60">
                Válido em{" "}
                <span className="font-semibold text-emerald-300">
                  {showVoucherModal.storeName}
                </span>
              </p>
            </Card>

            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-sm text-amber-950 leading-relaxed">
                Guarde este voucher. Você pode copiar o código novamente na
                lista &quot;Seus resgates&quot;.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setShowVoucherModal(null)}
              className="w-full !py-3"
            >
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
