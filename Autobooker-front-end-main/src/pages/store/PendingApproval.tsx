import { motion } from "framer-motion";
import { Clock, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function PendingApproval() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden"
      >
        <div className="bg-[#820000] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Clock className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="relative z-10 text-2xl font-bold text-white tracking-tight">
            Conta em Análise
          </h2>
          <p className="relative z-10 text-red-100 text-sm mt-2 font-medium">
            Estamos preparando tudo para você.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-zinc-600 text-sm text-center leading-relaxed">
            Recebemos o cadastro da sua loja. No momento, nossa equipe está realizando a <strong className="text-zinc-900">homologação dos dados</strong> para garantir a segurança e qualidade da plataforma.
          </p>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-900">Cadastro Recebido</p>
                <p className="text-xs text-zinc-500">Seus dados foram salvos com sucesso.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-60">
              <ShieldCheck className="text-zinc-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-900">Análise de Segurança</p>
                <p className="text-xs text-zinc-500">Nossa equipe está validando as informações.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <Mail className="text-blue-500 w-5 h-5 shrink-0" />
            <p className="text-xs text-blue-800">
              Você receberá um e-mail assim que sua conta for ativada e liberada para uso.
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full justify-center !py-3 !rounded-lg font-bold"
            onClick={logout}
          >
            Sair da conta
          </Button>
        </div>
      </motion.div>

      <p className="mt-8 text-xs font-medium text-zinc-400">
        Precisa de ajuda? Fale com nosso <a href="#" className="text-[#820000] hover:underline">suporte</a>.
      </p>
    </div>
  );
}
