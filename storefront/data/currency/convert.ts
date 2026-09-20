import { BASE_CURRENCY, type Rates } from "./currencies";

function rateFor(code: string, rates: Rates): number | null {
  if (code === BASE_CURRENCY) return 1;
  const r = rates[code];
  return typeof r === "number" && r > 0 ? r : null;
}

/**
 * Convert an amount between two currencies using rates quoted per 1 AUD.
 * Returns null when either currency has no known rate.
 */
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Rates,
): number | null {
  if (from === to) return amount;
  const rf = rateFor(from, rates);
  const rt = rateFor(to, rates);
  if (rf === null || rt === null) return null;
  return (amount / rf) * rt;
}

export type PriceOptions = {
  /** Append the currency code, e.g. "$249 AUD" */
  withCode?: boolean;
  /** Drop the decimals when the amount is a whole number, e.g. "$249" not "$249.00" */
  compact?: boolean;
};

/** Format money. The store's own currency gets a bare "$", others a clear symbol. */
export function formatMoney(
  amount: number,
  currency: string,
  opts: PriceOptions = {},
): string {
  const whole = Math.abs(amount - Math.round(amount)) < 0.005;
  const dropDecimals = (opts.compact || opts.withCode) && whole;
  try {
    const text = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
      // With a visible code the symbol can always be the short one.
      currencyDisplay:
        currency === BASE_CURRENCY || opts.withCode ? "narrowSymbol" : "symbol",
      ...(dropDecimals ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
    }).format(amount);
    return opts.withCode ? `${text} ${currency}` : text;
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Convert and format a price for display. If the target currency cannot be
 * converted, the original currency is shown instead so a price is never wrong.
 */
export function displayPrice(
  amount: number | string,
  from: string,
  to: string,
  rates: Rates,
  opts: PriceOptions = {},
): { text: string; currency: string; converted: boolean } {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const converted = convertAmount(n, from, to, rates);
  if (converted === null) {
    return { text: formatMoney(n, from, opts), currency: from, converted: false };
  }
  return {
    text: formatMoney(converted, to, opts),
    currency: to,
    converted: from !== to,
  };
}
