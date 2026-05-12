import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Bell, Lock, Eye, Trash2, Download } from "lucide-react";

export default function ClientSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    promotions: true,
    reminders: true,
    newsletter: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <PageWrapper
      pageTitle="Configurações"
      pageSubtitle="Personalize sua experiência"
    >
      <div className="max-w-3xl space-y-6">
        {/* Notificações */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#820000]" />
            <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">
                  Notificações por Email
                </p>
                <p className="text-sm text-gray-600">
                  Receba atualizações de agendamentos por email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle("emailNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#820000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#820000]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">
                  Notificações por SMS
                </p>
                <p className="text-sm text-gray-600">
                  Receba lembretes via mensagem de texto
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle("smsNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#820000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#820000]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Notificações Push</p>
                <p className="text-sm text-gray-600">
                  Notificações em tempo real no aplicativo
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle("pushNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#820000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#820000]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">
                  Ofertas e Promoções
                </p>
                <p className="text-sm text-gray-600">
                  Receba descontos exclusivos e ofertas especiais
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promotions}
                  onChange={() => handleToggle("promotions")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#820000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#820000]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">
                  Lembretes de Agendamentos
                </p>
                <p className="text-sm text-gray-600">
                  Notificações antes dos seus compromissos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminders}
                  onChange={() => handleToggle("reminders")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#820000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#820000]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-600">
                  Receba nossas notícias e dicas semanais
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newsletter}
                  onChange={() => handleToggle("newsletter")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#820000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#820000]"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Segurança */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#820000]" />
            <h2 className="text-2xl font-bold text-gray-900">Segurança</h2>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="w-4 h-4 mr-2" />
              Sessões Ativas
            </Button>
          </div>
        </Card>

        {/* Dados */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-6 h-6 text-[#820000]" />
            <h2 className="text-2xl font-bold text-gray-900">Dados</h2>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Baixar Meus Dados
            </Button>
          </div>
        </Card>

        {/* Zona de Risco */}
        <Card className="p-6 bg-red-50 border border-red-200">
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Zona de Risco
          </h2>

          <Button
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-50 justify-start"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar Conta Permanentemente
          </Button>
          <p className="text-sm text-red-700 mt-3">
            ⚠️ Esta ação é irreversível. Todos os seus dados serão perdidos.
          </p>
        </Card>

        {/* Botão Salvar */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-[#820000] hover:bg-[#660000]">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
