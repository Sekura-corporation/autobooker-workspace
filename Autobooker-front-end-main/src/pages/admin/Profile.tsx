import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
  Bell,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
  UserCircle2,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import AvatarUpload from "@/components/ui/AvatarUpload";
import Badge from "@/components/ui/Badge";
import { ROLES } from "@/utils/constants";
import { updateProfile, changePassword } from "@/services/auth.service";
import {
  getPasswordStrength,
  isEmpty,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isWithinLength,
} from "@/utils/validators";

const PROFILE_STORAGE_KEY = "@autobooker:admin-profile";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    security: boolean;
  };
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileErrors = Partial<
  Record<"name" | "email" | "phone" | keyof PasswordForm, string>
>;

function loadPersistedProfile(
  defaultName: string,
  defaultEmail: string,
): ProfileForm {
  const fallback: ProfileForm = {
    name: defaultName,
    email: defaultEmail,
    phone: "(11) 99999-8888",
    notifications: {
      email: true,
      browser: true,
      security: true,
    },
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProfileForm>;
    return {
      ...fallback,
      ...parsed,
      notifications: {
        ...fallback.notifications,
        ...parsed.notifications,
      },
    };
  } catch {
    return fallback;
  }
}

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileForm>(() =>
    loadPersistedProfile(
      user?.name ?? "Administrador AutoBooker",
      user?.email ?? "admin@autobooker.com",
    ),
  );
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    const nextErrors: ProfileErrors = {};

    if (isEmpty(profile.name) || !isWithinLength(profile.name.trim(), 3, 80)) {
      nextErrors.name = "Informe um nome válido.";
    }

    if (!isValidEmail(profile.email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (!isValidPhone(profile.phone)) {
      nextErrors.phone = "Informe um telefone válido.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Corrija os campos destacados antes de salvar.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedUser = await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      // Update notifications locally as they might not be fully supported in the backend yet
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          id: user?.id,
          role: user?.role,
          notifications: profile.notifications,
        }),
      );

      updateUser({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });

      toast.success("Perfil atualizado com sucesso.");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        if (backendErrors.email) setErrors((prev) => ({ ...prev, email: backendErrors.email[0] }));
        if (backendErrors.phone) setErrors((prev) => ({ ...prev, phone: backendErrors.phone[0] }));
        toast.error("Alguns dados são inválidos.");
      } else {
        toast.error("Erro ao atualizar o perfil. Tente novamente.");
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const handleChangePassword = async () => {
    const nextErrors: ProfileErrors = {};

    if (isEmpty(passwordForm.currentPassword)) {
      nextErrors.currentPassword = "Informe sua senha atual.";
    }

    if (!isValidPassword(passwordForm.newPassword)) {
      nextErrors.newPassword =
        "A nova senha precisa ter ao menos 8 caracteres.";
    } else if (passwordStrength === "weak") {
      nextErrors.newPassword = "Use uma senha mais forte.";
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "A confirmação não confere.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Corrija os campos de senha antes de continuar.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword,
      });

      toast.success("Senha alterada com sucesso.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        if (backendErrors.current_password) {
          setErrors((prev) => ({ ...prev, currentPassword: backendErrors.current_password[0] }));
        }
        if (backendErrors.new_password) {
          setErrors((prev) => ({ ...prev, newPassword: backendErrors.new_password[0] }));
        }
        toast.error("Verifique os campos de senha.");
      } else {
        toast.error("Erro ao alterar senha. Tente novamente.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationChange = (
    key: keyof ProfileForm["notifications"],
    checked: boolean,
  ) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Meu Perfil"
        subtitle="Dados da conta, segurança e preferências do administrador"
      >
        <Badge variant="success">
          {ROLES.ADMIN === user?.role ? "Conta Admin" : "Conta"}
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <AvatarUpload
                  name={profile.name}
                  avatar={user?.avatar}
                  size="lg"
                  onAvatarChange={(avatar) => updateUser({ avatar })}
                />
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-zinc-500">{profile.email}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Perfil de acesso: Admin
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                className="gap-2"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
              >
                <UserCircle2 size={16} />
                {isSavingProfile ? "Salvando..." : "Salvar perfil"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome completo"
                value={profile.name}
                error={errors.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                label="E-mail"
                type="email"
                value={profile.email}
                error={errors.email}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <Input
                label="Telefone"
                value={profile.phone}
                error={errors.phone}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <Input label="Cargo" value="Administrador Geral" disabled />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound size={20} className="text-[#820000]" />
              <h3 className="text-xl font-black text-zinc-900">Segurança</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Senha atual"
                type="password"
                value={passwordForm.currentPassword}
                error={errors.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
              <Input
                label="Nova senha"
                type="password"
                value={passwordForm.newPassword}
                error={errors.newPassword}
                helper={`Força da senha: ${passwordStrength === "strong" ? "forte" : passwordStrength === "medium" ? "média" : "fraca"}`}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                value={passwordForm.confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                <Lock size={16} />
                {isChangingPassword ? "Processando..." : "Alterar senha"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={20} className="text-[#820000]" />
              <h3 className="text-xl font-black text-zinc-900">Preferências</h3>
            </div>

            <div className="space-y-3 text-sm text-zinc-700">
              <label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4">
                <span>Notificações por e-mail</span>
                <input
                  type="checkbox"
                  checked={profile.notifications.email}
                  onChange={(e) =>
                    handleNotificationChange("email", e.target.checked)
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4">
                <span>Alertas no navegador</span>
                <input
                  type="checkbox"
                  checked={profile.notifications.browser}
                  onChange={(e) =>
                    handleNotificationChange("browser", e.target.checked)
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4">
                <span>Alertas de segurança</span>
                <input
                  type="checkbox"
                  checked={profile.notifications.security}
                  onChange={(e) =>
                    handleNotificationChange("security", e.target.checked)
                  }
                />
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={20} className="text-[#820000]" />
              <h3 className="text-xl font-black text-zinc-900">Sessão</h3>
            </div>

            <div className="space-y-3 text-sm text-zinc-700">
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  Último acesso
                </p>
                <p className="mt-1 font-medium">Hoje, 09:12</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  Dispositivo atual
                </p>
                <p className="mt-1 font-medium">Desktop Windows · Chrome</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  Autenticação
                </p>
                <p className="mt-1 font-medium">2FA habilitado</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Smartphone size={20} className="text-[#820000]" />
              <h3 className="text-xl font-black text-zinc-900">Resumo</h3>
            </div>

            <div className="space-y-3 text-sm text-zinc-700">
              <div className="rounded-xl bg-zinc-50 p-4">
                Conta vinculada ao administrador principal do sistema.
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                Alterações de nome e e-mail são refletidas no cabeçalho da
                sessão.
              </div>
              <div className="rounded-xl bg-zinc-50 p-4">
                Preferências e contato ficam preservados no navegador.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
