/**
 * Default copy for the Customer Service pages.
 *
 * These are used in two places:
 *  1. As a fallback on the storefront when a matching `policyPage` document
 *     does not exist in Sanity yet.
 *  2. By `studio/scripts/seed-policy-pages.ts` to create the editable
 *     documents in Sanity.
 *
 * Once a document exists in Sanity, the Sanity version always wins.
 *
 * Inline syntax supported in strings: **bold** and [label](href).
 * A block that is an array of strings renders as a bullet list.
 */

export type PolicyBlock = string | string[];

export type PolicySection = {
  heading?: string;
  blocks: PolicyBlock[];
};

export type PolicyDefault = {
  title: string;
  slug: string;
  section: "pages" | "policies";
  lastUpdated: string;
  intro?: string;
  sections: PolicySection[];
};

const UPDATED = "2026-09-21";

export const POLICY_DEFAULTS: PolicyDefault[] = [
  {
    title: "Shipping & Taxes",
    slug: "shipping-taxes",
    section: "pages",
    lastUpdated: UPDATED,
    intro:
      "Every piece is finished and sent from our studio in Sydney. Pick your region above to see what delivery costs and how long it takes. Prices are shown in the currency listed for each region.",
    sections: [
      {
        heading: "Duties and taxes",
        blocks: [
          "Prices for Australian orders include GST.",
          "For the United States, United Kingdom and Europe, duties and VAT are included in the delivery price you see, so there is nothing more to pay when your parcel arrives.",
          "For every other destination, import duties, taxes and customs fees are set by the destination country. Where they apply, they are payable by the recipient on delivery, and we cannot predict them in advance.",
        ],
      },
      {
        heading: "Dispatch",
        blocks: [
          "Orders placed on a working day, Monday to Friday, leave the studio within one working day. Orders placed over the weekend or late on a Friday are packed and sent on Monday. You will receive a tracking link by email as soon as your parcel is on its way.",
          "Some pieces are made to order or offered as pre-orders. When that is the case, it is clearly marked on the product page before you buy, along with the expected dispatch time.",
        ],
      },
      {
        heading: "Questions about delivery",
        blocks: [
          "If something looks off with your delivery, or you would like to check on an order, please reach out through our [contact page](/pages/contact) and we will help.",
        ],
      },
    ],
  },
  {
    title: "Returns",
    slug: "returns",
    section: "pages",
    lastUpdated: UPDATED,
    intro:
      "We want you to love what you receive. If a piece is not quite right, this is how to send it back.",
    sections: [
      {
        heading: "Starting a return",
        blocks: [
          [
            "Get in touch through our [contact page](/pages/contact) within 14 days of your parcel arriving. Choose the subject Returns and exchanges, and include your order number.",
            "We will reply with return instructions and the address to send your piece to.",
            "Pack the piece in its original packaging, unworn and unused, and send it back to us. Please keep your postage receipt until we confirm it has arrived.",
          ],
        ],
      },
      {
        heading: "Your options",
        blocks: [
          "**Refund to your original payment method.** Available for orders delivered within Australia and New Zealand. Refunds are processed within 5 to 7 business days of us receiving your return.",
          "**Store credit worth 105%.** Choose store credit and we will add an extra 5% to the value of your return. It is emailed to you within 2 to 3 business days, never expires, and can be used on anything in the shop. Store credit is available for orders from every region, and is the return option for orders outside Australia and New Zealand.",
        ],
      },
      {
        heading: "Faulty or damaged pieces",
        blocks: [
          "If your piece arrives damaged or develops a fault, contact us as soon as you can with a few photos and we will repair it, replace it or refund it. Nothing on this page limits your rights under the Australian Consumer Law.",
        ],
      },
    ],
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    section: "policies",
    lastUpdated: UPDATED,
    intro:
      "This policy explains what personal information Esoterique Art Studio collects when you visit or buy from this site, and what we do with it. We handle personal information in line with the Privacy Act 1988 (Cth).",
    sections: [
      {
        heading: "What we collect",
        blocks: [
          "When you visit the site, we automatically collect some technical details about your device. This includes your browser type, IP address, time zone and some of the cookies stored on your device, gathered through cookies, log files and similar tools. As you browse, we also record which pages and products you look at and how you arrived.",
          "When you place an order, or try to, we collect the details needed to complete it. This includes your name, billing and shipping addresses, payment details, email address and phone number.",
          "If you write to us through the contact form, we keep the name, email address and message you send so we can reply.",
        ],
      },
      {
        heading: "How we use it",
        blocks: [
          "Order details are used to fulfil your purchase. That means processing payment, arranging delivery, sending confirmations and keeping in touch about your order. We also use them to screen orders for fraud and, where you have agreed, to send you news and offers.",
          "Device details help us spot possible fraud, keep the site running well, and understand how visitors use it so we can improve it.",
        ],
      },
      {
        heading: "Who we share it with",
        blocks: [
          "We only share information with the services that help us run the shop:",
          [
            "**Shopify**, which powers our store, checkout and payments.",
            "**Vercel**, which hosts this site and provides privacy-friendly traffic analytics.",
            "**Klaviyo**, which sends our newsletter to people who have signed up.",
          ],
          "We may also disclose personal information when the law requires it, or to respond to a valid legal request.",
        ],
      },
      {
        heading: "Advertising",
        blocks: [
          "We may use information collected on the site to show you relevant advertising elsewhere. You can opt out of personalised advertising through the settings of the platform showing the ad, such as your Facebook and Google ad preferences, or through the Digital Advertising Alliance opt-out page.",
        ],
      },
      {
        heading: "Do Not Track",
        blocks: [
          "Our site does not change how it collects or uses information when your browser sends a Do Not Track signal.",
        ],
      },
      {
        heading: "How long we keep it",
        blocks: [
          "We keep order information for our records unless you ask us to delete it. If you would like your information removed, tell us and we will do so, except where we are required by law to keep it.",
        ],
      },
      {
        heading: "Changes to this policy",
        blocks: [
          "We may update this policy from time to time to reflect changes in our practices or for legal and regulatory reasons. The date at the top of this page shows when it was last revised.",
        ],
      },
      {
        heading: "Contact us",
        blocks: [
          "For questions, access requests or complaints about how we handle your information, please use our [contact page](/pages/contact).",
        ],
      },
    ],
  },
  {
    title: "Terms of Service",
    slug: "terms-of-service",
    section: "policies",
    lastUpdated: UPDATED,
    intro:
      "These terms apply to your use of this website and to anything you buy from Esoterique Art Studio. By using the site, you agree to them.",
    sections: [
      {
        heading: "1. Accepting these terms",
        blocks: [
          "Esoterique Art Studio provides this site and its services on the condition that you follow these terms. We may change them at any time, and the updated version applies from the moment it is posted. Please check back now and then.",
        ],
      },
      {
        heading: "2. How you use the site",
        blocks: [
          "You agree to use the site in line with all applicable laws and regulations. If these terms are broken, we may suspend or close your account, membership or access straight away and without notice.",
        ],
      },
      {
        heading: "3. Links to other sites",
        blocks: [
          "Our site may link to websites and materials run by other people. We do not control them and are not responsible for what they say, whether they respect copyright, or whether they are lawful or suitable.",
        ],
      },
      {
        heading: "4. Intellectual property",
        blocks: [
          "Everything on this site, including the text, graphics, logos, icons and photography, belongs to Esoterique Art Studio and is protected by copyright and trademark law. You may use it only as we expressly allow. Copying, changing or distributing it needs our written permission first.",
        ],
      },
      {
        heading: "5. Warranties and availability",
        blocks: [
          "The site, its content and our services are provided as they are, without warranties of any kind. We are not responsible for technical faults, inaccuracies, typographical errors, price changes or short interruptions to the service. Nothing in these terms excludes rights you have under the Australian Consumer Law that cannot be excluded.",
        ],
      },
      {
        heading: "6. Your information",
        blocks: [
          "We keep your account details confidential and do not share them outside the services that run our shop. Orders are handled through Shopify's secure, encrypted checkout, and the information collected is used only for your shopping with us. Our [Privacy Policy](/policies/privacy-policy) explains more.",
        ],
      },
      {
        heading: "7. International duties and customs",
        blocks: [
          "For parcels sent outside Australia, any customs charges and import duties are the responsibility of the recipient at delivery. These rules differ from country to country and we cannot predict what may be due, so we accept no liability for them.",
        ],
      },
      {
        heading: "8. Personal use only",
        blocks: [
          "Our pieces are for personal use and not for resale. This includes printing or applying artwork to our blank items in order to sell them on.",
        ],
      },
      {
        heading: "9. Governing law and contact",
        blocks: [
          "These terms are governed by the laws of New South Wales, Australia. If you have a question about them, please reach us through our [contact page](/pages/contact).",
        ],
      },
    ],
  },
];

export function getPolicyDefault(
  section: "pages" | "policies",
  slug: string,
): PolicyDefault | undefined {
  return POLICY_DEFAULTS.find((p) => p.section === section && p.slug === slug);
}

/* ---------------------------- Portable Text ---------------------------- */

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: "link"; _key: string; linkType: "href"; href: string };
type PtBlock = {
  _type: "block";
  _key: string;
  style: "normal" | "h2";
  children: Span[];
  markDefs: MarkDef[];
  listItem?: "bullet";
  level?: number;
};

function parseInline(text: string, keyBase: string) {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  const push = (t: string, marks: string[] = []) => {
    if (!t) return;
    children.push({ _type: "span", _key: `${keyBase}s${i++}`, text: t, marks });
  };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      push(m[1], ["strong"]);
    } else {
      const key = `${keyBase}l${markDefs.length}`;
      markDefs.push({ _type: "link", _key: key, linkType: "href", href: m[3] });
      push(m[2], [key]);
    }
    last = m.index + m[0].length;
  }
  push(text.slice(last));
  if (children.length === 0) push("");
  return { children, markDefs };
}

export function policyToPortableText(def: PolicyDefault): PtBlock[] {
  const out: PtBlock[] = [];
  let n = 0;
  const add = (
    text: string,
    style: "normal" | "h2",
    list?: boolean,
  ): void => {
    const key = `b${n++}`;
    const { children, markDefs } = parseInline(text, key);
    const block: PtBlock = { _type: "block", _key: key, style, children, markDefs };
    if (list) {
      block.listItem = "bullet";
      block.level = 1;
    }
    out.push(block);
  };

  if (def.intro) add(def.intro, "normal");
  for (const section of def.sections) {
    if (section.heading) add(section.heading, "h2");
    for (const block of section.blocks) {
      if (Array.isArray(block)) block.forEach((t) => add(t, "normal", true));
      else add(block, "normal");
    }
  }
  return out;
}
