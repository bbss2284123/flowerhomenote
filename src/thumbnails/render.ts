import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { categoryById, type Category } from "../../site.config";

function svgPlate(category: Category): Buffer {
  const soft = category.soft;
  const accent = category.pill;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${soft}"/>
      <stop offset="1" stop-color="#FCFBF8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  <circle cx="980" cy="180" r="210" fill="${accent}" fill-opacity="0.28"/>
  <circle cx="1080" cy="520" r="180" fill="${category.accent}" fill-opacity="0.12"/>
  <circle cx="140" cy="540" r="70" fill="${accent}" fill-opacity="0.18"/>
</svg>`);
}

/** 글자가 없는 분류 배경. 제목은 HTML로 올립니다. */
export async function renderBackground(categoryId: string): Promise<Buffer> {
  const category = categoryById(categoryId);
  if (!category) throw new Error(`알 수 없는 분류: ${categoryId}`);
  const plate = svgPlate(category);
  const editorial = path.join(process.cwd(), "public/brand/editorial.webp");
  const photoIds = new Set(["flowers", "plants", "gardening"]);
  if (photoIds.has(category.id) && existsSync(editorial)) {
    const position = category.id === "flowers" ? "right" : category.id === "plants" ? "centre" : "left";
    const photo = await sharp(editorial).resize(1200, 675, { fit: "cover", position }).png().toBuffer();
    const veil = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="${category.soft}" fill-opacity="0.18"/></svg>`,
    );
    return sharp(photo).composite([{ input: veil, blend: "over" }]).png().toBuffer();
  }
  const base = await sharp(plate).png().toBuffer();
  const icon = path.join(process.cwd(), "public/icons", `${category.id}.png`);
  if (!existsSync(icon)) return base;
  const mark = await sharp(icon).resize(240, 240).png().toBuffer();
  return sharp(base).composite([{ input: mark, left: 880, top: 210 }]).png().toBuffer();
}

export function wrapTitle(input: string): string[] {
  const raw = input.replace(/\r/g, "").trim();
  if (raw.includes("\n")) return raw.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 3);
  const chars = [...raw];
  if (chars.length <= 14) return [raw];
  const mid = Math.ceil(chars.length / 2);
  const space = raw.lastIndexOf(" ", mid + 3);
  if (space >= 4 && space <= chars.length - 4) {
    return [raw.slice(0, space).trim(), raw.slice(space + 1).trim()];
  }
  return [chars.slice(0, mid).join(""), chars.slice(mid).join("")];
}

/** 카드·OG에 쓰는 글자 없는 1200×675 판. 제목은 페이지 HTML에 올립니다. */
export async function renderCard(input: { categoryId: string; title?: string; subtitle?: string; background?: string }): Promise<Buffer> {
  if (input.background) {
    const file = path.join(process.cwd(), "public", input.background.replace(/^\/+/, ""));
    if (!existsSync(file)) throw new Error(`배경 파일이 없습니다: ${input.background}`);
    return sharp(file).resize(1200, 675, { fit: "cover" }).png().toBuffer();
  }
  return renderBackground(input.categoryId);
}

export async function renderOg(card: Buffer): Promise<Buffer> {
  return sharp(card).resize(1200, 630, { fit: "cover", position: "centre" }).png().toBuffer();
}

export function readPng(file: string): Buffer {
  return readFileSync(file);
}
