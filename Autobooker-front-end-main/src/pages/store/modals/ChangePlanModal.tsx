import React from "react";
import Button from "@/components/ui/Button";
import { Check, X } from "lucide-react";

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePlanModal({ isOpen, onClose }: ChangePlanModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Básico+",
      price: "49,90",
      description: "O essencial para começar.",
      features: ["Agendamentos", "Clientes", "Estoque", "Relatórios"],
      isPopular: false,
    },
    {
      name: "Comfort+",
      price: "149,90",
      description: "Custo-benefício ideal.",
      features: ["Tudo do Básico+", "Fidelidade", "Relatórios Pro", "Suporte"],
      isPopular: true,
    },
    {
      name: "Premium+",
      price: "299,90",
      description: "Poder total e escala.",
      features: ["Tudo do Comfort+", "Multi-filiais", "WhatsApp", "Consultoria"],
      isPopular: false,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[850px] rounded-md bg-white shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Escolha seu novo Plano
            </h2>
            <p className="text-xs text-zinc-500 font-medium">Eleve o nível da sua gestão hoje mesmo.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-md p-6 transition-all duration-300 flex flex-col ${
                plan.isPopular
                  ? "bg-[#820000] text-white shadow-lg scale-[1.02] z-10"
                  : "bg-white text-zinc-900 border border-zinc-200"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#820000] border border-orange-200 px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Popular</span>
                </div>
              )}

              <div className="mb-5">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${
                  plan.isPopular ? "bg-white/20" : "bg-[#820000]/10"
                }`}>
                  <div className={`grid grid-cols-2 gap-0.5 ${plan.isPopular ? "text-white" : "text-[#820000]"}`}>
                    <div className="w-2 h-2 rounded-[2px] border-[1.5px] border-current"></div>
                    <div className="w-2 h-2 rounded-[2px] border-[1.5px] border-current"></div>
                    <div className="w-2 h-2 rounded-[2px] border-[1.5px] border-current"></div>
                    <div className="w-2 h-2 rounded-[2px] border-[1.5px] border-current"></div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className={`text-xs font-medium ${plan.isPopular ? "text-red-100" : "text-zinc-500"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tight">R${plan.price}</span>
                  <span className={`text-[10px] font-bold ${plan.isPopular ? "text-red-200" : "text-zinc-400"}`}>/mês</span>
                </div>
              </div>

              <div className="flex-1 mb-8">
                <p className={`text-[10px] font-black uppercase tracking-wider mb-4 ${
                  plan.isPopular ? "text-red-200" : "text-zinc-900"
                }`}>O que está incluso?</p>
                
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs font-medium">
                      <Check size={14} className={plan.isPopular ? "text-red-200" : "text-[#820000]"} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full justify-center !rounded-md !py-3 !px-2 text-xs font-bold transition-all active:scale-95 ${
                  plan.isPopular
                    ? "bg-white text-[#820000] hover:bg-zinc-100"
                    : "bg-[#820000] text-white hover:bg-[#660000]"
                }`}
              >
                Assinar agora
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
