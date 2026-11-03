import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { categoryById } from "../../site.config";

interface Crop {
  /** samples 파일 이름. editorial 이면 글자 없는 편집 배경. */
  file: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 브랜드 키트 그림에서 제목 상자가 없는 구간만 자른 16:9 배경.
 * 샘플 썸네일 원본을 글 사진으로 쓰지 않고, 글자를 뺀 장면만 분류 배경으로 씁니다.
 */
const crops: Record<string, Crop[]> = {
  flowers: [
    { file: "01_수국_예쁘게_키우는_법.png", left: 640, top: 0, width: 560, height: 675 },
    { file: "01_수국_예쁘게_키우는_법.png", left: 720, top: 160, width: 460, height: 430 },
    { file: "editorial", left: 880, top: 0, width: 720, height: 500 },
  ],
  plants: [
    { file: "02_몬스테라_잎이_노랗게_될_때.png", left: 640, top: 0, width: 560, height: 675 },
    { file: "02_몬스테라_잎이_노랗게_될_때.png", left: 730, top: 0, width: 470, height: 420 },
    { file: "02_몬스테라_잎이_노랗게_될_때.png", left: 700, top: 240, width: 500, height: 435 },
  ],
  gardening: [
    { file: "04_베란다_허브_가꾸기_입문.png", left: 0, top: 310, width: 1200, height: 365 },
    { file: "04_베란다_허브_가꾸기_입문.png", left: 540, top: 250, width: 660, height: 425 },
    { file: "04_베란다_허브_가꾸기_입문.png", left: 180, top: 320, width: 560, height: 355 },
  ],
  pets: [
    { file: "03_고양이_털_관리_쉽게_하는_법.png", left: 700, top: 30, width: 500, height: 430 },
    { file: "03_고양이_털_관리_쉽게_하는_법.png", left: 820, top: 160, width: 380, height: 515 },
    { file: "03_고양이_털_관리_쉽게_하는_법.png", left: 640, top: 280, width: 560, height: 395 },
  ],
  home: [
    { file: "05_욕실_곰팡이_깔끔_관리법.png", left: 780, top: 0, width: 420, height: 675 },
    { file: "05_욕실_곰팡이_깔끔_관리법.png", left: 860, top: 180, width: 340, height: 495 },
    { file: "06_집_청소_루틴.png", left: 860, top: 60, width: 340, height: 460 },
  ],
};

function sourceFile(name: string): string {
  if (name === "editorial") return path.join(process.cwd(), "public/brand/editorial.webp");
  return path.join(process.cwd(), "public/brand/samples", name);
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
  return `/thumb/backgrounds/${categoryId}-${variantIndex(categoryId, key)}.png`;
}

export async function renderBackground(categoryId: string, variant = 0): Promise<Buffer> {
  const category = categoryById(categoryId);
  if (!category) throw new Error(`알 수 없는 분류: ${categoryId}`);
  const set = crops[categoryId] ?? crops.flowers;
  const crop = set[variant % set.length];
  const file = sourceFile(crop.file);
  if (!existsSync(file)) throw new Error(`배경 원본이 없습니다: ${crop.file}`);
  return sharp(file)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .resize(1200, 675, { fit: "cover", position: "attention" })
    .modulate({ saturation: 1.08, brightness: 1.02 })
    .sharpen({ sigma: 0.4 })
    .png()
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
    return sharp(file).resize(1200, 675, { fit: "cover" }).png().toBuffer();
  }
  return renderBackground(input.categoryId, 0);
}

export async function renderOg(card: Buffer): Promise<Buffer> {
  return sharp(card).resize(1200, 630, { fit: "cover", position: "attention" }).png().toBuffer();
}
