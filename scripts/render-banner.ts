// Usage: pnpm banner
// Renders .github/banner.png for the README from the real tile art, so the banner always matches the game.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Tile } from "../src/engine/domain";
import { TileArt } from "../src/ui/TileArt";

const WIDTH = 1280;
const HEIGHT = 640;
const OUT = join(process.cwd(), ".github/banner.png");

// A sample that is not in the puzzle collection: the triangle turns while color and fill advance together
const t = (partial: Partial<Tile>): Tile => ({ shape: "triangle", color: "yellow", fill: "solid", rotation: 0, count: 1, cell: 4, ...partial });
const SEQUENCE: Tile[] = [
  t({ color: "yellow", fill: "solid", rotation: 0 }),
  t({ color: "pink", fill: "outline", rotation: 90 }),
  t({ color: "blue", fill: "striped", rotation: 180 }),
  t({ color: "yellow", fill: "solid", rotation: 270 }),
];
const CHOICES: Tile[] = [
  t({ color: "blue", fill: "striped", rotation: 0 }),
  t({ color: "pink", fill: "outline", rotation: 0 }),
  t({ color: "pink", fill: "outline", rotation: 180 }),
  t({ color: "yellow", fill: "solid", rotation: 0 }),
];

let renders = 0;
function art(tile: Tile): string {
  renders++;
  return renderToStaticMarkup(createElement(TileArt, { tile }), { identifierPrefix: `b${renders}-` });
}

const MARK = `<svg viewBox="0 0 48 48" class="mark" aria-hidden="true"><rect x="2" y="2" width="44" height="44" rx="9" fill="#fff" stroke="#000" stroke-width="4"/><rect x="20" y="7" width="8" height="5" rx="1.5"/><circle cx="24" cy="26" r="13" fill="#fff" stroke="#000" stroke-width="4"/><path d="M24 26 V15.5 A10.5 10.5 0 1 1 13.5 26 Z" fill="#FF4F1F"/><circle cx="24" cy="26" r="2.4"/></svg>`;

const html = `<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=block">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; font-family: Archivo, Arial, sans-serif; color: #000;
    background-color: #CDDFD2;
    background-image: linear-gradient(rgb(0 0 0 / .12) 1px, transparent 1px), linear-gradient(90deg, rgb(0 0 0 / .12) 1px, transparent 1px),
      linear-gradient(rgb(0 0 0 / .07) 1px, transparent 1px), linear-gradient(90deg, rgb(0 0 0 / .07) 1px, transparent 1px);
    background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px; background-position: -1px -1px; }
  .wrap { display: flex; align-items: center; gap: 48px; height: 100%; padding: 0 64px; }
  .copy { flex: 1; display: flex; flex-direction: column; gap: 28px; }
  .wordmark { display: flex; align-items: center; gap: 22px; font-stretch: 125%; font-weight: 900; font-size: 78px; line-height: 1; letter-spacing: -0.02em; }
  .mark { width: 92px; height: 92px; flex-shrink: 0; }
  .tagline { font-size: 29px; font-weight: 500; line-height: 1.3; max-width: 30ch; }
  .chips { display: flex; gap: 12px; flex-wrap: wrap; }
  .chip { padding: 9px 16px; border: 3px solid #000; border-radius: 10px; background: #fff; font-weight: 700; font-size: 19px; box-shadow: 4px 4px 0 #000; }
  .chip.signal { background: #FF4F1F; }
  .panel { position: relative; flex-shrink: 0; width: 520px; padding: 28px; background: #fff; border: 4px solid #000; border-radius: 22px; box-shadow: 14px 14px 0 #000;
    display: flex; flex-direction: column; gap: 22px; }
  .clock { display: flex; align-items: center; gap: 12px; height: 62px; padding: 4px 10px 4px 6px; border: 3px solid #000; border-radius: 10px; }
  .digits { display: flex; align-items: center; gap: 3px; font-size: 32px; font-stretch: 125%; font-weight: 900; line-height: 1; }
  .digit { display: grid; place-items: center; width: calc(.86em + 10px); height: calc(1em + 8px); border: 3px solid #000; border-radius: 6px; }
  .sep { width: .36em; text-align: center; }
  .fuse { position: relative; flex: 1; height: 24px; border: 3px solid #000; border-radius: 4px; overflow: hidden;
    background-image: repeating-linear-gradient(to right, transparent 0, transparent calc(100% / 60 - 1.5px), rgb(0 0 0 / .28) calc(100% / 60 - 1.5px), rgb(0 0 0 / .28) calc(100% / 60)); }
  .fuse::after { content: ""; position: absolute; inset: 0; background: #000; transform-origin: left; transform: scaleX(.3); }
  .prompt { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 26px; }
  .level { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; }
  .level i { display: block; width: 13px; height: 13px; border: 2.5px solid #000; }
  .level i.on { background: #000; }
  .rail { display: flex; gap: 12px; justify-content: center; }
  .tile, .slot { width: 76px; height: 76px; border-radius: 6px; }
  .tile { border: 3px solid #000; background: #fff; }
  .tile svg, .card svg { display: block; width: 100%; height: 100%; }
  .slot { display: grid; place-items: center; border: 3px dashed #000; font-stretch: 125%; font-weight: 900; font-size: 34px; }
  .cards { display: flex; gap: 16px; justify-content: center; padding-right: 6px; }
  .card { position: relative; width: 98px; height: 98px; border: 3px solid #000; border-radius: 12px; background: #fff; box-shadow: 6px 6px 0 #000; padding: 14px; }
  .key { position: absolute; top: 6px; left: 8px; font-weight: 800; font-size: 14px; }
  .om-assist { display: none; }
</style></head><body><div class="wrap">
  <div class="copy">
    <div class="wordmark">${MARK}<span>NEXTILE</span></div>
    <p class="tagline">One visual logic puzzle a day. Find the pattern, pick the next tile. Sixty seconds, one try.</p>
    <div class="chips"><span class="chip signal">Start the clock</span><span class="chip">New puzzle at 00:00 UTC</span></div>
  </div>
  <div class="panel">
    <div class="clock"><div class="digits"><span class="digit">0</span><span class="sep">:</span><span class="digit">4</span><span class="digit">2</span></div><div class="fuse"></div></div>
    <div class="prompt"><span>What comes next?</span><span class="level"><i class="on"></i><i class="on"></i><i></i> Medium</span></div>
    <div class="rail">${SEQUENCE.map((s) => `<span class="tile">${art(s)}</span>`).join("")}<span class="slot">?</span></div>
    <div class="cards">${CHOICES.map((c, i) => `<span class="card"><span class="key">${i + 1}</span>${art(c)}</span>`).join("")}</div>
  </div>
</div></body></html>`;

mkdirSync(join(process.cwd(), ".github"), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT });
await browser.close();
console.log(`Wrote ${OUT}`);
