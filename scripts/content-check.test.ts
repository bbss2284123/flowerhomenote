import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { siteConfig } from "../site.config";
import { isReleased } from "../src/lib/dates";
import {
  bleachMixErrors,
  checkPosts,
  dailyCapErrors,
  findBanned,
  imageRightsErrors,
  imageRuleErrors,
  introErrors,
  loadPosts,
  missingNumbers,
  shotSyncErrors,
  toxicityErrors,
} from "../src/lib/check";
import { postSchema, type PostImage } from "../src/lib/post-schema";

const foreign = [
  ["today", "moneytip"].join(""),
  ["오늘의", " 머니팁"].join(""),
  ["tech", "jeongbiso"].join(""),
  ["테크", "정비소"].join(""),
];

test("원장에 없는 숫자는 실패", () => {
  const facts = [{ id: "F1", value: "잎 네 장", source: "https://example.com", checkedAt: "2026-11-03" }];
  assert.deepEqual(missingNumbers("확인한 잎은 12장입니다.", facts), ["12"]);
});

test("원장에 있는 숫자는 통과", () => {
  const facts = [{ id: "F1", value: "잎 네 장이 아니라 4장", source: "https://example.com", checkedAt: "2026-11-03" }];
  assert.deepEqual(missingNumbers("확인한 잎은 4장입니다.", facts), []);
});

test("금지 표현", () => {
  const hits = findBanned("오늘은 물주기에 대해 알아보겠습니다.", [{ pattern: "오늘은 .{0,40}알아보", reason: "예고" }]);
  assert.equal(hits.length, 1);
});

test("도입이 세 문장을 넘으면 막음", () => {
  const errors = introErrors("첫 문장입니다. 둘째 문장입니다. 셋째 문장입니다. 넷째 문장입니다.\n\n## 한눈에 보는 핵심");
  assert.ok(errors.some((message) => message.includes("3문장")));
});

test("빠른 답이 없으면 스키마가 막음", () => {
  const sample = loadPosts()[0]?.data;
  assert.ok(sample);
  const broken = { ...sample } as { quickAnswer?: string };
  delete broken.quickAnswer;
  assert.equal(postSchema.safeParse(broken).success, false);
});

test("출처 확인일이 없으면 스키마가 막음", () => {
  const sample = loadPosts()[0]?.data;
  assert.ok(sample);
  const sources = sample.sources.map(({ title, url }) => ({ title, url }));
  assert.equal(postSchema.safeParse({ ...sample, sources }).success, false);
});

test("alt가 비면 스키마가 막음", () => {
  const sample = loadPosts()[0]?.data;
  assert.ok(sample);
  const images = sample.images.map((image, index) => (index === 0 ? { ...image, alt: " " } : image));
  assert.equal(postSchema.safeParse({ ...sample, images }).success, false);
});

test("직접 촬영이 아니면 라이선스 증빙이 필요", () => {
  const sample = loadPosts()[0]?.data;
  assert.ok(sample);
  const images = sample.images.map((image) => {
    const { license_proof: _proof, ...rest } = image;
    return { ...rest, source_type: "illustration" as const };
  });
  assert.equal(postSchema.safeParse({ ...sample, images }).success, false);
});

test("위험도가 높으면 확인한 사람이 필요", () => {
  const sample = loadPosts()[0]?.data;
  assert.ok(sample);
  assert.equal(postSchema.safeParse({ ...sample, risk_level: "high", verified_by: null }).success, false);
  assert.equal(postSchema.safeParse({ ...sample, risk_level: "high", verified_by: "편집" }).success, true);
});

test("없는 이미지 파일은 발행을 막음", () => {
  const sample = loadPosts()[0];
  assert.ok(sample);
  const images = sample.data.images.map((image, index) => (index === 0 ? { ...image, path: "/posts/missing/nope.png" } : image));
  const errors = imageRuleErrors({ ...sample.data, images, heroImage: images[0].path }, sample.body);
  assert.ok(errors.some((message) => message.includes("없습니다")));
});

test("락스를 다른 세정제와 섞으라고 하면 막음", () => {
  const bad = bleachMixErrors("락스와 식초를 섞으면 곰팡이가 잘 지워집니다.");
  assert.ok(bad.length > 0);
  const warning = bleachMixErrors("차아염소산나트륨은 식초나 암모니아, 다른 세정제와 섞지 않습니다.");
  assert.deepEqual(warning, []);
});

test("독성 주장에는 학명과 출처가 필요", () => {
  const bare = toxicityErrors({ species_scientific_name: null, sources: [] }, "이 식물은 고양이에게 독성입니다.");
  assert.ok(bare.some((message) => message.includes("학명")));
  const named = toxicityErrors(
    {
      species_scientific_name: "Lilium spp.",
      sources: [{ title: "ASPCA", url: "https://www.aspca.org/", checked_at: "2026-11-03" }],
    },
    "Lilium spp.는 고양이에게 독성으로 적힌 자료가 있습니다.",
  );
  assert.deepEqual(named, []);
});

test("농사로 이미지와 AI 전후 비교를 막음", () => {
  const image = {
    path: "/brand/samples/copied.png",
    alt: "농사로에서 내려받은 잎 사진",
    source_type: "illustration" as const,
    license_proof: "https://www.nongsaro.go.kr/example.jpg",
    role: "before-after" as const,
  };
  const errors = imageRightsErrors({ images: [image] }, "전후 사진으로 증명합니다.");
  assert.ok(errors.some((message) => message.includes("샘플")));
  assert.ok(errors.some((message) => message.includes("농사로")));
  assert.ok(errors.some((message) => message.includes("전후")));
});

test("Shot 대체 텍스트가 다르면 막음", () => {
  const image: PostImage = {
    path: "/thumb/backgrounds/plants.png",
    alt: "식물 키우기 분류의 장식 배경입니다",
    source_type: "illustration",
    license_proof: "장식",
    role: "inline",
  };
  const errors = shotSyncErrors(
    `<Shot src="${image.path}" alt="다른 설명입니다" type="illustration" />`,
    [image],
  );
  assert.ok(errors.some((message) => message.includes("alt")));
});

test("같은 한국 날짜에 발행 글이 세 편이면 막음", () => {
  const row = (id: string, day: string) => ({ id, data: { draft: false, date: day } });
  const errors = dailyCapErrors([row("a", "2026-11-03"), row("b", "2026-11-03"), row("c", "2026-11-03")], 2);
  assert.equal(errors.length, 1);
  assert.equal(
    dailyCapErrors([row("a", "2026-11-03"), row("b", "2026-11-03"), { id: "draft", data: { draft: true, date: "2026-11-03" } }], 2).length,
    0,
  );
});

test("미래 날짜는 공개 전", () => {
  const now = new Date("2026-11-03T03:00:00Z");
  assert.equal(isReleased("2099-01-01", now), false);
  assert.equal(isReleased("2020-01-01", now), true);
});

test("하루 발행 상한과 빈 광고 값", () => {
  assert.equal(siteConfig.maxPostsPerDay, 2);
  assert.equal(siteConfig.url, "https://flowerhomenote.com");
  assert.equal(siteConfig.adsense.publisherId, "");
  assert.equal(siteConfig.ga4Id, "");
  assert.equal(siteConfig.cloudflareWebAnalyticsToken, "");
  assert.equal(siteConfig.verification.google, "");
  assert.equal(siteConfig.verification.naver, "");
  assert.equal(siteConfig.verification.bing, "");
});

test("현재 글은 검수를 통과", () => {
  const posts = loadPosts();
  assert.equal(posts.length, 4);
  assert.ok(posts.every((post) => post.data.draft));
  const errors = checkPosts(posts).filter((issue) => issue.level === "error");
  assert.deepEqual(errors, []);
});

test("저장소 글에 다른 사이트 이름이 없음", () => {
  const skip = new Set(["node_modules", "dist", ".git", "public", "assets"]);
  const allowExt = new Set([".ts", ".astro", ".css", ".md", ".mdx", ".yml", ".yaml", ".json", ".html", ".txt", ".svg"]);
  const hits: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (skip.has(name) && dir === process.cwd()) continue;
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === "node_modules" || name === "dist" || name === ".git" || name === "thumb" || name === "fonts") continue;
        walk(full);
        continue;
      }
      if (!allowExt.has(path.extname(name))) continue;
      const text = readFileSync(full, "utf8");
      const lowered = text.toLowerCase();
      for (const word of foreign) {
        if (lowered.includes(word.toLowerCase())) hits.push(`${path.relative(process.cwd(), full)}:${word}`);
      }
    }
  };
  walk(process.cwd());
  assert.deepEqual(hits, []);
});
