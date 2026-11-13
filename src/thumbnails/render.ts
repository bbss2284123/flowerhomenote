import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

interface Crop {
  /** public 기준 경로 */
  file: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const full = { left: 0, top: 0, width: 1200, height: 675 };

/**
 * 글자 없는 16:9 배경.
 * ai 파일은 따뜻한 편집 사진 스타일로 만든 장식이고, 키트 파일은 제목 상자를 뺀 잘라내기입니다.
 * 샘플 썸네일 원본은 글 사진으로 쓰지 않습니다.
 */
const crops: Record<string, Crop[]> = {
  flowers: [
    { file: "brand/samples/01_수국_예쁘게_키우는_법.webp", left: 640, top: 0, width: 560, height: 675 },
    { file: "brand/backgrounds/flowers-window.webp", ...full },
    { file: "brand/editorial.webp", left: 880, top: 0, width: 720, height: 500 },
  ],
  plants: [
    { file: "brand/samples/02_몬스테라_잎이_노랗게_될_때.webp", left: 640, top: 0, width: 560, height: 675 },
    { file: "brand/samples/02_몬스테라_잎이_노랗게_될_때.webp", left: 730, top: 0, width: 470, height: 420 },
    { file: "brand/samples/02_몬스테라_잎이_노랗게_될_때.webp", left: 700, top: 240, width: 500, height: 435 },
  ],
  gardening: [
    { file: "brand/backgrounds/gardening-veranda.webp", ...full },
    { file: "brand/backgrounds/gardening-herbs.webp", ...full },
    { file: "brand/samples/04_베란다_허브_가꾸기_입문.webp", left: 0, top: 310, width: 1200, height: 365 },
  ],
  pets: [
    { file: "brand/backgrounds/pets-window.webp", ...full },
    { file: "brand/samples/03_고양이_털_관리_쉽게_하는_법.webp", left: 700, top: 30, width: 500, height: 430 },
    { file: "brand/samples/03_고양이_털_관리_쉽게_하는_법.webp", left: 820, top: 160, width: 380, height: 515 },
  ],
  home: [
    { file: "brand/backgrounds/home-bathroom.webp", ...full },
    { file: "brand/backgrounds/home-kitchen.webp", ...full },
    { file: "brand/backgrounds/home-living.webp", ...full },
  ],
  storage: [
    { file: "brand/backgrounds/storage-shelves.webp", ...full },
    { file: "brand/backgrounds/storage-baskets.webp", ...full },
  ],
};

function sourceFile(rel: string): string {
  return path.join(process.cwd(), "public", rel);
}

export function variantCount(categoryId: string): number {
  return (crops[categoryId] ?? crops.flowers).length;
}

export function variantIndex(categoryId: string, key: string): number {
  let hash = 0;
  for (const ch of `${categoryId}:${key}`) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  return hash % variantCount(categoryId);
}

export function backgroundPath(categoryId: string, key: string): string {
  return `/thumb/backgrounds/${categoryId}-${variantIndex(categoryId, key)}.webp`;
}

export async function renderBackground(categoryId: string, variant = 0): Promise<Buffer> {
  const set = crops[categoryId];
  if (!set) throw new Error(`알 수 없는 분류: ${categoryId}`);
  const crop = set[variant % set.length];
  const file = sourceFile(crop.file);
  if (!existsSync(file)) throw new Error(`배경 원본이 없습니다: ${crop.file}`);
  return sharp(file)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .resize(1200, 675, { fit: "cover", position: "attention" })
    .modulate({ saturation: 1.08, brightness: 1.02 })
    .sharpen({ sigma: 0.4 })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
}

export function wrapTitle(input: string): string[] {
  const raw = input.replace(/\r/g, "").trim();
  if (raw.includes("\n")) return raw.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 2);
  const chars = [...raw];
  if (chars.length <= 12) return [raw];
  const mid = Math.ceil(chars.length / 2);
  const space = raw.lastIndexOf(" ", mid + 2);
  if (space >= 4 && space <= chars.length - 4) {
    return [raw.slice(0, space).trim(), raw.slice(space + 1).trim()];
  }
  return [chars.slice(0, mid).join(""), chars.slice(mid).join("")];
}

/** 카드·OG에 쓰는 글자 없는 1200×675 사진. 제목은 페이지 HTML에 올립니다. */
export async function renderCard(input: { categoryId: string; title?: string; subtitle?: string; background?: string }): Promise<Buffer> {
  if (input.background) {
    const file = path.join(process.cwd(), "public", input.background.replace(/^\/+/, ""));
    if (!existsSync(file)) throw new Error(`배경 파일이 없습니다: ${input.background}`);
    return sharp(file).resize(1200, 675, { fit: "cover" }).webp({ quality: 80, effort: 5 }).toBuffer();
  }
  return renderBackground(input.categoryId, 0);
}

export async function renderOg(card: Buffer): Promise<Buffer> {
  return sharp(card).resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}
