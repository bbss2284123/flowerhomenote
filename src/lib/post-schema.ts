import { z } from "astro/zod";
import { siteConfig } from "../../site.config";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD");
const categoryIds = siteConfig.categories.map((c) => c.id) as [string, ...string[]];
const hubIds = siteConfig.hubs.map((hub) => hub.id) as [string, ...string[]];

export const templates = ["A", "B", "C", "D"] as const;
export const templateNames: Record<(typeof templates)[number], string> = {
  A: "꽃·식물 관리",
  B: "살림·청소",
  C: "반려동물 생활",
  D: "계절 가이드",
};
export const sourceTypes = ["original-photo", "licensed", "illustration", "ai_generated"] as const;
export const riskLevels = ["low", "medium", "high"] as const;
export const reviewStatuses = ["draft", "needs-review", "approved", "published"] as const;

export const postImageSchema = z
  .object({
    path: z.string().regex(/^\//, "이미지 경로는 /로 시작"),
    alt: z.string().refine((value) => value.trim().length >= 4, "alt는 4자 이상"),
    caption: z.string().optional(),
    source_type: z.enum(sourceTypes),
    /** 직접 촬영(original-photo)이 아니면 필수 */
    license_proof: z.string().optional(),
    role: z.enum(["hero", "inline", "before-after"]).optional(),
  })
  .strict()
  .superRefine((image, ctx) => {
    if (image.source_type !== "original-photo" && !image.license_proof?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "직접 촬영이 아니면 license_proof가 필요합니다.",
      });
    }
    if ((image.source_type === "illustration" || image.source_type === "ai_generated") && /실제\s*(사진|촬영)|직접\s*촬영/.test(`${image.alt}\n${image.caption ?? ""}`)) {
      ctx.addIssue({
        code: "custom",
        message: "장식 이미지를 실제 촬영이라고 적지 않습니다.",
      });
    }
  });

export const postSchema = z
  .object({
    title: z.string().min(8),
    description: z.string().min(40).max(180),
    date: dateString,
    updated: dateString,
    publishAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, "publishAt은 날짜 또는 날짜와 시각").optional(),
    draft: z.boolean(),
    category: z.enum(categoryIds),
    tags: z.array(z.string().min(1)).min(1),
    hubs: z.array(z.enum(hubIds)),
    template: z.enum(templates),
    article_id: z.string().min(3),
    search_intent: z.string().min(2),
    main_query: z.string().min(2),
    audience: z.string().min(2),
    season: z.string().min(1),
    species_scientific_name: z.string().min(3).nullable(),
    sources: z
      .array(
        z
          .object({
            title: z.string().min(2),
            url: z.string().url(),
            checked_at: dateString,
          })
          .strict(),
      )
      .min(1),
    images: z.array(postImageSchema).min(1),
    risk_level: z.enum(riskLevels),
    review_status: z.enum(reviewStatuses),
    verified_by: z.string().nullable(),
    verified_at: dateString.nullable(),
    published_at: dateString.nullable(),
    modified_at: dateString.nullable(),
    related_article_ids: z.array(z.string()),
    /** 첫 화면에 보이는 빠른 답 */
    quickAnswer: z.string().min(8),
    featured: z.boolean(),
    heroImage: z.string().regex(/^\//, "heroImage는 /로 시작"),
    thumbTitle: z.string().min(2).optional(),
    thumbSubtitle: z.string().min(2).optional(),
    thumbBackground: z.string().regex(/^\//).optional(),
    faq: z.array(z.object({ q: z.string().min(4), a: z.string().min(8) }).strict()).optional(),
    author: z.string().min(1).optional(),
    근거: z.array(z.string().regex(/^F\d+$/)),
  })
  .strict()
  .superRefine((post, ctx) => {
    for (const source of post.sources) {
      if (!source.url.startsWith("https://")) {
        ctx.addIssue({ code: "custom", message: `출처는 https 주소여야 합니다: ${source.url}` });
      }
    }
    if (!post.images.some((image) => image.path === post.heroImage)) {
      ctx.addIssue({ code: "custom", message: "heroImage가 images 목록에 없습니다." });
    }
    if (post.risk_level === "high" && !post.verified_by?.trim()) {
      ctx.addIssue({ code: "custom", message: "risk_level이 high이면 verified_by가 필요합니다." });
    }
    if (!post.draft && post.review_status !== "approved" && post.review_status !== "published") {
      ctx.addIssue({ code: "custom", message: "발행하려면 review_status가 approved 또는 published여야 합니다." });
    }
    if (post.draft && post.review_status === "published") {
      ctx.addIssue({ code: "custom", message: "published 상태이면 draft는 false여야 합니다." });
    }
  });

export type PostImage = z.infer<typeof postImageSchema>;
export type PostFrontmatter = z.infer<typeof postSchema>;

export function publishDateOf(data: { date: string; publishAt?: string }): string {
  return data.publishAt ?? data.date;
}
