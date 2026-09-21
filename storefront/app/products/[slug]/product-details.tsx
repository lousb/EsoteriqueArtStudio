import { Link } from "next-view-transitions";
import Price from "../../../components/price";
import { Product } from "../../../shopify/types";
import { AddToCart } from "../../_cart/add-to-cart";
import { ShippingSelector } from "../../../components/shipping-selector";
import type { ShippingConfig } from "../../../data/shipping/defaults";
import s from "./product-details.module.css";
import { ProductImage } from "./product-image";

/**
 * Ask Shopify's CDN for a right-sized copy of the image. Next's optimiser is
 * switched off in this project, so without this the browser shrinks a full
 * size photo down to a 100px thumbnail itself, which looks jagged and soft.
 */
function sizedImage<T extends { url: string }>(image: T, width: number): T {
  try {
    const u = new URL(image.url);
    if (u.hostname === "cdn.shopify.com") {
      u.searchParams.set("width", String(width));
      return { ...image, url: u.toString() };
    }
  } catch {
    // leave the image as it is
  }
  return image;
}

function AfterpayIcon() {
  return (
    <svg
      className={s.afterpay}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 103 65"
      fill="none"
      role="img"
      aria-label="Afterpay"
    >
      <path
        d="M94.8686 0H8.13159C3.52367 0 0 3.48698 0 8.04687V56.3282C0 60.8881 3.79473 64.3751 8.13159 64.3751H94.8686C99.4761 64.3751 103 60.8881 103 56.3282V8.04687C103 3.48698 99.2053 0 94.8686 0Z"
        fill="#DBDBDB"
      />
      <path
        d="M74.265 18.2388L66.9464 13.9472L59.6278 9.65552C54.7491 6.97322 48.515 10.4602 48.515 16.093V17.1659C48.515 17.7024 48.7858 18.2388 49.3278 18.5071L52.8517 20.3847C53.9358 20.9211 55.0203 20.1164 55.0203 19.0435V16.8977C55.0203 15.8248 56.1044 15.0201 57.1885 15.5566L63.965 19.3118L70.4703 23.3352C71.5544 23.8717 71.5544 25.2128 70.4703 25.7493L63.6938 29.5045L56.9177 33.7961C55.8332 34.3326 54.7491 33.5279 54.7491 32.455V31.3821C54.7491 25.7493 48.515 22.2623 43.6358 24.9446L36.3175 29.2362L28.999 33.5279C24.1201 36.2102 24.1201 43.4523 28.999 46.1346L36.3175 50.4263L43.6358 54.718C48.515 57.4002 54.7491 53.9133 54.7491 48.2805V47.2075C54.7491 46.6711 54.4778 46.1346 53.9358 45.8664L50.4124 43.9888C49.3278 43.4523 48.2438 44.257 48.2438 45.3299V47.4758C48.2438 48.5487 47.1597 49.3534 46.0752 48.8169L39.2991 45.0617L32.5228 41.0383C31.4386 40.5019 31.4386 39.1607 32.5228 38.6243L39.2991 34.869L46.0752 31.1138C47.1597 30.5774 48.2438 31.3821 48.2438 32.455V33.5279C48.2438 39.1607 54.4778 42.6476 59.357 39.9654L66.6752 35.6737L73.9938 31.3821C79.1438 28.1633 79.1438 21.1894 74.265 18.2388Z"
        fill="black"
      />
    </svg>
  );
}

export function ProductDetails({
  product,
  colourway,
  excerpt,
  relatedProducts,
  shipping,
}: {
  product: Product;
  colourway?: string | null;
  excerpt?: string | null;
  relatedProducts: Product[];
  shipping: ShippingConfig;
}) {
  const { minVariantPrice } = product.priceRange;

  return (
    <div className={s.details}>
      <div className={s.titleBlock}>
        <h1 className={s.title}>{product.title}</h1>
        {colourway ? <p className={s.colourway}>{colourway}</p> : null}
      </div>

      {/* On mobile this button is pinned to the bottom of the screen instead */}
      <div className={s.cart}>
        <AddToCart product={product} />
      </div>

      <div className={s.priceBlock}>
        <p>
          <Price
            amount={minVariantPrice.amount}
            currencyCode={minVariantPrice.currencyCode}
            showCode
          />
        </p>
        <p className={s.payLater}>
          Or Pay Later with <AfterpayIcon />
        </p>
      </div>

      {excerpt ? <p className={s.excerpt}>{excerpt}</p> : null}

      <section className={`${s.section} ${s.shipping}`}>
        <h2 className={s.heading}>Shipping</h2>
        <p className={s.copy}>
          We aim to dispatch orders within 1-2 business days. All orders are
          sent from our warehouse in Sydney, Australia.
        </p>
        <ShippingSelector label={shipping.label} regions={shipping.regions} />
      </section>

      <section className={`${s.section} ${s.info}`}>
        <h2 className={s.heading}>Details</h2>
        {product.descriptionHtml ? (
          <div
            className={s.copy}
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : null}
        <Link href="/our-process" className={s.link}>
          <span className={s.underline}>Our Process</span>
        </Link>
      </section>

      <Link href="/pages/returns" className={`${s.link} ${s.returns}`}>
        <span className={s.underline}>Returns Policy</span>
      </Link>

      {relatedProducts.length > 0 && (
        <section className={`${s.section} ${s.related}`}>
          <h2 className={s.heading}>Recommended Products</h2>
          <div className={s.thumbs}>
            {relatedProducts.slice(0, 3).map((related) => (
              <Link
                key={related.handle}
                href={`/products/${related.handle}`}
                prefetch={true}
                className={s.thumb}
                aria-label={related.title}
              >
                <ProductImage
                  shopifyImage={sizedImage(related.featuredImage, 480)}
                  objectFit="cover"
                  sizes="(min-width: 768px) 12vw, 30vw"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
