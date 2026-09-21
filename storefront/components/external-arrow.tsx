/**
 * Small "opens in a new tab" arrow. Drawn as a thin line, not a text character,
 * so it never falls back to another font and always matches the text colour.
 */
export function ExternalArrow() {
  return (
    <svg
      viewBox="0 0 8 8"
      width="0.6em"
      height="0.6em"
      aria-hidden="true"
      focusable="false"
      style={{
        display: "inline-block",
        marginLeft: "0.4em",
        verticalAlign: "0.05em",
      }}
    >
      <path
        d="M1 7L7 1M2.2 1H7V5.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="square"
      />
    </svg>
  );
}
