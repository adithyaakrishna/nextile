import type { Result } from "@/game/machine";
import { timeBar } from "@/share/text";

// The same ten cells as the share text, drawn as boxes
export function TimeBar({ result }: { result: Pick<Result, "outcome" | "elapsedMs"> }) {
  const cells = [...timeBar(result)];
  return (
    <span className="timebar" aria-hidden="true">
      {cells.map((ch, i) => (
        <span key={i} className="timebar-cell" data-used={ch !== "□"}>
          {ch === "✕" ? "✕" : ""}
        </span>
      ))}
    </span>
  );
}
