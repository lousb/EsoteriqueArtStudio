"use client";

import { useMemo } from "react";
import {
  BASE_CURRENCY,
  CURRENCY_META,
  currencyLabel,
  sortCurrencies,
} from "../data/currency/currencies";
import { useCurrency } from "./currency-provider";
import s from "./site-footer.module.css";

function formatRatesDate(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

export function CurrencySelect() {
  const { currency, setCurrency, rates, ratesDate, isConverted } =
    useCurrency();

  const codes = useMemo(
    () =>
      sortCurrencies(
        Array.from(new Set([BASE_CURRENCY, ...Object.keys(rates)])).filter(
          (c) => c === BASE_CURRENCY || rates[c] > 0,
        ),
      ),
    [rates],
  );

  const updated = formatRatesDate(ratesDate);

  return (
    <div className={s.currency}>
      <label className={s.selectWrap}>
        <span className="sr-only">Choose the currency prices are shown in</span>
        <select
          className={s.select}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label="Country or region and currency"
        >
          {codes.map((code) => (
            <option
              key={code}
              value={code}
              title={CURRENCY_META[code]?.name}
            >
              {currencyLabel(code)}
            </option>
          ))}
        </select>
        <span className={s.caret} aria-hidden="true">
          ↓
        </span>
      </label>
      <p className={s.currencyNote}>
        {isConverted
          ? `Prices are approximate${updated ? `, rates updated ${updated}` : ""}. Checkout is charged in ${BASE_CURRENCY}.`
          : `Prices are shown in ${BASE_CURRENCY}. Other currencies are for reference only.`}
      </p>
    </div>
  );
}
