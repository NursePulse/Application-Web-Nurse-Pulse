import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isValidBillingDocument,
  isValidCardNumber,
  isValidFutureExpiry,
  isValidSecurityCode,
} from "./payment-validation";

describe("payment simulation validation", () => {
  it("formats and validates the simulated Visa card", () => {
    const card = formatCardNumber("4242424242424242");

    expect(card).toBe("4242 4242 4242 4242");
    expect(detectCardBrand(card)).toBe("visa");
    expect(isValidCardNumber(card)).toBe(true);
  });

  it("rejects an invalid card number", () => {
    expect(isValidCardNumber("4242 4242 4242 4241")).toBe(false);
  });

  it("validates future expiry dates using the supplied current date", () => {
    const today = new Date(2026, 6, 6);

    expect(formatExpiry("0828")).toBe("08/28");
    expect(isValidFutureExpiry("08/28", today)).toBe(true);
    expect(isValidFutureExpiry("06/26", today)).toBe(false);
  });

  it("validates DNI, RUC and security codes", () => {
    expect(isValidBillingDocument("DNI", "12345678")).toBe(true);
    expect(isValidBillingDocument("RUC", "20123456789")).toBe(true);
    expect(isValidBillingDocument("DNI", "20123456789")).toBe(false);
    expect(isValidSecurityCode("123")).toBe(true);
    expect(isValidSecurityCode("12")).toBe(false);
  });
});
