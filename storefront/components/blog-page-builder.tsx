import { BlogColumnBlock } from "./blog-column-block";
import { BlogContentBlock } from "./blog-content-block";
import { BlogFullwidthBlock } from "./blog-fullwidth-block";

type Block = { _key: string; _type: string; [key: string]: any };

export function BlogPageBuilder({ blocks }: { blocks: Block[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
      {blocks.map((block) => {
        if (block._type === "blogColumnBlock") {
          return <BlogColumnBlock key={block._key} block={block as any} />;
        }
        if (block._type === "blogContentBlock") {
          return <BlogContentBlock key={block._key} block={block as any} />;
        }
        if (block._type === "blogFullwidthBlock") {
          return <BlogFullwidthBlock key={block._key} block={block as any} />;
        }
        return null;
      })}
    </div>
  );
}