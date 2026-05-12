import { useState } from "react";
import {
  BadgeDollarSign,
  ShieldAlert,
  Paintbrush,
  ServerCog,
  LogOut,
  FileText,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";
import {
  isValidEmail,
  isValidNumber,
  isValidURL,
  isWithinLength,
} from "@/utils/validators";

type SettingsForm = {
  taxRate: string;
  transferDays: string;
  gatewayKey: string;
  maintenanceMode: "off" | "restricted" | "full";
  systemEmail: string;
  sessionTimeout: string;
  termsUrl: string;
  privacyUrl: string;
};

type SettingsErrors = Partial<Record<keyof SettingsForm, string>>;

const SETTINGS_STORAGE_KEY = "@autobooker:admin-settings";

const INITIAL_SETTINGS: SettingsForm = {
  taxRate: "5,5",
  transferDays: "14",
  gatewayKey: "sk_live_********************************",
  maintenanceMode: "off",
  systemEmail: "noreply@autoestetica.com.br",
  sessionTimeout: "120",
  termsUrl: "https://autoestetica.com/termos-de-uso",
  privacyUrl: "https://autoestetica.com/privacidade",
};

function loadPersistedSettings(): SettingsForm {
  if (typeof window === "undefined") {
    return INITIAL_SETTINGS;
  }

  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return INITIAL_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SettingsForm>;
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export default function AdminSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState<SettingsForm>(() =>
    loadPersistedSettings(),
  );
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const validateSettings = () => {
    const nextErrors: SettingsErrors = {};

    const normalizedTaxRate = settings.taxRate.replace(",", ".").trim();
    const normalizedTransferDays = settings.transferDays.trim();
    const normalizedSessionTimeout = settings.sessionTimeout.trim();

    if (!isValidNumber(normalizedTaxRate) || Number(normalizedTaxRate) <= 0) {
      nextErrors.taxRate = "Informe uma taxa válida.";
    }

    if (
      !isValidNumber(normalizedTransferDays) ||
      Number(normalizedTransferDays) <= 0 ||
      !Number.isInteger(Number(normalizedTransferDays))
    ) {
      nextErrors.transferDays = "Informe um número inteiro de dias válido.";
    }

    if (!isWithinLength(settings.gatewayKey.trim(), 10, 500)) {
      nextErrors.gatewayKey = "Informe uma chave de gateway válida.";
    }

    if (!isValidEmail(settings.systemEmail.trim())) {
      nextErrors.systemEmail = "Informe um e-mail válido.";
    }

    if (
      !isValidNumber(normalizedSessionTimeout) ||
      Number(normalizedSessionTimeout) <= 0 ||
      !Number.isInteger(Number(normalizedSessionTimeout))
    ) {
      nextErrors.sessionTimeout = "Informe um tempo de sessão válido.";
    }

    if (!isValidURL(settings.termsUrl.trim())) {
      nextErrors.termsUrl = "Informe uma URL válida para os termos.";
    }

    if (!isValidURL(settings.privacyUrl.trim())) {
      nextErrors.privacyUrl = "Informe uma URL válida para a política.";
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validateSettings();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Corrija os campos destacados antes de salvar.");
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      toast.success("Configurações globais salvas com sucesso.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Logout global solicitado com sucesso.");
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Configurações Globais"
        subtitle="Ajustes mestre do sistema AutoEstetica"
      >
        <Button
          variant="primary"
          className="gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FileText size={18} />
          {isSaving ? "Salvando..." : "Salvar Modificações"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <BadgeDollarSign size={20} className="text-[#820000]" />
            <h3 className="text-xl font-black text-zinc-900">
              Faturamento e Taxas
            </h3>
          </div>

          <div className="space-y-5">
            <Input
              label="Taxa Administrativa Padrão (%)"
              value={settings.taxRate}
              error={errors.taxRate}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, taxRate: e.target.value }))
              }
              helper="Imposto retido na fonte por transações dentro da plataforma."
            />
            <Input
              label="Dias para Repasse Automático"
              value={settings.transferDays}
              error={errors.transferDays}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  transferDays: e.target.value,
                }))
              }
            />
            <Input
              label="Chave Secreta Gateway (Stripe/MercadoPago)"
              type="password"
              value={settings.gatewayKey}
              error={errors.gatewayKey}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, gatewayKey: e.target.value }))
              }
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <ServerCog size={20} className="text-[#820000]" />
            <h3 className="text-xl font-black text-zinc-900">
              Manutenção e Servidor
            </h3>
          </div>

          <div className="space-y-5">
            <label className="flex flex-col gap-2 text-sm font-bold text-[#050505]">
              Modo de Manutenção Restrita
              <select
                className="px-4 py-3 rounded-lg border-2 border-zinc-200 bg-white transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maintenanceMode: e.target
                      .value as SettingsForm["maintenanceMode"],
                  }))
                }
              >
                <option value="off">Desativado (Sistema Operante)</option>
                <option value="restricted">Restrito (Somente Admin)</option>
                <option value="full">Manutenção Total</option>
              </select>
            </label>

            <Input
              label="E-mail Padrão do Sistema (Remetente SMTP)"
              type="email"
              value={settings.systemEmail}
              error={errors.systemEmail}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  systemEmail: e.target.value,
                }))
              }
            />

            <Input
              label="Limite Ocioso de Sessão (minutos)"
              value={settings.sessionTimeout}
              error={errors.sessionTimeout}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sessionTimeout: e.target.value,
                }))
              }
            />

            <Button
              variant="outline"
              className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut size={18} />
              Forçar Logoff de Todos os Usuários
            </Button>
          </div>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Paintbrush size={20} className="text-[#820000]" />
            <h3 className="text-xl font-black text-zinc-900">
              Políticas e Termos
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Termos de Uso (URL Pública)"
              value={settings.termsUrl}
              error={errors.termsUrl}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, termsUrl: e.target.value }))
              }
            />
            <Input
              label="Política de Privacidade (URL Pública)"
              value={settings.privacyUrl}
              error={errors.privacyUrl}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, privacyUrl: e.target.value }))
              }
            />
          </div>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <ShieldAlert size={20} className="text-[#820000]" />
            <h3 className="text-xl font-black text-zinc-900">Observações</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-600">
            <div className="rounded-xl bg-zinc-50 p-4 leading-relaxed">
              Ajustes globais afetam toda a operação da plataforma e devem ser
              validados antes de publicar em produção.
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 leading-relaxed">
              O modo de manutenção restringe o acesso sem interromper a edição
              administrativa de forma total.
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 leading-relaxed">
              A chave do gateway é tratada como dado sensível e não deve ser
              exposta em interfaces públicas.
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 leading-relaxed">
              Políticas e termos devem apontar para URLs públicas válidas e
              versionadas.
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirmar logoff global"
        size="sm"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsLogoutModalOpen(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleForceLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Processando..." : "Confirmar logoff"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-zinc-700">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            Esta ação deve ser usada com cautela. Todos os usuários serão
            solicitados a refazer o login.
          </div>
          <p>
            Se confirmar, a ação será simulada localmente nesta interface até a
            integração com a API de administração.
          </p>
        </div>
      </Modal>
    </div>
  );
}
