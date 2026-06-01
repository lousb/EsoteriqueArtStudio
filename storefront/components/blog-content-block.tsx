import { CustomPortableText } from "./custom-portable-text";
import { PortableTextBlock } from "next-sanity";

type BlogContentBlockProps = {
  block: {
    content?: PortableTextBlock[];
  };
};

export function BlogContentBlock({ block }: BlogContentBlockProps) {
  if (!block.content) return null;
  return (
    <div className="blog-content-block" style={{ maxWidth: "65ch", margin: "0 auto" }}>
      <CustomPortableText value={block.content} />
    </div>
  );
}