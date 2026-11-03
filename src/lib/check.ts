import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import { siteConfig } from "../../site.config";
import { publishDay } from "./publish-due";
import { postSchema, publishDateOf, type PostFrontmatter, type PostImage } from "./post-schema";

export interface Fact {
  id: string;
  value: string;
  source: string;
  checkedAt: string;
  note?: string;
}

export interface LoadedPost {
  id: string;
  file: string;
  data: PostFrontmatter;
  body: string;
  raw: string;
}

export interface CheckIssue {
  level: "error" | "info";
  file: string;
  message: string;
}

const BANNED_PATH = "rules/banned.yaml";

interface BannedRule {
  phrase?: string;
  pattern?: string;
  reason: string;
}

export function loadBanned(root = process.cwd()): BannedRule[] {
  const file = path.join(root, BANNED_PATH);
  return parseYaml(readFileSync(file, "utf8")) as BannedRule[];
}

export function stripIgnored(text: string): string {
  let s = text;
  s = s.replace(/<!--\s*예시:start\s*-->[\s\S]*?<!--\s*예시:end\s*-->/g, " ");
  s = s.replace(/<[^>]+>/g, " ");
  s = s.replace(/https?:\/\/[^\s)]+/g, " ");
  s = s.replace(/\/[\w./%\uAC00-\uD7A3-]+/g, " ");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  s = s.replace(/\d+\s*가지/g, " ");
  return s;
}

export function numberTokens(text: string): string[] {
  const found = stripIgnored(text).match(/\d+(?:,\d{3})*(?:\.\d+)?/g) ?? [];
  return found.map((n) => n.replace(/,/g, ""));
}

export function claimText(data: PostFrontmatter, body: string): string {
  const chunks = [
    data.title,
    data.description,
    data.quickAnswer,
    data.main_query,
    data.search_intent,
    data.audience,
    data.season,
    data.species_scientific_name ?? "",
    data.thumbTitle ?? "",
    data.thumbSubtitle ?? "",
    ...data.images.flatMap((image) => [image.alt, image.caption ?? "", image.license_proof ?? ""]),
    ...(data.faq ?? []).flatMap((item) => [item.q, item.a]),
    body,
  ];
  return chunks.join("\n");
}

export function factTokens(facts: Fact[]): Set<string> {
  const set = new Set<string>();
  for (const fact of facts) {
    for (const token of numberTokens(`${fact.value}\n${fact.note ?? ""}`)) set.add(token);
  }
  return set;
}

export function missingNumbers(text: string, facts: Fact[]): string[] {
  const allowed = factTokens(facts);
  const missing = new Set<string>();
  for (const token of numberTokens(text)) {
    if (!allowed.has(token)) missing.add(token);
  }
  return [...missing];
}

export function findBanned(text: string, rules: BannedRule[]): { rule: BannedRule; hit: string }[] {
  const hits: { rule: BannedRule; hit: string }[] = [];
  for (const rule of rules) {
    if (rule.phrase && text.includes(rule.phrase)) hits.push({ rule, hit: rule.phrase });
    if (rule.pattern) {
      const re = new RegExp(rule.pattern);
      const match = text.match(re);
      if (match) hits.push({ rule, hit: match[0] });
    }
  }
  return hits;
}

const TEMPLATE_LEFTOVERS = [/introduction\s*:/i, /\blorem ipsum\b/i, /\[작성/, /\bTODO\b/, /\{\{/, /YOUR_TITLE/i];

export function templateLeftovers(text: string): string[] {
  return TEMPLATE_LEFTOVERS.filter((re) => re.test(text)).map((re) => re.source);
}

export function knownPaths(posts: { id: string; data: PostFrontmatter }[]): Set<string> {
  const paths = new Set<string>([
    "/",
    "/search",
    "/about",
    "/privacy",
    "/contact",
    "/sources",
    "/archive",
    "/flowers-plants",
    "/rss.xml",
  ]);
  for (const post of posts) {
    if (!post.data.draft) paths.add(`/${post.id}`);
  }
  for (const category of siteConfig.categories) paths.add(`/category/${category.id}`);
  for (const hub of siteConfig.hubs) paths.add(`/hub/${hub.id}`);
  const tags = new Set(posts.filter((post) => !post.data.draft).flatMap((post) => post.data.tags));
  for (const tag of tags) paths.add(`/tag/${encodeURIComponent(tag)}`);
  return paths;
}

export function internalLinks(text: string): string[] {
  const links = new Set<string>();
  const re = /(?:href=|\]\()(\/[^)\s"'#]+)/g;
  for (const match of text.matchAll(re)) {
    const raw = match[1].replace(/\/$/, "") || "/";
    links.add(raw.split("?")[0]);
  }
  return [...links];
}

export function brokenLinks(text: string, paths: Set<string>): string[] {
  return internalLinks(text).filter((link) => {
    if (/\.(png|jpe?g|webp|gif|svg|ico|txt|xml|woff2?)$/i.test(link)) return false;
    return !paths.has(link);
  });
}

export function publicFile(src: string, root = process.cwd()): string {
  return path.join(root, "public", src.replace(/^\/+/, ""));
}

export function keywordPlacementErrors(data: PostFrontmatter, body: string): string[] {
  const keyword = data.main_query.trim();
  const errors: string[] = [];
  if (!data.title.includes(keyword)) errors.push(`제목에 대표 검색어 "${keyword}"가 없습니다.`);
  if (!data.description.includes(keyword)) errors.push("메타 설명에 대표 검색어가 없습니다.");
  const descLen = [...data.description].length;
  if (descLen < 80 || descLen > 120) {
    errors.push(`메타 설명은 80~120자여야 합니다. 지금 ${descLen}자입니다.`);
  }
  const first = body
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\n\s*\n/)[0]
    ?.replace(/\s+/g, " ")
    .trim();
  if (!first?.includes(keyword)) errors.push("첫 문단에 대표 검색어가 없습니다.");
  return errors;
}

export function markdownMarkersInVisibleHtml(html: string): string[] {
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, " ");
  const hits: string[] = [];
  if (visible.includes("**")) hits.push("**");
  if (visible.includes("__")) hits.push("__");
  return hits;
}

export function emojiCount(text: string): number {
  const found = text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu);
  return found?.length ?? 0;
}

export interface ShotTag {
  raw: string;
  attrs: Record<string, string>;
}

export function shotTags(body: string): ShotTag[] {
  const tags: ShotTag[] = [];
  const re = /<Shot\b([^>]*?)(?:\/>|>[\s\S]*?<\/Shot>)/g;
  for (const match of body.matchAll(re)) {
    const raw = match[1] ?? "";
    const attrs: Record<string, string> = {};
    const attrRe = /([:@\w가-힣_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*([^}]*)\s*\})/g;
    for (const attr of raw.matchAll(attrRe)) {
      attrs[attr[1]] = (attr[2] ?? attr[3] ?? attr[4] ?? "").trim();
    }
    tags.push({ raw, attrs });
  }
  return tags;
}

const BLEACH = "락스|표백제|차아염소산";
const OTHER_CLEANER = "식초|암모니아|염산|세제|세정제|소독제|알코올|에탄올|베이킹|과산화";
const MIX_ACTION = /섞|혼합|함께\s*(넣|쓰|사용)|같이\s*(넣|쓰|사용)/;
const MIX_NEGATIVE = /않|말[라것]|금지|피하|안\s*되|위험하|유해|섞지|하지\s*마/;

/** 표백제를 다른 세정제와 섞으라고 권하면 실패합니다. 섞지 말라는 경고는 통과합니다. */
export function bleachMixErrors(text: string): string[] {
  const plain = text.replace(/<[^>]+>/g, " ");
  const errors: string[] = [];
  const mix = new RegExp(`(?:${BLEACH}).{0,80}(?:${OTHER_CLEANER})|(?:${OTHER_CLEANER}).{0,80}(?:${BLEACH})`);
  for (const sentence of plain.split(/(?<=[\.!?。\n])/)) {
    if (!mix.test(sentence) || !MIX_ACTION.test(sentence)) continue;
    if (MIX_NEGATIVE.test(sentence)) continue;
    errors.push("표백제(락스)를 다른 세정제와 섞도록 권하지 않습니다.");
    break;
  }
  if (new RegExp(BLEACH).test(plain) && /효과.{0,12}(2배|두\s*배)/.test(plain)) {
    errors.push("세정제를 섞으면 효과가 커진다는 표현은 넣지 않습니다.");
  }
  return errors;
}

const TOXICITY = /독성|유독|중독/;
const BINOMIAL = /^[A-Z][a-z]+(?:\s+[a-z×][a-z-]+|\s+spp\.)$/;

/** 식물·반려동물 독성 주장에는 학명과 출처가 있어야 합니다. */
export function toxicityErrors(data: Pick<PostFrontmatter, "species_scientific_name" | "sources">, text: string): string[] {
  if (!TOXICITY.test(text)) return [];
  const errors: string[] = [];
  const name = data.species_scientific_name?.trim() ?? "";
  if (!BINOMIAL.test(name)) {
    errors.push("독성 주장에는 학명이 필요합니다. 예: Lilium spp. 또는 Monstera deliciosa");
  }
  if (!data.sources.length) errors.push("독성 주장에는 출처가 필요합니다.");
  return errors;
}

export function imageRightsErrors(data: Pick<PostFrontmatter, "images">, body: string): string[] {
  const errors: string[] = [];
  const illustrative = data.images.some((image) => image.source_type !== "original-photo");
  for (const image of data.images) {
    const blob = [image.path, image.alt, image.caption ?? "", image.license_proof ?? ""].join("\n");
    if (image.path.includes("/brand/samples/")) {
      errors.push(`${image.path} 브랜드 키트의 AI 샘플 썸네일은 글 사진으로 쓰지 않습니다.`);
    }
    if (/nongsaro\.go\.kr/i.test(blob)) {
      errors.push(`${image.path} 농사로 주소의 이미지는 가져오지 않습니다.`);
    }
    if (/농사로/.test(blob) && /(사진|이미지|그림|다운로드|복제|퍼옴|캡처)/.test(blob)) {
      errors.push(`${image.path} 농사로(공공누리 제4유형) 이미지를 복제하지 않습니다.`);
    }
    if (/공공누리|KOGL|제4유형|상업적 이용금지/.test(blob)) {
      errors.push(`${image.path} 공공누리 제4유형으로 보이는 이미지는 올리지 않습니다.`);
    }
    if (!image.alt?.trim()) errors.push(`${image.path} 이미지에 alt가 없습니다.`);
    if (!image.source_type) errors.push(`${image.path} 이미지에 source_type이 없습니다.`);
    if (image.source_type !== "original-photo" && !image.license_proof?.trim()) {
      errors.push(`${image.path} 직접 촬영이 아니면 license_proof가 필요합니다.`);
    }
    if (image.source_type === "illustration" && /실제\s*(사진|촬영)|직접\s*촬영/.test(blob)) {
      errors.push(`${image.path} 장식 이미지를 실제 촬영이라고 적지 않습니다.`);
    }
    const beforeAfter = /전후\s*(사진|비교|결과)|사용\s*전후|청소\s*전후|비포\s*애프터|before\s*[- ]?after/i;
    if (image.source_type !== "original-photo" && (image.role === "before-after" || beforeAfter.test(blob))) {
      errors.push(`${image.path} 직접 촬영이 아닌 이미지로 전후 비교를 말하지 않습니다.`);
    }
  }
  if (illustrative && /전후\s*(사진|비교)로\s*(보여|증명|확인)/.test(body)) {
    errors.push("직접 촬영이 아닌 이미지로 전후 비교를 증명하지 않습니다.");
  }
  return errors;
}

export function imageRuleErrors(data: PostFrontmatter, body: string, root = process.cwd()): string[] {
  const errors: string[] = [];
  if (!data.sources.length) errors.push("출처가 비어 있습니다.");
  for (const source of data.sources) {
    if (!source.checked_at) errors.push(`출처 확인일이 없습니다: ${source.url}`);
  }
  const paths = [data.heroImage, data.thumbBackground].filter(Boolean) as string[];
  for (const src of paths) {
    if (/^https?:/i.test(src)) {
      errors.push(`이미지는 저장소 파일이어야 합니다: ${src}`);
      continue;
    }
    if (!existsSync(publicFile(src, root))) errors.push(`이미지 파일이 없습니다: ${src}`);
  }
  for (const image of data.images) {
    if (/^https?:/i.test(image.path)) {
      errors.push(`${image.path} 이미지는 저장소 파일이어야 합니다.`);
      continue;
    }
    if (!existsSync(publicFile(image.path, root))) errors.push(`이미지 파일이 없습니다: ${image.path}`);
  }
  errors.push(...imageRightsErrors(data, body));
  errors.push(...shotSyncErrors(body, data.images));
  return errors;
}

export function shotSyncErrors(body: string, images: PostImage[]): string[] {
  const errors: string[] = [];
  const tags = shotTags(body);
  if (!tags.length) return errors;
  const bySrc = new Map(tags.map((tag) => [tag.attrs.src, tag]));
  for (const image of images) {
    if (image.role === "hero") continue;
    const tag = bySrc.get(image.path);
    if (!tag) continue;
    if ((tag.attrs.alt ?? "") !== image.alt) errors.push(`${image.path} Shot alt가 프론트매터와 다릅니다.`);
    if ((tag.attrs.type ?? "") !== image.source_type) errors.push(`${image.path} Shot type이 source_type과 다릅니다.`);
  }
  for (const tag of tags) {
    if (!images.some((image) => image.path === tag.attrs.src)) {
      errors.push(`프론트매터에 없는 Shot입니다: ${tag.attrs.src ?? "(src 없음)"}`);
    }
  }
  return errors;
}

export function plainProse(text: string): string {
  return text
    .replace(/<Shot\b[^>]*\/>/g, " ")
    .replace(/<Shot\b[\s\S]*?<\/Shot>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_`|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 첫 제목 앞의 본문. */
export function introText(body: string): string {
  return plainProse(body.split(/^#{1,3}\s+/m)[0] ?? "");
}

export function sentenceCount(text: string): number {
  const parts = text
    .split(/(?<=[\.!?。])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length;
}

export function introErrors(body: string): string[] {
  const intro = introText(body);
  const errors: string[] = [];
  const chars = [...intro].length;
  if (chars > 300) errors.push(`도입은 300자 이하입니다. 지금 ${chars}자입니다.`);
  const sentences = sentenceCount(intro);
  if (sentences > 3) errors.push(`도입은 3문장 이하입니다. 지금 ${sentences}문장입니다.`);
  return errors;
}

export function quickAnswerHeadingErrors(body: string): string[] {
  if (!/^##\s+.*(한눈에|핵심|요약|체크)/m.test(body)) {
    return ["본문에 빠른 답 절(한눈에, 핵심, 요약, 체크)이 없습니다."];
  }
  return [];
}

export function paddingHeadingErrors(body: string): string[] {
  const hits = body.match(/^#{1,3}\s*마무리\s*$/gm) ?? [];
  return hits.length ? ["'마무리' 제목으로 맺음 에세이를 붙이지 않습니다."] : [];
}

export function dailyCapErrors(
  posts: { id: string; data: { draft: boolean; date: string; publishAt?: string } }[],
  max = siteConfig.maxPostsPerDay,
): string[] {
  const groups = new Map<string, string[]>();
  for (const post of posts) {
    if (post.data.draft) continue;
    const day = publishDay(post.data.publishAt ?? post.data.date);
    const list = groups.get(day) ?? [];
    list.push(post.id);
    groups.set(day, list);
  }
  const errors: string[] = [];
  for (const [day, ids] of groups) {
    if (ids.length > max) {
      errors.push(`${day} (KST) 발행 글이 ${ids.length}편입니다. 하루 ${max}편까지입니다. ${ids.join(", ")}`);
    }
  }
  return errors;
}

export function loadFacts(file: string): Fact[] {
  const doc = parseYaml(readFileSync(file, "utf8")) as { facts?: Fact[] };
  return doc.facts ?? [];
}

export function validateFacts(facts: Fact[], cited: string[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  facts.forEach((fact, index) => {
    if (!/^F\d+$/.test(fact.id)) errors.push(`사실 ${index} id가 F번호가 아닙니다.`);
    if (ids.has(fact.id)) errors.push(`사실 id 중복 ${fact.id}`);
    ids.add(fact.id);
    if (!fact.value?.trim()) errors.push(`${fact.id} 값이 비었습니다.`);
    if (!fact.source?.startsWith("http")) errors.push(`${fact.id} 출처 URL이 없습니다.`);
    if (!fact.checkedAt) errors.push(`${fact.id} checkedAt이 없습니다.`);
  });
  for (const id of cited) {
    if (!ids.has(id)) errors.push(`근거 ${id}가 원장에 없습니다.`);
  }
  return errors;
}

export function loadPosts(root = process.cwd()): LoadedPost[] {
  const dir = path.join(root, "src/content/posts");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"))
    .map((name) => {
      const file = path.join(dir, name);
      const raw = readFileSync(file, "utf8");
      const parsed = matter(raw);
      const id = name.replace(/\.mdx?$/, "");
      const result = postSchema.safeParse(parsed.data);
      if (!result.success) {
        const message = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        throw new Error(`${name} 프론트매터 오류: ${message}`);
      }
      return { id, file, data: result.data, body: parsed.content, raw };
    });
}

const FOREIGN = [
  ["today", "moneytip"].join(""),
  ["오늘의", " 머니팁"].join(""),
  ["tech", "jeongbiso"].join(""),
  ["테크", "정비소"].join(""),
];

export function checkPosts(posts: LoadedPost[], root = process.cwd()): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const rules = loadBanned(root);
  const paths = knownPaths(posts);

  for (const post of posts) {
    if (post.data.article_id !== post.id) {
      issues.push({ level: "error", file: post.id, message: "article_id는 파일 이름과 같아야 합니다." });
    }
    const factsPath = path.join(root, "work", post.id, "facts.yaml");
    if (!existsSync(factsPath)) {
      issues.push({ level: "error", file: post.id, message: "work 원장 facts.yaml이 없습니다." });
    } else {
      const facts = loadFacts(factsPath);
      for (const message of validateFacts(facts, post.data.근거)) {
        issues.push({ level: "error", file: post.id, message });
      }
      const missing = missingNumbers(claimText(post.data, post.body), facts);
      if (missing.length) {
        issues.push({ level: "error", file: post.id, message: `원장에 없는 숫자: ${missing.join(", ")}` });
      }
    }
    for (const message of imageRuleErrors(post.data, post.body, root)) {
      issues.push({ level: "error", file: post.id, message });
    }
    for (const hit of findBanned(`${post.data.title}\n${post.data.description}\n${post.data.quickAnswer}\n${post.body}`, rules)) {
      issues.push({ level: "error", file: post.id, message: `금지 표현 "${hit.hit}": ${hit.rule.reason}` });
    }
    for (const leftover of templateLeftovers(post.raw)) {
      issues.push({ level: "error", file: post.id, message: `템플릿 잔여: ${leftover}` });
    }
    for (const link of brokenLinks(`${post.body}\n${JSON.stringify(post.data)}`, paths)) {
      issues.push({ level: "error", file: post.id, message: `끊긴 내부 링크 ${link}` });
    }
    for (const message of keywordPlacementErrors(post.data, post.body)) {
      issues.push({ level: "error", file: post.id, message });
    }
    if (!post.data.quickAnswer.trim()) {
      issues.push({ level: "error", file: post.id, message: "빠른 답(quickAnswer)이 없습니다." });
    }
    for (const message of quickAnswerHeadingErrors(post.body)) {
      issues.push({ level: "error", file: post.id, message });
    }
    for (const message of introErrors(post.body)) {
      issues.push({ level: "error", file: post.id, message });
    }
    for (const message of paddingHeadingErrors(post.body)) {
      issues.push({ level: "error", file: post.id, message });
    }
    for (const message of bleachMixErrors(`${post.data.title}\n${post.data.quickAnswer}\n${post.body}`)) {
      issues.push({ level: "error", file: post.id, message });
    }
    for (const message of toxicityErrors(post.data, claimText(post.data, post.body))) {
      issues.push({ level: "error", file: post.id, message });
    }
    if (post.data.risk_level === "high" && !post.data.verified_by?.trim()) {
      issues.push({ level: "error", file: post.id, message: "risk_level이 high이면 verified_by가 필요합니다." });
    }
    const lowered = post.raw.toLowerCase();
    if (FOREIGN.some((word) => lowered.includes(word.toLowerCase()))) {
      issues.push({ level: "error", file: post.id, message: "다른 사이트 이름이나 주소를 넣지 않습니다." });
    }
    if (emojiCount(post.body) > 0) {
      issues.push({ level: "error", file: post.id, message: "이모지를 넣지 않습니다." });
    }
    const adCount = (post.body.match(/<AdSlot\b/g) ?? []).length;
    if (adCount > 3) {
      issues.push({ level: "error", file: post.id, message: `본문 광고는 3개까지입니다. 지금 ${adCount}개입니다.` });
    }
  }

  for (const message of dailyCapErrors(posts)) {
    issues.push({ level: "error", file: "발행량", message });
  }

  const ledgerPath = path.join(root, "work/ledger.json");
  if (existsSync(ledgerPath)) {
    const ledger = JSON.parse(readFileSync(ledgerPath, "utf8")) as {
      posts?: Record<string, { publishedTitle?: string }>;
    };
    const changed = posts.filter((post) => {
      const published = ledger.posts?.[post.id]?.publishedTitle;
      return published && published !== post.data.title;
    });
    if (changed.length >= 2) {
      issues.push({ level: "error", file: "제목", message: "발행된 글 제목을 한꺼번에 두 개 이상 바꾸지 않습니다." });
    }
  }
  return issues;
}

export function isPublished(data: PostFrontmatter, today: string): boolean {
  return !data.draft && publishDateOf(data) <= today;
}
