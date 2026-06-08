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
import { getAdminSettings, updateAdminSettings, forceGlobalLogout } from "@/services/admin.service";
import {
  isValidEmail,
  isValidNumber,
  isValidURL,
  isWithinLength,
  isValidPhone,
  isEmpty,
} from "@/utils/validators";

type SettingsForm = {
  tax_rate: string;
  platform_commission_default: string;
  maintenance_mode: "off" | "restricted" | "full";
  support_email: string;
  support_phone: string;
  max_stores_free_trial: string;
  free_trial_days: string;
  gateway_mode: "sandbox" | "live";
  brand_name: string;
};

type SettingsErrors = Partial<Record<keyof SettingsForm, string>>;

const INITIAL_SETTINGS: SettingsForm = {
  tax_rate: "5",
  platform_commission_default: "10",
  maintenance_mode: "off",
  support_email: "suporte@autobooker.com",
  support_phone: "(11) 99999-9999",
  max_stores_free_trial: "1",
  free_trial_days: "14",
  gateway_mode: "sandbox",
  brand_name: "AutoBooker",
};

export default function AdminSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState<SettingsForm>(INITIAL_SETTINGS);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      if (Object.keys(data).length > 0) {
        setSettings({
          tax_rate: data.tax_rate || INITIAL_SETTINGS.tax_rate,
          platform_commission_default: data.platform_commission_default || INITIAL_SETTINGS.platform_commission_default,
          maintenance_mode: (data.maintenance_mode as any) || INITIAL_SETTINGS.maintenance_mode,
          support_email: data.support_email || INITIAL_SETTINGS.support_email,
          support_phone: data.support_phone || INITIAL_SETTINGS.support_phone,
          max_stores_free_trial: data.max_stores_free_trial || INITIAL_SETTINGS.max_stores_free_trial,
          free_trial_days: data.free_trial_days || INITIAL_SETTINGS.free_trial_days,
          gateway_mode: (data.gateway_mode as any) || INITIAL_SETTINGS.gateway_mode,
          brand_name: data.brand_name || INITIAL_SETTINGS.brand_name,
        });
      }
    } catch (err) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchSettings();
  });

  const validateSettings = () => {
    const nextErrors: SettingsErrors = {};

    if (!isValidNumber(settings.tax_rate) || Number(settings.tax_rate) < 0) {
      nextErrors.tax_rate = "Informe uma taxa válida.";
    }

    if (!isValidNumber(settings.platform_commission_default) || Number(settings.platform_commission_default) < 0) {
      nextErrors.platform_commission_default = "Informe uma comissão válida.";
    }

    if (!isValidEmail(settings.support_email.trim())) {
      nextErrors.support_email = "Informe um e-mail válido.";
    }

    if (!isValidPhone(settings.support_phone)) {
      nextErrors.support_phone = "Informe um telefone válido.";
    }

    if (!isValidNumber(settings.max_stores_free_trial) || Number(settings.max_stores_free_trial) <= 0) {
      nextErrors.max_stores_free_trial = "Informe um limite válido.";
    }

    if (!isValidNumber(settings.free_trial_days) || Number(settings.free_trial_days) <= 0) {
      nextErrors.free_trial_days = "Informe um número de dias válido.";
    }

    if (isEmpty(settings.brand_name)) {
      nextErrors.brand_name = "O nome da marca é obrigatório.";
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
      await updateAdminSettings(settings as any);
      toast.success("Configurações globais salvas com sucesso.");
    } catch (err) {
      toast.error("Erro ao salvar configurações globais.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    try {
      await forceGlobalLogout();
      toast.success("Logoff global executado. Todos os outros usuários foram desconectados.");
    } catch (err) {
      toast.error("Erro ao forçar logoff global.");
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
        {loading && (
          <div className="col-span-1 xl:col-span-2 py-10 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#820000]"></div>
          </div>
        )}
        {!loading && (
          <>
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
              value={settings.tax_rate}
              error={errors.tax_rate}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, tax_rate: e.target.value.replace(/[^\d.]/g, "") }))
              }
              helper="Imposto retido na fonte por transações dentro da plataforma."
            />
            <Input
              label="Comissão Padrão da Plataforma (%)"
              value={settings.platform_commission_default}
              error={errors.platform_commission_default}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  platform_commission_default: e.target.value.replace(/[^\d.]/g, ""),
                }))
              }
            />
            <label className="flex flex-col gap-2 text-sm font-bold text-[#050505]">
              Modo do Gateway
              <select
                className="px-4 py-3 rounded-lg border-2 border-zinc-200 bg-white transition-all font-medium text-sm focus:outline-none focus:border-[#820000]"
                value={settings.gateway_mode}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    gateway_mode: e.target.value as "sandbox" | "live",
                  }))
                }
              >
                <option value="sandbox">Sandbox (Teste)</option>
                <option value="live">Live (Produção)</option>
              </select>
            </label>
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
                value={settings.maintenance_mode}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maintenance_mode: e.target
                      .value as SettingsForm["maintenance_mode"],
                  }))
                }
              >
                <option value="off">Desativado (Sistema Operante)</option>
                <option value="restricted">Restrito (Somente Admin)</option>
                <option value="full">Manutenção Total</option>
              </select>
            </label>

            <Input
              label="Dias de Teste Grátis (Free Trial)"
              value={settings.free_trial_days}
              error={errors.free_trial_days}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  free_trial_days: e.target.value.replace(/\D/g, ""),
                }))
              }
            />

            <Input
              label="Máx. Lojas no Teste Grátis"
              value={settings.max_stores_free_trial}
              error={errors.max_stores_free_trial}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  max_stores_free_trial: e.target.value.replace(/\D/g, ""),
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
              Informações de Contato / Suporte
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Nome da Marca"
              value={settings.brand_name}
              error={errors.brand_name}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, brand_name: e.target.value }))
              }
            />
            <Input
              label="E-mail de Suporte"
              type="email"
              value={settings.support_email}
              error={errors.support_email}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, support_email: e.target.value }))
              }
            />
            <Input
              label="Telefone de Suporte"
              value={settings.support_phone}
              error={errors.support_phone}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, support_phone: e.target.value }))
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
        </>
      )}
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
