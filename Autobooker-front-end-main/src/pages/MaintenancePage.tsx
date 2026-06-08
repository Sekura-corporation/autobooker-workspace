import { Wrench, ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { clearAuthToken } from "@/services/api";

export default function MaintenancePage() {
  const handleLogoutAndHome = () => {
    clearAuthToken();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-zinc-100">
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Wrench size={40} className="text-[#820000]" />
        </div>
        
        <h1 className="text-3xl font-black text-zinc-900 mb-3 tracking-tight">
          Sistema em Manutenção
        </h1>
        
        <p className="text-zinc-600 mb-8 leading-relaxed">
          Nossa plataforma está passando por atualizações temporárias para melhorar sua experiência. 
          Agradecemos sua paciência e pedimos que aguarde, voltaremos em breve!
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-8 text-left">
          <ShieldAlert size={24} className="text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Não se preocupe:</strong> Seus dados estão seguros e nenhum agendamento foi perdido durante esta pausa.
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full text-zinc-600 hover:text-zinc-900"
          onClick={handleLogoutAndHome}
        >
          Voltar para a Página Inicial
        </Button>
      </div>
    </div>
  );
}
