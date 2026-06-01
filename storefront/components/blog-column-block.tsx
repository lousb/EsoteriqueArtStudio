import { MediaItem } from "./media-item";
import { CustomPortableText } from "./custom-portable-text";
import { PortableTextBlock } from "next-sanity";

type BlogColumn = {
  _key?: string;
  columnType: "media" | "text" | "empty";
  media?: {
    mediaType: "image" | "video";
    image?: any;
    video?: { playbackId: string; aspectRatio?: string };
  };
  text?: PortableTextBlock[];
};

type BlogColumnBlockProps = {
  block: {
    columnCount?: number;
    columns?: BlogColumn[];
  };
};

export function BlogColumnBlock({ block }: BlogColumnBlockProps) {
  const { columns = [], columnCount = 2 } = block;
  const gridSize = Math.min(Math.max(columnCount, 2), 4);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: "1rem",
      }}
    >
      {Array.from({ length: gridSize }).map((_, i) => {
        const col = columns[i];

        if (!col || col.columnType === "empty") {
          return <div key={i} aria-hidden="true" />;
        }

        return (
          <div className="blog-column-block" key={col._key || i} style={{ minWidth: 0 }}>
            {col.columnType === "media" && col.media && (
              <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
                <MediaItem
                  mediaType={col.media.mediaType}
                  image={col.media.image}
                  video={col.media.video}
                  sizes="50vw"
                />
              </div>
            )}
            {col.columnType === "text" && col.text && (
              <CustomPortableText value={col.text} />
            )}
          </div>
        );
      })}
    </div>
  );
}