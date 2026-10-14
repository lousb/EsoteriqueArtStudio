"use client";

import { useEffect, useState } from "react";
import { EXPRESS_HOLD_MINUTES } from "../../data/cart/config";

const STORAGE_KEY = "esoterique-express-hold";
const HOLD_MS = EXPRESS_HOLD_MINUTES * 60 * 1000;

export type ExpressHold = {
  /** Milliseconds left on the hold, 0 once it has ended (or not started). */
  remaining: number;
  /** The hold is running right now, so checkout gets free Express. */
  active: boolean;
  /** The hold ran out for this cart. */
  expired: boolean;
};

function readStart(): number | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) || null : null;
  } catch {
    return null;
  }
}

function writeStart(value: number | null) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Storage blocked: the hold still runs for this page view.
  }
}

/**
 * Starts a real 5 minute hold the first time the cart qualifies for free
 * Express. The start time is saved, so refreshing or closing the cart doesn't
 * restart it. It only resets once the cart is emptied.
 */
export function useExpressHold(qualified: boolean, isEmpty: boolean): ExpressHold {
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setStart(readStart());
  }, []);

  useEffect(() => {
    if (isEmpty && start !== null) {
      writeStart(null);
      setStart(null);
    } else if (qualified && start === null) {
      const t = Date.now();
      writeStart(t);
      setStart(t);
    }
  }, [qualified, isEmpty, start]);

  const remaining = start === null ? 0 : Math.max(0, start + HOLD_MS - now);

  useEffect(() => {
    if (start === null || remaining === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [start, remaining === 0]);

  return {
    remaining,
    active: qualified && remaining > 0,
    expired: start !== null && remaining === 0,
  };
}

export function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const sec = String(total % 60).padStart(2, "0");
  return `${m}:${sec}`;
}
