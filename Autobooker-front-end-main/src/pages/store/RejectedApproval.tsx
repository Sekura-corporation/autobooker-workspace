import { motion } from "framer-motion";
import { XCircle, Phone, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function RejectedApproval() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden"
      >
        <div className="bg-red-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <XCircle className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="relative z-10 text-2xl font-bold text-white tracking-tight">
            Cadastro Não Aprovado
          </h2>
          <p className="relative z-10 text-red-100 text-sm mt-2 font-medium">
            Sua solicitação de acesso foi recusada.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-zinc-600 text-sm text-center leading-relaxed">
            Após a análise da nossa equipe, identificamos que os dados fornecidos não atendem aos critérios necessários para ativação da conta na plataforma neste momento.
          </p>

          <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
            <Phone className="text-zinc-500 w-5 h-5 shrink-0" />
            <p className="text-xs text-zinc-600">
              Caso acredite que houve um engano ou deseje enviar documentações adicionais, por favor, entre em contato com nossa central de atendimento.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant="primary" 
              className="w-full justify-center !py-3 !rounded-lg font-bold bg-zinc-900 hover:bg-zinc-800"
              onClick={() => window.open('mailto:suporte@autobooker.com')}
            >
              Falar com o Suporte
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-center !py-3 !rounded-lg font-bold gap-2 text-zinc-600"
              onClick={logout}
            >
              <ArrowLeft size={18} />
              Voltar para o Início
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
