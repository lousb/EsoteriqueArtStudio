"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BASE_CURRENCY,
  CURRENCY_COOKIE,
  type Rates,
} from "../data/currency/currencies";
import { displayPrice, type PriceOptions } from "../data/currency/convert";

type CurrencyContextValue = {
  /** Currency the visitor has chosen to view prices in */
  currency: string;
  setCurrency: (code: string) => void;
  rates: Rates;
  /** Publish date of the rates, or null when fallback rates are in use */
  ratesDate: string | null;
  /** Convert and format a price quoted in `from` for display */
  format: (
    amount: number | string,
    from: string,
    opts?: PriceOptions,
  ) => { text: string; currency: string; converted: boolean };
  /** True when prices are being shown in something other than the store currency */
  isConverted: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  initialCurrency,
  rates,
  ratesDate,
}: {
  children: ReactNode;
  initialCurrency: string;
  rates: Rates;
  ratesDate: string | null;
}) {
  // Fall back to the store currency if the saved choice has no rate.
  const safeInitial =
    initialCurrency === BASE_CURRENCY || rates[initialCurrency]
      ? initialCurrency
      : BASE_CURRENCY;
  const [currency, setCurrencyState] = useState(safeInitial);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    try {
      document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // cookies unavailable, the choice just lasts for this visit
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      rates,
      ratesDate,
      format: (amount, from, opts) =>
        displayPrice(amount, from, currency, rates, opts),
      isConverted: currency !== BASE_CURRENCY,
    }),
    [currency, setCurrency, rates, ratesDate],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (ctx) return ctx;
  // Outside a provider (should not happen), behave as the store currency.
  return {
    currency: BASE_CURRENCY,
    setCurrency: () => {},
    rates: { [BASE_CURRENCY]: 1 },
    ratesDate: null,
    format: (amount, from, opts) => displayPrice(amount, from, from, {}, opts),
    isConverted: false,
  };
}
