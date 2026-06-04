const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/**
 * Converte o valor de avatar da API em URL utilizável pelo navegador.
 */
export function resolveAvatarUrl(avatar?: string | null): string | undefined {
  if (!avatar) {
    return undefined;
  }

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    const apiOrigin = API_BASE.replace(/\/api\/?$/, "");

    try {
      const parsed = new URL(avatar);
      const expected = new URL(apiOrigin);

      if (parsed.hostname === "localhost" && expected.hostname === "127.0.0.1") {
        parsed.hostname = "127.0.0.1";
        return parsed.toString();
      }
    } catch {
      return avatar;
    }

    return avatar;
  }

  const apiOrigin = API_BASE.replace(/\/api\/?$/, "");

  if (avatar.startsWith("/")) {
    return `${apiOrigin}${avatar}`;
  }

  return `${apiOrigin}/storage/${avatar.replace(/^\//, "")}`;
}
