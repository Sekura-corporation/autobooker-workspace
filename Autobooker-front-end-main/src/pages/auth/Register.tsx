import { useState, type FormEvent } from "react";
import { ROLE_ROUTES } from "@/utils/constants";
import api, { setAuthToken } from "@/services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  UserRound,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
  getPasswordStrength,
  isEmpty,
  isValidCNPJ,
  isValidCPF,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isWithinLength,
} from "@/utils/validators";
import Button from "@/components/ui/Button";
import { AuthLayout, Input } from "../../components/layout/AuthLayout";

type AccountType = "personal" | "owner";

type PersonalForm = {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type OwnerForm = {
  responsibleName: string;
  cpf: string;
  phone: string;
  email: string;
  confirmEmail: string;
  storeName: string;
  cnpj: string;
  cep: string;
  address: string;
  cityState: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type PersonalErrors = Partial<Record<keyof PersonalForm, string>>;
type OwnerErrors = Partial<Record<keyof OwnerForm, string>>;

const PERSONAL_INITIAL: PersonalForm = {
  name: "",
  cpf: "",
  phone: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

const OWNER_INITIAL: OwnerForm = {
  responsibleName: "",
  cpf: "",
  phone: "",
  email: "",
  confirmEmail: "",
  storeName: "",
  cnpj: "",
  cep: "",
  address: "",
  cityState: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

const maskCPF = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits
      .slice(0, 10)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

const maskCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const maskCEP = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
};

export default function Register() {
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [ownerStep, setOwnerStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalForm, setPersonalForm] =
    useState<PersonalForm>(PERSONAL_INITIAL);
  const [ownerForm, setOwnerForm] = useState<OwnerForm>(OWNER_INITIAL);
  const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({});
  const [ownerErrors, setOwnerErrors] = useState<OwnerErrors>({});

  const goBackToTypeSelection = () => {
    setAccountType(null);
    setOwnerStep(0);
    setPersonalErrors({});
    setOwnerErrors({});
  };

  const validatePersonal = () => {
    const nextErrors: PersonalErrors = {};

    if (isWithinLength(personalForm.name.trim(), 0, 2)) {
      nextErrors.name = "Informe seu nome completo.";
    }

    if (!isValidCPF(personalForm.cpf)) {
      nextErrors.cpf = "Informe um CPF válido.";
    }

    if (!isValidPhone(personalForm.phone)) {
      nextErrors.phone = "Informe um telefone válido.";
    }

    if (!isValidEmail(personalForm.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (personalForm.email !== personalForm.confirmEmail) {
      nextErrors.confirmEmail = "Os e-mails precisam ser iguais.";
    }

    if (!isValidPassword(personalForm.password)) {
      nextErrors.password = "A senha precisa ter ao menos 8 caracteres.";
    } else if (getPasswordStrength(personalForm.password) === "weak") {
      nextErrors.password = "Use uma senha mais forte.";
    }

    if (personalForm.password !== personalForm.confirmPassword) {
      nextErrors.confirmPassword = "As senhas precisam coincidir.";
    }

    if (!personalForm.acceptTerms) {
      nextErrors.acceptTerms = "Você precisa aceitar os termos.";
    }

    return nextErrors;
  };

  const validateOwnerStep = (step: number) => {
    const nextErrors: OwnerErrors = {};

    if (step === 0) {
      if (isWithinLength(ownerForm.responsibleName.trim(), 0, 2)) {
        nextErrors.responsibleName = "Informe o nome do responsável.";
      }
      if (!isValidCPF(ownerForm.cpf)) {
        nextErrors.cpf = "Informe um CPF válido.";
      }
      if (!isValidPhone(ownerForm.phone)) {
        nextErrors.phone = "Informe um telefone válido.";
      }
      if (!isValidEmail(ownerForm.email)) {
        nextErrors.email = "Informe um e-mail válido.";
      }
      if (ownerForm.email !== ownerForm.confirmEmail) {
        nextErrors.confirmEmail = "Os e-mails precisam ser iguais.";
      }
    }

    if (step === 1) {
      if (isWithinLength(ownerForm.storeName.trim(), 0, 2)) {
        nextErrors.storeName = "Informe o nome da estética.";
      }
      if (!isValidCNPJ(ownerForm.cnpj)) {
        nextErrors.cnpj = "Informe um CNPJ válido.";
      }
      const cleanCep = ownerForm.cep.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        nextErrors.cep = "Informe um CEP válido.";
      }
      if (isEmpty(ownerForm.address)) {
        nextErrors.address = "Informe o endereço da estética.";
      }
      if (isEmpty(ownerForm.cityState)) {
        nextErrors.cityState = "Informe cidade e estado.";
      }
    }

    if (step === 2) {
      if (!isValidPassword(ownerForm.password)) {
        nextErrors.password = "A senha precisa ter ao menos 8 caracteres.";
      } else if (getPasswordStrength(ownerForm.password) === "weak") {
        nextErrors.password = "Use uma senha mais forte.";
      }

      if (ownerForm.password !== ownerForm.confirmPassword) {
        nextErrors.confirmPassword = "As senhas precisam coincidir.";
      }

      if (!ownerForm.acceptTerms) {
        nextErrors.acceptTerms = "Você precisa aceitar os termos.";
      }
    }

    return nextErrors;
  };

  const handlePersonalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validatePersonal();
    setPersonalErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toastError("Corrija os campos destacados antes de continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
    const { data } = await api.post("/auth/register", {
      name: personalForm.name,
      email: personalForm.email,
      phone: personalForm.phone,
      password: personalForm.password,
      password_confirmation: personalForm.confirmPassword,
    });

    setAuthToken(data.token);

    toastSuccess("Cadastro de pessoa física concluído.");
    navigate(ROLE_ROUTES[data.user.role]);
  } catch (err: any) {
    const emailError = err?.response?.data?.errors?.email?.[0];
    const message = err?.response?.data?.message || emailError;

    if (
      emailError ||
      message?.toLowerCase().includes("email") ||
      message?.toLowerCase().includes("taken")
    ) {
      toastError("Já existe uma conta cadastrada com este e-mail.");
      return;
    }

    toastError(message || "Erro ao criar conta.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleOwnerNext = () => {
    const nextErrors = validateOwnerStep(ownerStep);
    setOwnerErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toastError("Corrija os campos destacados antes de avançar.");
      return;
    }

    setOwnerStep((prev) => Math.min(prev + 1, 2));
  };

  const handleOwnerBack = () => {
    setOwnerStep((prev) => Math.max(prev - 1, 0));
    setOwnerErrors({});
  };

  const parseCityState = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return { city: "", state: "" };

    const parts = cleaned.split("/").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { city: parts[0], state: parts[1] };
    }

    const partsDash = cleaned.split("-").map((p) => p.trim()).filter(Boolean);
    if (partsDash.length >= 2) {
      return { city: partsDash[0], state: partsDash[1] };
    }

    return { city: cleaned, state: "" };
  };

  const handleOwnerCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setOwnerForm((prev) => ({
          ...prev,
          cep: data.cep || prev.cep,
          address: data.logradouro ? `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}` : prev.address,
          cityState: data.localidade && data.uf ? `${data.localidade} / ${data.uf}` : prev.cityState,
        }));

        setOwnerErrors((prev) => {
          const next = { ...prev };
          delete next.cep;
          return next;
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleOwnerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateOwnerStep(2);
    setOwnerErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toastError("Corrija os campos destacados antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { city, state } = parseCityState(ownerForm.cityState);

      const { data } = await api.post("/auth/register-store-owner", {
        name: ownerForm.responsibleName,
        email: ownerForm.email,
        password: ownerForm.password,
        phone: ownerForm.phone,
        store: {
          name: ownerForm.storeName,
          cnpj: ownerForm.cnpj,
          phone: ownerForm.phone,
          email: ownerForm.email,
          address: ownerForm.address,
          city,
          state,
          zip_code: ownerForm.cep,
        },
      });

      setAuthToken(data.token);
      toastSuccess("Cadastro concluído com sucesso.");

      const rawRole = data?.user?.role;
      const roleForRoutes = rawRole === "store_owner" ? "store" : rawRole;
      navigate(ROLE_ROUTES[roleForRoutes]);
    } catch (err: any) {
      const status = err?.response?.status;
      const errors = err?.response?.data?.errors;
    
      const emailError = errors?.email?.[0];
      const cnpjError = errors?.["store.cnpj"]?.[0];
      const message = err?.response?.data?.message;
    
      if (status === 422 && emailError) {
        toastError(emailError);
        return;
      }
    
      if (status === 422 && cnpjError) {
        toastError(cnpjError);
        return;
      }
    
      toastError(message || "Erro ao criar conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(personalForm.password);
  const ownerPasswordStrength = getPasswordStrength(ownerForm.password);

  return (
    <AuthLayout>
      {accountType === null && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-1 text-white text-center tracking-tight">
              Crie sua conta
            </h2>
            <p className="text-zinc-400 text-sm mb-8 text-center font-light leading-snug px-4">
              Escolha o tipo de cadastro que melhor representa você.
            </p>
          </div>

          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => setAccountType("personal")}
              className="rounded-xl border border-zinc-700 bg-white/5 p-5 text-left transition-all hover:border-red-500 hover:bg-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/15 p-3 text-red-400">
                  <UserRound size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    Pessoa física
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                    Ideal para quem quer usar a plataforma como cliente final,
                    com um cadastro simples e rápido.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("owner")}
              className="rounded-xl border border-zinc-700 bg-white/5 p-5 text-left transition-all hover:border-red-500 hover:bg-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/15 p-3 text-red-400">
                  <Building2 size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    Dono de estética
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                    Cadastro em etapas para quem quer cadastrar a estética,
                    criar acesso e aguardar aprovação da operação.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
            >
              Já tenho uma conta
            </button>
          </div>
        </div>
      )}

      {accountType === "personal" && (
        <form onSubmit={handlePersonalSubmit}>
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={goBackToTypeSelection}
              className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-zinc-300">
              <CheckCircle2 size={12} />
              Pessoa física
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-1 text-white text-center tracking-tight">
            Cadastro pessoal
          </h2>
          <p className="text-zinc-400 text-sm mb-8 text-center font-light leading-snug px-4">
            Preencha seus dados para criar uma conta individual.
          </p>

          <Input
            label="Nome completo"
            placeholder="Nome completo"
            value={personalForm.name}
            error={personalErrors.name}
            onChange={(e) =>
              setPersonalForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={personalForm.cpf}
              error={personalErrors.cpf}
              onChange={(e) =>
                setPersonalForm((prev) => ({ ...prev, cpf: maskCPF(e.target.value) }))
              }
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(00) 00000-0000"
              value={personalForm.phone}
              error={personalErrors.phone}
              onChange={(e) =>
                setPersonalForm((prev) => ({ ...prev, phone: maskPhone(e.target.value) }))
              }
            />
          </div>

          <Input
            label="E-mail"
            placeholder="email@email.com"
            type="email"
            value={personalForm.email}
            error={personalErrors.email}
            onChange={(e) =>
              setPersonalForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <Input
            label="Confirme seu e-mail"
            placeholder="email@email.com"
            type="email"
            value={personalForm.confirmEmail}
            error={personalErrors.confirmEmail}
            onChange={(e) =>
              setPersonalForm((prev) => ({
                ...prev,
                confirmEmail: e.target.value,
              }))
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input
              label="Senha"
              placeholder="**********"
              type="password"
              value={personalForm.password}
              error={personalErrors.password}
              helper={`Força da senha: ${passwordStrength === "strong" ? "forte" : passwordStrength === "medium" ? "média" : "fraca"}`}
              onChange={(e) =>
                setPersonalForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
            <Input
              label="Confirme sua senha"
              placeholder="**********"
              type="password"
              value={personalForm.confirmPassword}
              error={personalErrors.confirmPassword}
              onChange={(e) =>
                setPersonalForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
            />
          </div>

          <label className="mb-6 flex items-start gap-3 rounded-xl border border-zinc-700 bg-white/5 p-4 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={personalForm.acceptTerms}
              onChange={(e) =>
                setPersonalForm((prev) => ({
                  ...prev,
                  acceptTerms: e.target.checked,
                }))
              }
              className="mt-1"
            />
            <span>
              Li e aceito os termos de uso e a política de privacidade.
            </span>
          </label>
          {personalErrors.acceptTerms && (
            <p className="-mt-4 mb-4 text-xs text-red-400">
              {personalErrors.acceptTerms}
            </p>
          )}

          <Button
            variant="primary"
            className="w-full mb-4"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-xs text-zinc-400 mt-2">
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-white font-semibold hover:text-red-500 transition-colors"
            >
              Faça Login
            </button>
          </p>
        </form>
      )}

      {accountType === "owner" && (
        <form onSubmit={handleOwnerSubmit}>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goBackToTypeSelection}
              className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Trocar tipo
            </button>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-zinc-300">
              <BriefcaseBusiness size={12} />
              Dono de estética
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-1 text-white text-center tracking-tight">
            Cadastro da estética
          </h2>
          <p className="text-zinc-400 text-sm mb-8 text-center font-light leading-snug px-4">
            Preencha as informações do responsável e da estética em etapas.
          </p>

          <div className="flex items-center gap-2 mb-6">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`flex-1 rounded-full h-2 ${ownerStep >= step ? "bg-red-600" : "bg-zinc-700"}`}
              />
            ))}
          </div>

          {ownerStep === 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                <UserRound size={18} className="text-red-400" />
                Dados do responsável
              </div>
              <Input
                label="Nome completo"
                placeholder="Nome do responsável"
                value={ownerForm.responsibleName}
                error={ownerErrors.responsibleName}
                onChange={(e) =>
                  setOwnerForm((prev) => ({
                    ...prev,
                    responsibleName: e.target.value,
                  }))
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={ownerForm.cpf}
                  error={ownerErrors.cpf}
                  onChange={(e) =>
                    setOwnerForm((prev) => ({ ...prev, cpf: maskCPF(e.target.value) }))
                  }
                />
                <Input
                  label="Telefone / WhatsApp"
                  placeholder="(00) 00000-0000"
                  value={ownerForm.phone}
                  error={ownerErrors.phone}
                  onChange={(e) =>
                    setOwnerForm((prev) => ({ ...prev, phone: maskPhone(e.target.value) }))
                  }
                />
              </div>
              <Input
                label="E-mail"
                placeholder="email@email.com"
                type="email"
                value={ownerForm.email}
                error={ownerErrors.email}
                onChange={(e) =>
                  setOwnerForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <Input
                label="Confirme seu e-mail"
                placeholder="email@email.com"
                type="email"
                value={ownerForm.confirmEmail}
                error={ownerErrors.confirmEmail}
                onChange={(e) =>
                  setOwnerForm((prev) => ({
                    ...prev,
                    confirmEmail: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {ownerStep === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                <Building2 size={18} className="text-red-400" />
                Dados da estética
              </div>
              <Input
                label="Nome da estética"
                placeholder="Nome fantasia"
                value={ownerForm.storeName}
                error={ownerErrors.storeName}
                onChange={(e) =>
                  setOwnerForm((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                  }))
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Input
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  value={ownerForm.cnpj}
                  error={ownerErrors.cnpj}
                  onChange={(e) =>
                    setOwnerForm((prev) => ({ ...prev, cnpj: maskCNPJ(e.target.value) }))
                  }
                />
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={ownerForm.cep}
                  error={ownerErrors.cep}
                  onChange={(e) =>
                    setOwnerForm((prev) => ({ ...prev, cep: maskCEP(e.target.value) }))
                  }
                  onBlur={(e) => handleOwnerCepLookup(e.target.value)}
                />
              </div>
              <Input
                label="Cidade / Estado"
                placeholder="São Paulo / SP"
                value={ownerForm.cityState}
                error={ownerErrors.cityState}
                onChange={(e) =>
                  setOwnerForm((prev) => ({
                    ...prev,
                    cityState: e.target.value,
                  }))
                }
              />
              <Input
                label="Endereço"
                placeholder="Rua, número, bairro"
                value={ownerForm.address}
                error={ownerErrors.address}
                onChange={(e) =>
                  setOwnerForm((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
          )}

          {ownerStep === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                <CircleDollarSign size={18} className="text-red-400" />
                Acesso e revisão final
              </div>
              <Input
                label="Senha"
                placeholder="**********"
                type="password"
                value={ownerForm.password}
                error={ownerErrors.password}
                helper={`Força da senha: ${ownerPasswordStrength === "strong" ? "forte" : ownerPasswordStrength === "medium" ? "média" : "fraca"}`}
                onChange={(e) =>
                  setOwnerForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              <Input
                label="Confirme sua senha"
                placeholder="**********"
                type="password"
                value={ownerForm.confirmPassword}
                error={ownerErrors.confirmPassword}
                onChange={(e) =>
                  setOwnerForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />

              <div className="rounded-xl border border-zinc-700 bg-white/5 p-4 text-sm text-zinc-300 mb-4">
                <p className="font-semibold text-white mb-2">Resumo</p>
                <div className="space-y-1">
                  <p>Responsável: {ownerForm.responsibleName || "-"}</p>
                  <p>Estética: {ownerForm.storeName || "-"}</p>
                  <p>CNPJ: {ownerForm.cnpj || "-"}</p>
                  <p>Local: {ownerForm.cityState || "-"}</p>
                </div>
              </div>

              <label className="mb-4 flex items-start gap-3 rounded-xl border border-zinc-700 bg-white/5 p-4 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={ownerForm.acceptTerms}
                  onChange={(e) =>
                    setOwnerForm((prev) => ({
                      ...prev,
                      acceptTerms: e.target.checked,
                    }))
                  }
                  className="mt-1"
                />
                <span>
                  Declaro que os dados da estética são verdadeiros e aceito os
                  termos da plataforma.
                </span>
              </label>
              {ownerErrors.acceptTerms && (
                <p className="-mt-2 mb-4 text-xs text-red-400">
                  {ownerErrors.acceptTerms}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 mb-4">
            {ownerStep > 0 ? (
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                type="button"
                onClick={handleOwnerBack}
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                type="button"
                onClick={goBackToTypeSelection}
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} />
                Trocar tipo
              </Button>
            )}

            {ownerStep < 2 ? (
              <Button
                variant="primary"
                className="flex-1 gap-2"
                type="button"
                onClick={handleOwnerNext}
                disabled={isSubmitting}
              >
                Continuar
              </Button>
            ) : (
              <Button
                variant="primary"
                className="flex-1 gap-2"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar cadastro"}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-zinc-400 mt-2">
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-white font-semibold hover:text-red-500 transition-colors"
            >
              Faça Login
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
