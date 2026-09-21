import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "../../../data/sanity";
import { POST_QUERY, ALL_POST_SLUGS } from "../../../data/sanity/queries";
import { BlogPageBuilder } from "../../../components/blog-page-builder";
import { MediaItem } from "../../../components/media-item";
import { resolveOpenGraphImage } from "../../../sanity/utils";
import { toPlainText } from "../../../data/seo";
import { blogPostingJsonLd } from "../../../data/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { data: post } = await sanityFetch({ query: POST_QUERY, params, stega: false });
  if (!post?._id) return {};

  const title = post.pageSeo?.title || post.title;
  const description = post.pageSeo?.description || toPlainText(post.excerpt);
  const ogImage = resolveOpenGraphImage(post.pageSeo?.ogImage || post.cover?.image);
  const path = `/archive/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      publishedTime: post.date || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage.url] : undefined,
    },
  } satisfies Metadata;
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_POST_SLUGS,
    perspective: "published",
    stega: false,
  });
  return data ?? [];
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params,
  });

  if (!post?._id) return notFound();

  const postLd = blogPostingJsonLd({
    headline: post.title,
    description: toPlainText(post.excerpt),
    path: `/archive/${params.slug}`,
    datePublished: post.date,
  });

  return (
    <div className="blog-post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postLd) }}
      />
      {/* Header */}
      <div style={{ marginBottom: "4rem" }}>
        
        <h1 style={{ margin: "0 0 1rem" }}>{post.title}</h1>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", opacity: 0.5 }}>
          {new Date(post.date).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })} 
        </p>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", opacity: 0.5 }}>
         (SCROLL)
        </p>
      </div>

      {/* Cover */}
      {post.cover && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", marginBottom: "3rem" }}>
          <MediaItem
            mediaType={post.cover.mediaType}
            image={post.cover.image}
            video={post.cover.video}
            sizes="100vw"
            priority
          />
        </div>
      )}
      {post.excerpt && (
          <p style={{ margin: 0, opacity: 0.6 }}>{post.excerpt}</p>
        )}

      {/* Page builder */}
      {post.pageBuilder?.length > 0 && (
        <BlogPageBuilder blocks={post.pageBuilder} />
      )}
    </div>
  );
}