import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  QrCode,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  listAvailablePlans,
  subscribeToPlan,
  type PaymentMethod,
  type Plan,
} from "@/services/storeProfile.service";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chamado após ativação bem-sucedida do plano */
  onPlanChanged?: (planName: string) => void;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type ModalStep = "plans" | "checkout" | "success";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomPixKey(): string {
  const chars = "abcdef0123456789";
  return Array.from({ length: 32 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ChangePlanModal({
  isOpen,
  onClose,
  onPlanChanged,
}: ChangePlanModalProps) {
  const [step, setStep] = useState<ModalStep>("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pixKey] = useState(randomPixKey());

  // Busca planos ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;

    setStep("plans");
    setSelectedPlan(null);
    setPaymentMethod(null);

    async function fetchPlans() {
      setLoading(true);
      try {
        const data = await listAvailablePlans();
        setPlans(data);
      } catch {
        toast.error("Não foi possível carregar os planos.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, [isOpen]);

  if (!isOpen) return null;

  // ─── Ações ────────────────────────────────────────────────────────────────

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setPaymentMethod(null);
    setStep("checkout");
  }

  async function handleConfirm() {
    if (!selectedPlan || !paymentMethod) return;

    setConfirming(true);
    try {
      await subscribeToPlan({
        plan_id: selectedPlan.id,
        payment_method: paymentMethod,
      });

      setStep("success");
      onPlanChanged?.(selectedPlan.name);
      toast.success(`Plano "${selectedPlan.name}" ativado com sucesso!`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erro ao ativar o plano. Tente novamente.";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  }

  function handleClose() {
    setStep("plans");
    setSelectedPlan(null);
    setPaymentMethod(null);
    onClose();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[900px] rounded-xl bg-white shadow-2xl border border-zinc-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60">
          <div className="flex items-center gap-3">
            {step === "checkout" && (
              <button
                onClick={() => setStep("plans")}
                className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-500"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                {step === "plans" && "Escolha seu Plano"}
                {step === "checkout" && `Assinar — ${selectedPlan?.name}`}
                {step === "success" && "Plano Ativado!"}
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                {step === "plans" && "Eleve o nível da sua gestão."}
                {step === "checkout" && "Selecione o método de pagamento simulado."}
                {step === "success" && "Sua assinatura está ativa."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── ETAPA 1: Grade de Planos ── */}
        {step === "plans" && (
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={32} className="animate-spin text-[#820000]" />
                <p className="text-sm font-medium text-zinc-500">Carregando planos…</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-zinc-500">Nenhum plano disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl p-6 flex flex-col transition-all duration-200 ${
                      plan.is_featured
                        ? "bg-[#820000] text-white shadow-xl scale-[1.02] z-10"
                        : "bg-white text-zinc-900 border border-zinc-200 hover:border-[#820000]/40 hover:shadow-md"
                    }`}
                  >
                    {plan.is_featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-orange-500 border border-orange-200 px-3 py-0.5 rounded-full shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Mais Popular
                        </span>
                      </div>
                    )}

                    {/* Ícone */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                        plan.is_featured ? "bg-white/20" : "bg-[#820000]/10"
                      }`}
                    >
                      <div
                        className={`grid grid-cols-2 gap-0.5 ${
                          plan.is_featured ? "text-white" : "text-[#820000]"
                        }`}
                      >
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-[2px] border-[1.5px] border-current"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Nome e descrição */}
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p
                      className={`text-xs font-medium mb-5 ${
                        plan.is_featured ? "text-red-100" : "text-zinc-500"
                      }`}
                    >
                      {plan.description}
                    </p>

                    {/* Preço */}
                    <div className="flex items-baseline gap-1 mb-5">
                      <span className="text-2xl font-black tracking-tight">
                        R$ {formatPrice(plan.price)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          plan.is_featured ? "text-red-200" : "text-zinc-400"
                        }`}
                      >
                        /mês
                      </span>
                    </div>

                    {/* Features */}
                    <div className="flex-1 mb-6">
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider mb-3 ${
                          plan.is_featured ? "text-red-200" : "text-zinc-500"
                        }`}
                      >
                        Incluso
                      </p>
                      <ul className="space-y-2.5">
                        {(plan.features ?? []).slice(0, 5).map((feat) => (
                          <li
                            key={feat}
                            className="flex items-center gap-2 text-xs font-medium"
                          >
                            <Check
                              size={13}
                              className={
                                plan.is_featured ? "text-red-200" : "text-[#820000]"
                              }
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                        plan.is_featured
                          ? "bg-white text-[#820000] hover:bg-zinc-50"
                          : "bg-[#820000] text-white hover:bg-[#660000]"
                      }`}
                    >
                      Assinar agora
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ETAPA 2: Checkout Simulado ── */}
        {step === "checkout" && selectedPlan && (
          <div className="p-6">
            {/* Resumo do plano */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500 mb-0.5">
                  Plano selecionado
                </p>
                <p className="text-lg font-bold text-zinc-900">{selectedPlan.name}</p>
                <p className="text-sm text-zinc-500">
                  {selectedPlan.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-zinc-900">
                  R$ {formatPrice(selectedPlan.price)}
                </p>
                <p className="text-xs font-medium text-zinc-400">/mês</p>
              </div>
            </div>

            {/* Seleção de método */}
            <p className="text-sm font-bold text-zinc-700 mb-3">
              Método de pagamento de teste
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* PIX */}
              <button
                onClick={() => setPaymentMethod("pix_simulado")}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  paymentMethod === "pix_simulado"
                    ? "border-[#820000] bg-[#820000]/5"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === "pix_simulado"
                      ? "bg-[#820000] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  <QrCode size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">PIX Fictício</p>
                  <p className="text-xs text-zinc-500">Chave aleatória de teste</p>
                </div>
                {paymentMethod === "pix_simulado" && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#820000] flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </button>

              {/* Cartão */}
              <button
                onClick={() => setPaymentMethod("cartao_simulado")}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  paymentMethod === "cartao_simulado"
                    ? "border-[#820000] bg-[#820000]/5"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === "cartao_simulado"
                      ? "bg-[#820000] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Cartão de Teste</p>
                  <p className="text-xs text-zinc-500">Dados fictícios de sandbox</p>
                </div>
                {paymentMethod === "cartao_simulado" && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#820000] flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </button>
            </div>

            {/* Detalhes do método selecionado */}
            {paymentMethod === "pix_simulado" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 mb-6 space-y-3">
                <p className="text-xs font-bold uppercase text-emerald-700 tracking-wider">
                  Dados do PIX — Ambiente de Teste
                </p>
                {/* QR Code visual fake */}
                <div className="flex justify-center">
                  <div className="w-28 h-28 bg-white border border-emerald-200 rounded-lg grid grid-cols-7 gap-0.5 p-2">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[1px] ${
                          Math.random() > 0.5 ? "bg-zinc-900" : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-emerald-200 px-3 py-2 text-xs font-mono text-zinc-700 break-all select-all">
                  {pixKey}
                </div>
                <p className="text-[11px] text-emerald-700 font-medium text-center">
                  Esta é uma chave fictícia. Nenhuma cobrança real será feita.
                </p>
              </div>
            )}

            {paymentMethod === "cartao_simulado" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-6 space-y-3">
                <p className="text-xs font-bold uppercase text-blue-700 tracking-wider">
                  Cartão de Crédito — Sandbox
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold text-blue-600 mb-1">Número do Cartão</p>
                    <div className="rounded-lg bg-white border border-blue-200 px-3 py-2 text-sm font-mono text-zinc-800 tracking-widest">
                      4000 0000 0000 1234
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-blue-600 mb-1">Validade</p>
                    <div className="rounded-lg bg-white border border-blue-200 px-3 py-2 text-sm font-mono text-zinc-800">
                      12/29
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-blue-600 mb-1">CVV</p>
                    <div className="rounded-lg bg-white border border-blue-200 px-3 py-2 text-sm font-mono text-zinc-800">
                      123
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-blue-700 font-medium text-center">
                  Este é um cartão fictício. Nenhuma cobrança real será feita.
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setStep("plans")}
                className="px-5 py-2.5 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                ← Voltar aos planos
              </button>
              <button
                onClick={handleConfirm}
                disabled={!paymentMethod || confirming}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#820000] text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#660000] active:scale-95 transition-all"
              >
                {confirming ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirmando…
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Confirmar pagamento
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── ETAPA 3: Sucesso ── */}
        {step === "success" && selectedPlan && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-zinc-900">
              Plano ativado com sucesso!
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs">
              Seu plano <strong className="text-zinc-800">{selectedPlan.name}</strong> está
              ativo e pronto para uso. As funcionalidades já estão liberadas na
              sua conta.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-8 py-2.5 rounded-lg bg-[#820000] text-white text-sm font-bold hover:bg-[#660000] active:scale-95 transition-all"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
