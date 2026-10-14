/**
 * Number of items in the cart that unlocks free Express post.
 * The Shopify Express rate is set to free at the matching order weight,
 * so change both together.
 */
export const FREE_EXPRESS_ITEMS = 2;

/**
 * Once the cart qualifies for free Express, the offer is held for this many
 * minutes. Checking out inside the window adds EXPRESS_DISCOUNT_CODE to the
 * checkout, which is what makes Express free in Shopify. After the window the
 * code is not added and Express is charged as normal.
 */
export const EXPRESS_HOLD_MINUTES = 5;

/** Shopify free shipping discount code applied while the hold is running. */
export const EXPRESS_DISCOUNT_CODE = "EXPRESSONUS";
