import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Header from "@/components/Header";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import PostCard, { formatPostDate } from "@/components/PostCard";
import { ArrowIcon } from "@/components/Icons";
import { getPost, getPostSitemap, getPosts } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPostSitemap();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  const meta = pageMeta({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    ...(post.heroImage ? { image: post.heroImage } : {}),
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: post.publishedAt, modifiedTime: post.updatedAt },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const more = (await getPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <div className="page-header">
        <div className="wrap">
          <Header />
          <div className="page-header-inner post-header">
            <Link className="case-back" href="/blog">
              <ArrowIcon /> All posts
            </Link>
            <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
              {post.topic || "Blog"}
            </span>
            <h1>{post.title}</h1>
            <p className="post-byline">
              {post.author ? `By ${post.author} · ` : ""}
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            </p>
          </div>
        </div>
      </div>

      <section className="section--flow article-section">
        <div className="wrap">
          <article className="article">
            {post.heroImage && (
              <div className="article__cover">
                <Image src={post.heroImage} alt={post.alt} fill priority sizes="(max-width: 800px) 100vw, 760px" />
              </div>
            )}
            <p className="article__lede">{post.excerpt}</p>
            {post.content ? (
              <RichText className="article__body prose" data={post.content} />
            ) : (
              <div className="article__body prose">
                {(post.sections ?? []).map((section) => (
                  <section key={section.heading}>
                    <h2>{section.heading}</h2>
                    {section.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul>
                        {section.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            )}
          </article>

          {more.length > 0 && (
            <div className="article-more">
              <h2 className="index-heading">More from the blog</h2>
              <div className="post-grid">
                {more.map((p) => (
                  <PostCard post={p} key={p.slug} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
