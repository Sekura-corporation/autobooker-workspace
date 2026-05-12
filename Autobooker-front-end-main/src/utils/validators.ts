/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");

  if (clean.length !== 11) return false;

  // Bloqueia CPFs repetidos: 111.111.111-11, 000.000.000-00 etc.
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += Number(clean[i]) * (10 - i);
  }

  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;

  if (firstDigit !== Number(clean[9])) return false;

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += Number(clean[i]) * (11 - i);
  }

  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;

  return secondDigit === Number(clean[10]);
}

/**
 * Valida CNPJ (apenas formato)
 */
export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, "");
  return clean.length === 14 && /^\d+$/.test(clean);
}

/**
 * Valida telefone
 */
export function isValidPhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, "");
  return clean.length === 10 || clean.length === 11;
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida senha (mínimo 8 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Valida força da senha
 */
export function getPasswordStrength(
  password: string,
): "weak" | "medium" | "strong" {
  if (password.length < 8) return "weak";
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  const strength = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(
    Boolean,
  ).length;

  if (strength >= 3) return "strong";
  if (strength >= 2) return "medium";
  return "weak";
}

/**
 * Valida se campo está vazio
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Valida min/max de caracteres
 */
export function isWithinLength(
  value: string,
  min: number,
  max: number,
): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Valida se é um número válido
 */
export function isValidNumber(value: unknown): boolean {
  return !isNaN(parseFloat(String(value))) && isFinite(Number(value));
}

/**
 * Valida data (YYYY-MM-DD ou qualquer formato Date)
 */
export function isValidDate(date: string | Date): boolean {
  return !isNaN(new Date(date).getTime());
}

/**
 * Valida se data é futura
 */
export function isFutureDate(date: string | Date): boolean {
  return new Date(date) > new Date();
}

/**
 * Valida se data é passada
 */
export function isPastDate(date: string | Date): boolean {
  return new Date(date) < new Date();
}
