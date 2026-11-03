import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { renderCard, wrapTitle } from "../src/thumbnails/render";

test("제목은 두 줄로 나눔", () => {
  assert.deepEqual(wrapTitle("잎이 노랗게\n될 때"), ["잎이 노랗게", "될 때"]);
  const lines = wrapTitle("몬스테라 잎이 노랗게 변할 때 점검");
  assert.equal(lines.length, 2);
});

test("분류 배경은 글자 없는 1200x675", async () => {
  const png = await renderCard({ categoryId: "plants", title: "제목은 HTML에 올립니다" });
  const meta = await sharp(png).metadata();
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 675);
});
