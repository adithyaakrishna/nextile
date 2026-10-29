"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/analytics/client";
import { isNativeShareAvailable, shareResult, type ShareOutcome } from "@/share/share";

const STATUS: Record<ShareOutcome, string> = {
  shared: "Shared",
  copied: "Copied to clipboard",
  cancelled: "",
  failed: "Copy this text",
};

// Native share sheet on touch devices, clipboard on desktop, a pre-selected box if both fail
export function ShareButton({ text, day }: { text: string; day: string }) {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (outcome === "failed") fallbackRef.current?.select();
  }, [outcome]);

  const onShare = async () => {
    const method = isNativeShareAvailable(text) ? "native" : "copy";
    track({ name: "share_clicked", props: { day, method } });
    const result = await shareResult(text);
    if (result === "shared") track({ name: "share_completed", props: { day } });
    if (result === "copied") track({ name: "share_link_copied", props: { day } });
    setOutcome(result);
  };

  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="btn btn-signal btn-big press w-full sm:w-auto sm:self-start" onClick={() => void onShare()}>
        Share result
      </button>
      <p aria-live="polite" className="type-label min-h-[20px] text-[15px]">
        {outcome ? STATUS[outcome] : ""}
      </p>
      {outcome === "failed" && (
        <label className="flex flex-col gap-2">
          <span className="sr-only">Your result, ready to copy</span>
          <textarea ref={fallbackRef} readOnly value={text} rows={8} className="paper w-full rounded-[10px] p-3 font-[inherit] text-[15px]" />
        </label>
      )}
    </div>
  );
}
