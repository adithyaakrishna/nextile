import type { CSSProperties, RefObject } from "react";

// Fixed-width digit cells, so numbers never jitter and no monospace font is needed
export function DigitCells({ text, label }: { text: string; label?: string }) {
  return (
    <span className="digits" aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined}>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="digit">
            {ch}
          </span>
        ) : (
          <span key={i} className="digit-sep">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

export function clockText(secondsLeft: number): string {
  const s = Math.max(0, Math.min(60, secondsLeft));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

interface ClockProps {
  secondsLeft: number;
  fuseRef?: RefObject<HTMLDivElement | null>;
  elapsed?: number; // for a frozen clock after the attempt ends
}

// The loudest object on the screen: m:ss in digit cells and a sixty-segment fuse burning down
export function Clock({ secondsLeft, fuseRef, elapsed }: ClockProps) {
  const isFinal = secondsLeft <= 10;
  return (
    <div className="clock" data-final={isFinal} aria-hidden="true">
      <DigitCells text={clockText(secondsLeft)} />
      <div ref={fuseRef} className="fuse" style={elapsed === undefined ? undefined : ({ "--elapsed": elapsed } as CSSProperties)}>
        <div className="fuse-burnt" />
      </div>
    </div>
  );
}
