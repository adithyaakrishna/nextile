import type { Stats } from "@/persistence/stats";
import { formatSeconds } from "@/scoring/score";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <dt className="type-small order-2">{label}</dt>
      <dd className="type-display order-1 text-[32px]">{value}</dd>
    </div>
  );
}

// Labeled "On this device" everywhere: without accounts these numbers belong to this browser
export function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <section aria-labelledby="stats-heading" className="panel p-1">
      <h2 id="stats-heading" className="type-label px-4 pt-3 text-[14px]">
        On this device
      </h2>
      <dl className="grid grid-cols-2">
        <Stat value={String(stats.current)} label="Current streak" />
        <Stat value={String(stats.best)} label="Best streak" />
        <Stat value={String(stats.played)} label="Played" />
        <Stat value={stats.averageSolveMs === null ? "—" : `${formatSeconds(stats.averageSolveMs)} s`} label="Average solve" />
      </dl>
    </section>
  );
}
