import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const MAT = "#CDDFD2";
const INK = "#000000";
const PAPER = "#FFFFFF";
const SIGNAL = "#FF4F1F";

export async function ogFonts() {
  const data = await readFile(join(process.cwd(), "assets/fonts/ArchivoBlack-Regular.ttf"));
  return [{ name: "Archivo Black", data, style: "normal" as const, weight: 900 as const }];
}

// Satori supports only flexbox and a subset of CSS, so the mat grid is an inline SVG
function MatLines() {
  const fine = Array.from({ length: 51 }, (_, i) => i * 24);
  const strong = Array.from({ length: 11 }, (_, i) => i * 120);
  return (
    <svg width={OG_SIZE.width} height={OG_SIZE.height} style={{ position: "absolute", top: 0, left: 0 }}>
      {fine.map((x) => (
        <line key={`fx${x}`} x1={x} y1={0} x2={x} y2={OG_SIZE.height} stroke="rgba(0,0,0,0.07)" strokeWidth={1} />
      ))}
      {fine.map((y) => (
        <line key={`fy${y}`} x1={0} y1={y} x2={OG_SIZE.width} y2={y} stroke="rgba(0,0,0,0.07)" strokeWidth={1} />
      ))}
      {strong.map((x) => (
        <line key={`sx${x}`} x1={x} y1={0} x2={x} y2={OG_SIZE.height} stroke="rgba(0,0,0,0.14)" strokeWidth={1.5} />
      ))}
      {strong.map((y) => (
        <line key={`sy${y}`} x1={0} y1={y} x2={OG_SIZE.width} y2={y} stroke="rgba(0,0,0,0.14)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

export function OgTileMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="2" y="2" width="44" height="44" rx="9" fill={PAPER} stroke={INK} strokeWidth="4" />
      <rect x="20" y="7" width="8" height="5" rx="1.5" fill={INK} />
      <circle cx="24" cy="26" r="13" fill={PAPER} stroke={INK} strokeWidth="4" />
      <path d="M24 26 V15.5 A10.5 10.5 0 1 1 13.5 26 Z" fill={SIGNAL} />
      <circle cx="24" cy="26" r="2.4" fill={INK} />
    </svg>
  );
}

export function OgWordmark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: size, lineHeight: 1, letterSpacing: "-0.02em" }}>
      <OgTileMark size={size * 1.2} />
      <span style={{ marginLeft: size * 0.22 }}>NEXTILE</span>
    </div>
  );
}

export function OgTimeBar({ cells }: { cells: string }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[...cells].map((ch, i) => (
        <div
          key={i}
          style={{
            width: 40,
            height: 40,
            border: `6px solid ${INK}`,
            borderRadius: 6,
            background: ch === "□" ? PAPER : INK,
            color: PAPER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          {ch === "✕" ? "×" : ""}
        </div>
      ))}
    </div>
  );
}

// The mat, plus a white card with the hard shadow
export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: MAT, fontFamily: "Archivo Black", color: INK, position: "relative" }}>
      <MatLines />
      <div style={{ display: "flex", position: "absolute", left: 96, top: 72, width: 1008, height: 486, background: INK, borderRadius: 28 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: 80,
          top: 56,
          width: 1008,
          height: 486,
          background: PAPER,
          border: `6px solid ${INK}`,
          borderRadius: 28,
          padding: "44px 56px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function OgStamp({ text, isInverted }: { text: string; isInverted: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "14px 26px",
        border: `6px solid ${INK}`,
        borderRadius: 14,
        background: isInverted ? INK : PAPER,
        color: isInverted ? PAPER : INK,
        fontSize: 56,
        transform: "rotate(-3deg)",
      }}
    >
      {text}
    </div>
  );
}
