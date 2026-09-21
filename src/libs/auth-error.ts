import { toast } from "sonner";

type AuthError = { status?: number; message?: string } | null | undefined;

export function isServiceUnavailable(error: AuthError) {
  if (!error) return false;
  return (
    error.message === "upstream_unavailable" ||
    error.status === 0 ||
    (error.status !== undefined && error.status >= 500)
  );
}

export function notifyServiceUnavailable() {
  toast.error("Não conseguimos concluir sua solicitação agora.", {
    description:
      "Tente novamente em instantes. Se o problema continuar, fale com o suporte.",
    action: {
      label: "Suporte",
      onClick: () => window.open("/suporte", "_blank", "noopener"),
    },
  });
}
