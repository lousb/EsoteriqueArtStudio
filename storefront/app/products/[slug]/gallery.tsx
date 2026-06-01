import NextImage from "next/image";
import { MediaItem } from "../../../components/media-item";
import { Image } from "../../../shopify/types";

type SanityGalleryItem = {
  mediaType: "image" | "video" | null;
  image?: any;
  video?: { playbackId: string; aspectRatio?: string } | null;
  featuredHover?: boolean;
};

export function Gallery({
  featuredImage,
  sanityGallery = [],
}: {
  variants?: any[];
  featuredImage: Image;
  sanityGallery?: SanityGalleryItem[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Shopify featured image */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", backgroundColor: "#f1f1f1"  }}>
        <NextImage
          src={featuredImage.url}
          fill
          alt={featuredImage.altText ?? ""}
          style={{ objectFit: "cover", mixBlendMode: "multiply" }}
          sizes="50vw"
          priority
        />
      </div>

      {/* Sanity gallery items */}
      {sanityGallery.map((item, i) => (
      <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
        {item.mediaType && (
          <MediaItem
            mediaType={item.mediaType}
            image={item.image}
            video={item.video ?? undefined}
            sizes="50vw"
          />
        )}
      </div>
    ))}
    </div>
  );
}