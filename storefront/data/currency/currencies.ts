/**
 * Shared currency config (safe to import from server and client code).
 *
 * The store charges in BASE_CURRENCY. Every other currency is display only:
 * prices are converted with live exchange rates so visitors get a sense of
 * the cost, and checkout is always settled in AUD.
 */

export const BASE_CURRENCY = "AUD";
export const CURRENCY_COOKIE = "currency";

export type Rates = Record<string, number>; // units of currency per 1 AUD

export type CurrencyMeta = {
  /** Short region label shown in the selector, e.g. "AUS" for "AUS AUD" */
  region: string;
  /** Full name used for the option tooltip and screen readers */
  name: string;
};

/**
 * Currencies we know how to label. Only currencies that also appear in the
 * live rates response are offered to visitors.
 */
export const CURRENCY_META: Record<string, CurrencyMeta> = {
  AUD: { region: "AUS", name: "Australia" },
  NZD: { region: "NZL", name: "New Zealand" },
  USD: { region: "USA", name: "United States" },
  CAD: { region: "CAN", name: "Canada" },
  GBP: { region: "GBR", name: "United Kingdom" },
  EUR: { region: "EU", name: "Europe" },
  JPY: { region: "JPN", name: "Japan" },
  SGD: { region: "SGP", name: "Singapore" },
  HKD: { region: "HKG", name: "Hong Kong" },
  CNY: { region: "CHN", name: "China" },
  KRW: { region: "KOR", name: "South Korea" },
  INR: { region: "IND", name: "India" },
  CHF: { region: "CHE", name: "Switzerland" },
  SEK: { region: "SWE", name: "Sweden" },
  NOK: { region: "NOR", name: "Norway" },
  DKK: { region: "DNK", name: "Denmark" },
  PLN: { region: "POL", name: "Poland" },
  CZK: { region: "CZE", name: "Czechia" },
  HUF: { region: "HUN", name: "Hungary" },
  RON: { region: "ROU", name: "Romania" },
  BGN: { region: "BGR", name: "Bulgaria" },
  ISK: { region: "ISL", name: "Iceland" },
  TRY: { region: "TUR", name: "Turkey" },
  ILS: { region: "ISR", name: "Israel" },
  ZAR: { region: "ZAF", name: "South Africa" },
  MXN: { region: "MEX", name: "Mexico" },
  BRL: { region: "BRA", name: "Brazil" },
  THB: { region: "THA", name: "Thailand" },
  MYR: { region: "MYS", name: "Malaysia" },
  IDR: { region: "IDN", name: "Indonesia" },
  PHP: { region: "PHL", name: "Philippines" },
};

/** Currencies pinned to the top of the selector, in this order. */
export const PINNED_CURRENCIES = [
  "AUD",
  "USD",
  "EUR",
  "GBP",
  "NZD",
  "CAD",
  "JPY",
  "SGD",
];

export function currencyLabel(code: string): string {
  const meta = CURRENCY_META[code];
  return meta ? `${meta.region} ${code}` : code;
}

/** Sort currency codes: pinned ones first (in order), the rest alphabetically. */
export function sortCurrencies(codes: string[]): string[] {
  const pinned = PINNED_CURRENCIES.filter((c) => codes.includes(c));
  const rest = codes
    .filter((c) => !PINNED_CURRENCIES.includes(c))
    .sort((a, b) => currencyLabel(a).localeCompare(currencyLabel(b)));
  return [...pinned, ...rest];
}
