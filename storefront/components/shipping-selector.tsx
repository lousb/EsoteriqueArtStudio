"use client";

import { useId, useState } from "react";
import type { ShippingRegion } from "../data/shipping/defaults";
import s from "./shipping-selector.module.css";

/**
 * "Select a shipping location" dropdown. Picking a region swaps the list for
 * that region's delivery lines. Used on the product page and Shipping page.
 */
export function ShippingSelector({
  label,
  regions,
  defaultOpen = false,
}: {
  label: string;
  regions: ShippingRegion[];
  defaultOpen?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [picked, setPicked] = useState<number | null>(null);

  const region = picked === null ? null : regions[picked];

  return (
    <div className={s.root}>
      <button
        type="button"
        className={s.trigger}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{region ? region.name : label}</span>
        <span className={s.caret} aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <ul id={`${id}-list`} className={s.list}>
          {regions.map((r, i) =>
            picked === i ? null : (
              <li key={r._key ?? r.name}>
                <button
                  type="button"
                  className={s.option}
                  onClick={() => {
                    setPicked(i);
                    setOpen(false);
                  }}
                >
                  {r.name}
                </button>
              </li>
            ),
          )}
        </ul>
      ) : region ? (
        <div className={s.details} aria-live="polite">
          {region.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
