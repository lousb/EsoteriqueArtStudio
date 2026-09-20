import type { Metadata } from "next";
import { sanityFetch } from "../../../data/sanity";
import { SETTINGS_QUERY } from "../../../data/sanity/queries";
import { ContactForm } from "../../../components/contact-form";
import s from "../../../components/info-page.module.css";

export const metadata: Metadata = { title: "Contact" };

type ContactData = {
  email?: string | null;
  phone?: string | null;
  instagramUrl?: string | null;
  instagramHandle?: string | null;
  address?: string | null;
  hours?: { _key?: string; days?: string | null; hours?: string | null }[] | null;
  note?: string | null;
  formEnabled?: boolean | null;
  formSubjects?: string[] | null;
  formIntro?: string | null;
};

const DEFAULT_SUBJECTS = [
  "Order enquiry",
  "Returns and exchanges",
  "Shipping",
  "Product question",
  "Wholesale and press",
  "Something else",
];

function instagramLabel(handle?: string | null, url?: string | null) {
  if (handle) return handle.startsWith("@") ? handle : `@${handle}`;
  if (!url) return null;
  const m = url.match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : "Instagram";
}

export default async function ContactPage() {
  const { data: settings } = await sanityFetch({ query: SETTINGS_QUERY });
  const c = settings?.contact as unknown as ContactData | null | undefined;

  const email = c?.email || null;
  const phone = c?.phone || null;
  const igLabel = instagramLabel(c?.instagramHandle, c?.instagramUrl);
  const igUrl =
    c?.instagramUrl ||
    (c?.instagramHandle
      ? `https://www.instagram.com/${c.instagramHandle.replace(/^@/, "")}`
      : null);
  const address = c?.address || null;
  const hours = (c?.hours ?? []).filter((h) => h?.days && h?.hours);
  const note = c?.note || null;

  const formEnabled = c?.formEnabled !== false;
  const subjects = c?.formSubjects?.filter(Boolean).length
    ? (c.formSubjects as string[])
    : DEFAULT_SUBJECTS;

  const hasDetails = !!(email || phone || igLabel || address || hours.length);

  return (
    <div className={s.page}>
      <div className={s.aside}>
        <h1 className={s.title}>Contact</h1>

        {hasDetails ? (
          <dl className={s.details}>
            {email ? (
              <div className={s.detail}>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${email}`}>{email}</a>
                </dd>
              </div>
            ) : null}

            {phone ? (
              <div className={s.detail}>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
                </dd>
              </div>
            ) : null}

            {igLabel && igUrl ? (
              <div className={s.detail}>
                <dt>Instagram</dt>
                <dd>
                  <a href={igUrl} target="_blank" rel="noopener noreferrer">
                    {igLabel}
                  </a>
                </dd>
              </div>
            ) : null}

            {address ? (
              <div className={s.detail}>
                <dt>Studio</dt>
                <dd>{address}</dd>
              </div>
            ) : null}

            {hours.length ? (
              <div className={s.detail}>
                <dt>Hours</dt>
                <dd className={s.hours}>
                  {hours.map((row) => (
                    <div key={row._key ?? row.days} style={{ display: "contents" }}>
                      <span>{row.days}</span>
                      <span>{row.hours}</span>
                    </div>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {note ? (
          <p className={s.note} style={{ marginTop: 28 }}>
            {note}
          </p>
        ) : null}
      </div>

      <div className={s.contentWide}>
        {formEnabled ? (
          <ContactForm subjects={subjects} intro={c?.formIntro} />
        ) : (
          <p className={s.prose}>
            {email ? (
              <>
                The contact form is not available right now. Please email us at{" "}
                <a href={`mailto:${email}`}>{email}</a>.
              </>
            ) : (
              "The contact form is not available right now."
            )}
          </p>
        )}
      </div>
    </div>
  );
}
