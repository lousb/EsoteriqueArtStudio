import { MediaItem } from "./media-item";

type BlogFullwidthBlockProps = {
  block: {
    media?: {
      mediaType: "image" | "video";
      image?: any;
      video?: { playbackId: string; aspectRatio?: string };
    };
    caption?: string;
  };
};

export function BlogFullwidthBlock({ block }: BlogFullwidthBlockProps) {
  if (!block.media) return null;

  return (
    <div className="blog-fullwidth-block" style={{ width: "100%" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
        <MediaItem
          mediaType={block.media.mediaType}
          image={block.media.image}
          video={block.media.video}
          sizes="100vw"
          priority
        />
      </div>
      {block.caption && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", opacity: 0.5 }}>
          {block.caption}
        </p>
      )}
    </div>
  );
}