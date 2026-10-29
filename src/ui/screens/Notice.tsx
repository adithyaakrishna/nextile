"use client";

import { LAUNCH_DAY } from "@/config";
import type { UnavailableReason } from "@/game/machine";
import { dayStartMs, formatDayLabel, formatLocalTime } from "@/time/day";
import { useNow } from "../useNow";

export function Unavailable({ reason, launchDay }: { reason: UnavailableReason; launchDay: string | null }) {
  const now = useNow();
  const day = launchDay ?? LAUNCH_DAY;
  const local = now === 0 ? "" : ` (${formatLocalTime(dayStartMs(day))} your time)`;
  return (
    <section className="panel mt-6 flex flex-col gap-3 p-6">
      <h1 className="type-heading text-[25px]">{reason === "not-launched" ? "Not long now" : "No puzzle today"}</h1>
      <p className="type-body text-[17px]">
        {reason === "not-launched"
          ? `The first puzzle goes live on ${formatDayLabel(day)} at 00:00 UTC${local}.`
          : "No puzzle today. We skip a day rather than repeat one. Check back tomorrow."}
      </p>
    </section>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="panel mt-6 flex flex-col items-start gap-4 p-6">
      <h1 className="type-heading text-[25px]">Something got in the way</h1>
      <p className="type-body text-[17px]">{message}</p>
      <button type="button" className="btn btn-signal press" onClick={onRetry}>
        Try again
      </button>
    </section>
  );
}
