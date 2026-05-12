import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout, SuccessView } from "../../components/layout/AuthLayout";

interface SuccessStateProps {
  type: "register" | "password";
}

interface SuccessLocationState {
  accountType?: "personal" | "owner";
}

export default function SuccessState({ type }: SuccessStateProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SuccessLocationState | null;

  const content =
    type === "password"
      ? {
          title: "Senha redefinida",
          description:
            "Sua senha foi atualizada. Agora você pode acessar sua conta.",
          actionLabel: "Ir para o login",
        }
      : state?.accountType === "owner"
        ? {
            title: "Cadastro enviado para análise",
            description:
              "Recebemos os dados da sua estética. Após a validação, você receberá o acesso completo.",
            actionLabel: "Voltar para o login",
          }
        : {
            title: "Cadastro realizado",
            description:
              "Sua conta foi criada com sucesso. Faça o login para continuar.",
            actionLabel: "Ir para o login",
          };

  return (
    <AuthLayout>
      <SuccessView
        title={content.title}
        description={content.description}
        actionLabel={content.actionLabel}
        onAction={() => navigate("/login")}
      />
    </AuthLayout>
  );
}
