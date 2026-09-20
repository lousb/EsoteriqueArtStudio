import { BASE_CURRENCY, type Rates } from "./currencies";

export type RatesResult = {
  base: string;
  /** Date the rates were published (YYYY-MM-DD), or null for fallback rates */
  date: string | null;
  rates: Rates;
  /** true when the rates came from the live API */
  live: boolean;
};

/**
 * Only used if the live API cannot be reached, so the selector keeps working.
 * These are rough, and flagged as not live.
 */
const FALLBACK_RATES: Rates = {
  USD: 0.65,
  EUR: 0.6,
  GBP: 0.5,
  NZD: 1.08,
  CAD: 0.89,
  JPY: 96,
  SGD: 0.84,
  HKD: 5.05,
  CNY: 4.65,
  CHF: 0.53,
  INR: 55,
  KRW: 900,
};

const API = `https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}`;

/**
 * Live exchange rates from Frankfurter (European Central Bank reference rates,
 * updated each working day). Cached for an hour on the server.
 */
export async function getRates(): Promise<RatesResult> {
  try {
    const res = await fetch(API, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Frankfurter responded ${res.status}`);
    const json = (await res.json()) as {
      base: string;
      date: string;
      rates: Rates;
    };
    if (!json?.rates || typeof json.rates !== "object") {
      throw new Error("Unexpected rates payload");
    }
    return {
      base: BASE_CURRENCY,
      date: json.date,
      rates: { ...json.rates, [BASE_CURRENCY]: 1 },
      live: true,
    };
  } catch (error) {
    console.warn("[currency] using fallback rates:", error);
    return {
      base: BASE_CURRENCY,
      date: null,
      rates: { ...FALLBACK_RATES, [BASE_CURRENCY]: 1 },
      live: false,
    };
  }
}
