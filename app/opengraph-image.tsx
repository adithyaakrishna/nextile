import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgFrame, OgTimeBar, OgWordmark, ogFonts } from "@/ui/og";

export const alt = "Nextile: a new puzzle every day. Sixty seconds. One try.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Static and spoiler-free: it never shows a real puzzle
export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame>
        <OgWordmark size={84} />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 54, lineHeight: 1.15 }}>
          <span>A new puzzle every day.</span>
          <span>Sixty seconds. One try.</span>
        </div>
        <OgTimeBar cells="■■■□□□□□□□" />
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
