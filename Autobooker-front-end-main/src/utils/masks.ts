export type MaskType = "cpf" | "cnpj" | "phone" | "cep" | "currency" | "integer" | "plate" | "none";

export const maskCPF = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const maskPhone = (value: string) => {
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

export const maskCEP = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
};

export const maskCurrency = (value: string | number) => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  
  const numericValue = parseInt(digits, 10) / 100;
  
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const unmaskCurrency = (value: string): number => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
};

export const maskInteger = (value: string | number) => {
  const digits = String(value).replace(/\D/g, "");
  return digits;
};

export const maskPlate = (value: string) => {
  // Converte para maiúsculo e remove tudo que não for letra ou número
  const alphanumeric = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Formato antigo: ABC-1234
  // Formato novo Mercosul: ABC1D23
  // O máximo de caracteres é 7
  const truncated = alphanumeric.slice(0, 7);
  
  if (truncated.length <= 3) {
    return truncated;
  }
  
  // Insere um hífen após a terceira letra para consistência visual do formato antigo (embora placa mercosul não precise estritamente de hífen, é comum usar na digitação)
  return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
};

export const applyMask = (value: string, maskType: MaskType): string => {
  switch (maskType) {
    case "cpf":
      return maskCPF(value);
    case "cnpj":
      return maskCNPJ(value);
    case "phone":
      return maskPhone(value);
    case "cep":
      return maskCEP(value);
    case "currency":
      return maskCurrency(value);
    case "integer":
      return maskInteger(value);
    case "plate":
      return maskPlate(value);
    default:
      return value;
  }
};
