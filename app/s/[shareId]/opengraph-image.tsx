import { ImageResponse } from "next/og";
import { formatChallengeNumber } from "@/config";
import { formatSeconds } from "@/scoring/score";
import { sharedResult } from "@/server/attempts";
import { timeBar } from "@/share/text";
import { formatDayLabel } from "@/time/day";
import { OG_CONTENT_TYPE, OG_SIZE, OgFrame, OgStamp, OgTimeBar, OgWordmark, ogFonts } from "@/ui/og";
import { STAMP_WORDS } from "@/ui/Stamp";

export const alt = "A Nextile result";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The link preview does the marketing: it shows the score, never the tiles
export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const result = sharedResult(shareId);
  const fonts = await ogFonts();

  if (!result) {
    return new ImageResponse(
      (
        <OgFrame>
          <OgWordmark size={84} />
          <div style={{ display: "flex", fontSize: 54 }}>A new puzzle every day.</div>
          <OgTimeBar cells="□□□□□□□□□□" />
        </OgFrame>
      ),
      { ...size, fonts },
    );
  }

  const big = result.outcome === "correct" && result.elapsedMs !== null ? `${formatSeconds(result.elapsedMs)} s` : `${result.score}/100`;
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <OgWordmark size={60} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 30 }}>
            <span>{formatChallengeNumber(result.number)}</span>
            <span style={{ fontSize: 22 }}>{formatDayLabel(result.day)}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <OgStamp text={STAMP_WORDS[result.outcome]} isInverted={result.outcome === "correct"} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 120, lineHeight: 1 }}>{big}</span>
            <span style={{ fontSize: 30 }}>Score {result.score}/100</span>
          </div>
        </div>
        <OgTimeBar cells={timeBar(result)} />
      </OgFrame>
    ),
    { ...size, fonts },
  );
}
