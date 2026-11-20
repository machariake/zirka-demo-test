import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PostCard from "@/components/PostCard";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import { getPosts } from "@/lib/cms";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const BLOG_DESCRIPTION =
  "Actionable guides on social media management, SEO, website development, Meta & Google Ads, and AI automation from Zirka Digital Solutions.";

export const metadata: Metadata = pageMeta({
  title: "Blog & Marketing Guides",
  description: BLOG_DESCRIPTION,
  path: "/blog",
  keywords: ["digital marketing blog", "SEO checklist", "social media pricing", "website guide"],
});

export default async function BlogPage() {
  const posts = await getPosts();
  // The blog has no page of its own until there is something on it.
  if (posts.length === 0) notFound();

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: "Blog & Marketing Guides | Zirka Digital Solutions",
          description: BLOG_DESCRIPTION,
          path: "/blog",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <PageHeader
        eyebrow="Blog"
        title="Marketing advice you can use."
        lede="Practical guides on getting found, winning more leads and turning clicks into customers, written by the Zirka team."
      />
      <section>
        <div className="wrap">
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard post={post} key={post.slug} />
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
