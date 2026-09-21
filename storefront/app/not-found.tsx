import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import s from "./not-found.module.css";

// A 404 is never something to send to Google, so it stays out of the index
// while still returning a normal, on-brand page to the visitor.
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className={s.wrap}>
      <div className={s.box}>
        <span className={s.code}>404</span>
        <p>This page doesn&apos;t exist</p>
      </div>
      <Link href="/products" className={s.link}>
        Continue shopping
      </Link>
    </div>
  );
}
