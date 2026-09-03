export type CardBrand = "visa" | "mastercard" | "amex" | "card";
export type BillingDocumentType = "DNI" | "RUC";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

export function detectCardBrand(value: string): CardBrand {
  const digits = onlyDigits(value);
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "card";
}

export function isValidCardNumber(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let doubleDigit = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

export function isValidFutureExpiry(
  value: string,
  today = new Date(),
): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

export function isValidSecurityCode(value: string): boolean {
  return /^\d{3,4}$/.test(value);
}

export function isValidBillingDocument(
  type: BillingDocumentType,
  value: string,
): boolean {
  const digits = onlyDigits(value);
  return type === "DNI" ? digits.length === 8 : digits.length === 11;
}
