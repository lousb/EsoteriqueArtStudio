"use client";

import { useCurrency } from "./currency-provider";

/**
 * Renders a price in the visitor's chosen display currency.
 * `amount` and `currencyCode` describe the price as stored (the store currency).
 *
 * With `showCode` the price reads like "$249 AUD" (whole amounts lose the
 * decimals), as used on the product page.
 */
export default function Price({
  amount,
  currencyCode,
  showCode = false,
}: {
  amount: string;
  currencyCode: string;
  showCode?: boolean;
}) {
  const { format } = useCurrency();
  const { text, currency } = format(amount, currencyCode, { withCode: showCode });

  return (
    <>
      {text}
      {showCode ? null : (
        <>
          {" "}
          <span className="sr-only">{currency}</span>
        </>
      )}
    </>
  );
}
