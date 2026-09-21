import type { Metadata } from "next";
import { sanityFetch } from "../../data/sanity";
import { ARCHIVE_QUERY, ALL_POSTS_QUERY } from "../../data/sanity/queries";
import { ArchiveGrid } from "../../components/archive-grid.tsx";
import { resolveOpenGraphImage } from "../../sanity/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { data: archive } = await sanityFetch({ query: ARCHIVE_QUERY, stega: false });
  const title = archive?.pageSeo?.title || archive?.title || "Archive";
  const description = archive?.pageSeo?.description || archive?.description || undefined;
  const ogImage = resolveOpenGraphImage(archive?.pageSeo?.ogImage);

  return {
    title,
    description,
    alternates: { canonical: "/archive" },
    openGraph: {
      type: "website",
      url: "/archive",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  } satisfies Metadata;
}

type Post = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  cover?: {
    mediaType: "image" | "video";
    image?: any;
    video?: { playbackId: string; aspectRatio?: string };
  };
};

export default async function Page() {
  const [{ data: archive }, { data: posts }] = await Promise.all([
    sanityFetch({ query: ARCHIVE_QUERY, stega: false }),
    sanityFetch({ query: ALL_POSTS_QUERY, stega: false }),
  ]);

  return (
    <div style={{ paddingTop: "200px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Sticky title column */}
        <div style={{ position: "sticky", top: "2rem" }}>
          {archive?.title && <p style={{ margin: 0 }}>{archive.title}</p>}
          {archive?.description && (
            <p style={{ margin: "0.5rem 0 0", opacity: 0.6, fontSize: "0.85rem" }}>
              {archive.description}
            </p>
          )}
        </div>

        {/* Scrolling grid column */}
        <ArchiveGrid posts={posts as Post[]} />
      </div>
    </div>
  );
}