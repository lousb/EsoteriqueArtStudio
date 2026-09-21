/**
 * Default delivery options, used until the Shipping section of the Settings
 * document in Sanity is filled in. Once regions exist in Sanity they always win.
 *
 * Each region is a name plus a few short lines, shown under the selector on
 * the product page and on the Shipping & Taxes page.
 */

export type ShippingRegion = {
  _key?: string;
  name: string;
  lines: string[];
};

export type ShippingConfig = {
  label: string;
  regions: ShippingRegion[];
};

export const DEFAULT_SHIPPING_LABEL = "Select a shipping location";

export const DEFAULT_SHIPPING_REGIONS: ShippingRegion[] = [
  {
    name: "Australia",
    lines: [
      "Free delivery on every order",
      "Standard post, 3 to 7 working days, free",
      "Express post, 1 to 3 working days, $9 (free with 2 or more pieces)",
    ],
  },
  {
    name: "United States",
    lines: [
      "AUD $23",
      "DHL Express, duties covered (4 to 7 working days)",
      "Nothing further to pay on arrival",
    ],
  },
  {
    name: "United Kingdom",
    lines: [
      "AUD $19",
      "DHL Express (4 to 8 working days)",
      "VAT and duties included",
    ],
  },
  {
    name: "Europe",
    lines: [
      "AUD $25",
      "DHL Express (4 to 9 working days)",
      "VAT and duties included",
    ],
  },
  {
    name: "Asia",
    lines: ["AUD $35", "Express post (5 to 9 working days)"],
  },
  {
    name: "Canada",
    lines: ["AUD $19", "Express post (5 to 9 working days)"],
  },
  {
    name: "Rest of the World",
    lines: [
      "Options and prices are shown at checkout",
      "Standard post (7 to 14 working days)",
    ],
  },
];
