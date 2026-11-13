import type { APIContext } from "astro";
import { siteConfig, absoluteUrl } from "../../site.config";
import { allPublished, postPath } from "../lib/posts";

export async function GET(_context: APIContext) {
  const posts = await allPublished();
  const staticPages = ["/", "/about/", "/sources/", "/privacy/", "/terms/", "/contact/", "/archive/"];
  const urls = [
    ...staticPages.map((path) => ({ loc: absoluteUrl(path), lastmod: siteConfig.legalUpdated })),
    // 발행 글이 있는 목록만 넣습니다. 빈 목록은 noindex 이고, 글이 생기면 자동으로 들어갑니다.
    ...(posts.some((post) => post.data.category === "flowers" || post.data.category === "plants")
      ? [{ loc: absoluteUrl("/flowers-plants/"), lastmod: siteConfig.legalUpdated }]
      : []),
    ...siteConfig.categories
      .filter((category) => posts.some((post) => post.data.category === category.id))
      .map((category) => ({ loc: absoluteUrl(`/category/${category.id}/`), lastmod: siteConfig.legalUpdated })),
    ...siteConfig.hubs
      .filter((hub) => posts.some((post) => post.data.hubs.includes(hub.id)))
      .map((hub) => ({ loc: absoluteUrl(`/hub/${hub.id}/`), lastmod: siteConfig.legalUpdated })),
    ...posts.map((post) => ({ loc: absoluteUrl(postPath(post.id)), lastmod: post.data.updated })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url.loc}</loc><lastmod>${url.lastmod}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
