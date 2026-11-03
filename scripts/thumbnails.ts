import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";
import { siteConfig } from "../site.config";
import { renderBackground, renderCard, renderOg } from "../src/thumbnails/render";

async function writeBackgrounds() {
  const dir = path.join(process.cwd(), "public/thumb/backgrounds");
  mkdirSync(dir, { recursive: true });
  for (const category of siteConfig.categories) {
    const png = await renderBackground(category.id);
    writeFileSync(path.join(dir, `${category.id}.png`), png);
    console.log(`배경 ${category.id}`);
  }
}

async function writeFavicons() {
  const src = path.join(process.cwd(), "public/android-chrome-192x192.png");
  if (!existsSync(src)) return;
  await sharp(src).resize(32, 32).png().toFile(path.join(process.cwd(), "public/favicon-32x32.png"));
  await sharp(src).resize(16, 16).png().toFile(path.join(process.cwd(), "public/favicon-16x16.png"));
}

async function main() {
  await writeBackgrounds();
  await writeFavicons();
  const postsDir = path.join(process.cwd(), "src/content/posts");
  if (!existsSync(postsDir)) return;
  const files = readdirSync(postsDir).filter((name) => name.endsWith(".mdx") || name.endsWith(".md"));
  if (!files.length) {
    console.log("글이 없어 카드 파일은 만들지 않습니다.");
    return;
  }
  const outRoot = path.join(process.cwd(), "public/thumb/posts");
  mkdirSync(outRoot, { recursive: true });
  for (const name of files) {
    const id = name.replace(/\.mdx?$/, "");
    const parsed = matter(readFileSync(path.join(postsDir, name), "utf8"));
    const data = parsed.data as {
      title?: string;
      category?: string;
      thumbTitle?: string;
      thumbSubtitle?: string;
      thumbBackground?: string;
    };
    if (!data.category || !data.title) {
      console.log(`${id} 분류 또는 제목이 없어 썸네일을 건너뜁니다.`);
      continue;
    }
    const background = data.thumbBackground || `/thumb/backgrounds/${data.category}.png`;
    const card = await renderCard({
      categoryId: data.category,
      title: data.thumbTitle || data.title,
      subtitle: data.thumbSubtitle,
      background,
    });
    const og = await renderOg(card);
    const dir = path.join(outRoot, id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "card.png"), card);
    writeFileSync(path.join(dir, "og.png"), og);
    console.log(`썸네일 ${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
