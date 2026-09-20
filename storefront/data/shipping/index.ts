import { sanityFetch } from "../sanity";
import { SETTINGS_QUERY } from "../sanity/queries";
import {
  DEFAULT_SHIPPING_LABEL,
  DEFAULT_SHIPPING_REGIONS,
  type ShippingConfig,
} from "./defaults";

/** Delivery regions from Sanity Settings, falling back to the built-in defaults. */
export async function getShipping(): Promise<ShippingConfig> {
  const { data } = await sanityFetch({ query: SETTINGS_QUERY });
  const shipping = (data as unknown as {
    shipping?: {
      selectorLabel?: string | null;
      regions?: { _key?: string; name?: string | null; lines?: (string | null)[] | null }[] | null;
    } | null;
  } | null)?.shipping;

  const regions = (shipping?.regions ?? [])
    .filter((r) => r?.name)
    .map((r) => ({
      _key: r._key,
      name: r.name as string,
      lines: (r.lines ?? []).filter((l): l is string => !!l),
    }));

  return {
    label: shipping?.selectorLabel || DEFAULT_SHIPPING_LABEL,
    regions: regions.length ? regions : DEFAULT_SHIPPING_REGIONS,
  };
}
