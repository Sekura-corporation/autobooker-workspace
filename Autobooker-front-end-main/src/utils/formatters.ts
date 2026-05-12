/**
 * Formata valor para moeda brasileira
 * formatCurrency(1500) → "R$ 1.500,00"
 */
export function formatCurrency(value?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

/**
 * Formata data para padrão brasileiro
 * formatDate('2025-01-15') → "15/01/2025"
 */
export function formatDate(date?: string | Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora
 * formatDateTime('2025-01-15T14:30') → "15/01/2025 às 14:30"
 */
export function formatDateTime(date?: string | Date | null): string {
  if (!date) return "—";
  return new Date(date)
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " às");
}

/**
 * Formata horário somente
 * formatTime('2025-01-15T14:30') → "14:30"
 */
export function formatTime(date?: string | Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata CPF
 * formatCPF('12345678900') → "123.456.789-00"
 */
export function formatCPF(cpf?: string | null): string {
  if (!cpf) return "—";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata telefone
 * formatPhone('88999990001') → "(88) 99999-0001"
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return "—";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

/**
 * Formata CNPJ
 * formatCNPJ('12345678000190') → "12.345.678/0001-90"
 */
export function formatCNPJ(cnpj?: string | null): string {
  if (!cnpj) return "—";
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/**
 * Retorna iniciais do nome para avatar
 * getInitials('João Silva') → "JS"
 */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Formata minutos em horas/minutos
 * formatDuration(90) → "1h 30min"
 */
export function formatDuration(minutes?: number | null): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * Retorna variação percentual formatada
 * formatDelta(120, 100) → "+20%"
 */
export function formatDelta(
  current?: number | null,
  previous?: number | null,
): string | null {
  if (!previous) return null;
  const pct = ((current ?? 0 - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}
