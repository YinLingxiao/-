/**
 * 生成朱文印章 SVG：华文行楷（STXingkai）繁体「戲」
 * 从真实字体提取字形轮廓（贝塞尔曲线），保证部署后无需本地字体。
 * 用法：node scripts/gen-seal.mjs
 */
import opentype from 'opentype.js';
import { readFileSync, writeFileSync } from 'node:fs';

const FONT_PATH = 'C:/Windows/Fonts/STXINGKA.TTF'; // 华文行楷
const CHAR = '戏'; // U+620F 简体
const V = 48; // viewBox 尺寸
const MARGIN = 6; // 字与边框间距

const buf = readFileSync(FONT_PATH);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const font = opentype.parse(ab);
const glyph = font.charToGlyph(CHAR);

if (!glyph || glyph.index === 0) {
  console.error(`[失败] 字体中未找到「${CHAR}」字形`);
  process.exit(1);
}

// getPath 已输出 y 向下的 SVG 坐标，直接用其自身包围盒定位
const p = glyph.getPath(0, 0, font.unitsPerEm);
const d = p.toPathData(2);
const bb = p.getBoundingBox(); // y 向下
const w = bb.x2 - bb.x1;
const h = bb.y2 - bb.y1;
const cx = (bb.x1 + bb.x2) / 2;
const cy = (bb.y1 + bb.y2) / 2;

// 等比例缩放至 viewBox 并居中（无需翻转 y）
const s = (V - 2 * MARGIN) / Math.max(w, h);
const tx = (V / 2 - s * cx).toFixed(3);
const ty = (V / 2 - s * cy).toFixed(3);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${V} ${V}" role="img" aria-label="戏字朱文印">
  <rect x="1.5" y="1.5" width="${V - 3}" height="${V - 3}" rx="3" fill="#F5F4ED" stroke="#C0392B" stroke-width="1.5"/>
  <rect x="4.5" y="4.5" width="${V - 9}" height="${V - 9}" rx="1.5" fill="none" stroke="#C0392B" stroke-width="0.75" opacity="0.55"/>
  <g transform="translate(${tx} ${ty}) scale(${s.toFixed(4)} ${s.toFixed(4)})">
    <path fill="#C0392B" d="${d}"/>
  </g>
</svg>
`;

writeFileSync('public/brand-seal.svg', svg + '\n');
console.log(`字形 bbox: x[${bb.x1.toFixed(1)},${bb.x2.toFixed(1)}] y[${bb.y1.toFixed(1)},${bb.y2.toFixed(1)}]  w=${w.toFixed(1)} h=${h.toFixed(1)}`);
console.log(`scale=${s.toFixed(4)}  translate=(${tx},${ty})`);
console.log('已写入 public/brand-seal.svg');
