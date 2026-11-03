import { getCollection, type CollectionEntry } from "astro:content";
import { siteConfig } from "../../site.config";
import { isReleased } from "./dates";
import { publishKey, selectWithinDailyCap } from "./publish-due";

export type PostEntry = CollectionEntry<"posts">;

export function publishDate(post: PostEntry): string {
  return post.data.publishAt ?? post.data.date;
}

export async function allEntries(): Promise<PostEntry[]> {
  return getCollection("posts");
}

export async function allPublished(): Promise<PostEntry[]> {
  const posts = await getCollection("posts");
  const released = posts.filter((post) => !post.data.draft && isReleased(publishDate(post)));
  const visible = selectWithinDailyCap(
    released.map((post) => ({ id: post.id, at: publishKey(publishDate(post)), post })),
    siteConfig.maxPostsPerDay,
  );
  return visible
    .map((item) => item.post)
    .sort((a, b) => publishDate(b).localeCompare(publishDate(a)) || b.data.date.localeCompare(a.data.date));
}

export function postPath(id: string): string {
  return `/${id}/`;
}

export function categoryPath(id: string): string {
  return `/category/${id}/`;
}

export function hubPath(id: string): string {
  return `/hub/${id}/`;
}

export function readingMinutes(text: string): number {
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 500));
}

export function relatedPosts(post: PostEntry, posts: PostEntry[]): PostEntry[] {
  const pinned = new Set(post.data.related_article_ids);
  return posts
    .filter((item) => item.id !== post.id)
    .map((item) => {
      const sameCategory = item.data.category === post.data.category ? 3 : 0;
      const sharedTags = item.data.tags.filter((tag) => post.data.tags.includes(tag)).length;
      const sharedHubs = item.data.hubs.filter((hub) => post.data.hubs.includes(hub)).length;
      const explicit = pinned.has(item.id) || pinned.has(item.data.article_id) ? 5 : 0;
      return { item, score: sameCategory + sharedTags + sharedHubs + explicit };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || publishDate(b.item).localeCompare(publishDate(a.item)))
    .slice(0, 3)
    .map((row) => row.item);
}

export function neighbors(post: PostEntry, posts: PostEntry[]): { prev?: PostEntry; next?: PostEntry } {
  const index = posts.findIndex((item) => item.id === post.id);
  if (index < 0) return {};
  return {
    next: posts[index - 1],
    prev: posts[index + 1],
  };
}

export function authorName(post: PostEntry): string {
  return post.data.author ?? siteConfig.author.name;
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / siteConfig.postsPerPage));
}

export function cardExcerpt(text: string, max = 42): string {
  const chars = [...text.trim()];
  if (chars.length <= max) return chars.join("");
  return `${chars.slice(0, max).join("")}…`;
}
