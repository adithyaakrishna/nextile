"use client";

import { formatChallengeNumber } from "@/config";
import { formatLocalTime, nextPublicationMs } from "@/time/day";
import { DigitCells } from "./Clock";
import { useNow } from "./useNow";

function hms(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface NextCountdownProps {
  nextAt: number | null;
  offsetMs: number;
  nextNumber: number;
}

// Counts down on the server's clock, so a wrong device clock still shows the right time; never reloads on its own
export function NextCountdown({ nextAt, offsetMs, nextNumber }: NextCountdownProps) {
  const now = useNow();
  if (now === 0) return <div className="min-h-[92px]" />;
  const target = nextAt ?? nextPublicationMs(now + offsetMs);
  const remaining = target - (now + offsetMs);

  if (remaining <= 0) {
    return (
      <div className="flex min-h-[92px] flex-col items-start gap-3">
        <p className="type-heading text-[20px]">Today&apos;s puzzle is out</p>
        <button type="button" className="btn btn-signal press" onClick={() => window.location.reload()}>
          Play {formatChallengeNumber(nextNumber)}
        </button>
      </div>
    );
  }

  const label = hms(remaining);
  return (
    <div className="countdown flex min-h-[92px] flex-col items-start gap-2">
      <p className="type-label text-[15px]">Next puzzle in</p>
      <DigitCells text={label} label={label.replace(/:/g, " ").replace(/^(\d+) (\d+) (\d+)$/, "$1 hours $2 minutes $3 seconds")} />
      <p className="type-small text-on-mat-soft">{formatLocalTime(target)} your time</p>
    </div>
  );
}
