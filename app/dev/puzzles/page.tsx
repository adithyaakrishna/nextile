import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content } from "@/content/catalog";
import { describe } from "@/engine/describe";
import { COUNTS, FILLS, ROTATIONS, SHAPES, type Tile } from "@/engine/domain";
import { canonical, tileKey } from "@/engine/canonical";
import { usesGrid } from "@/engine/validate";
import { formatDayLabel } from "@/time/day";
import { RulePanel } from "@/ui/RulePanel";
import { TileArt } from "@/ui/TileArt";

export const metadata: Metadata = { title: "Contact sheet · Nextile", robots: { index: false } };

const SPECIMEN_COLORS = ["blue", "pink", "yellow"] as const;

function specimens(): Tile[] {
  const tiles = new Map<string, Tile>();
  for (const shape of SHAPES)
    for (const fill of FILLS)
      for (const rotation of ROTATIONS)
        for (const count of COUNTS) {
          const t = canonical({ shape, fill, rotation, count, color: SPECIMEN_COLORS[count - 1], cell: 4 });
          tiles.set(tileKey(t), t);
        }
  return [...tiles.values()];
}

function Specimen({ tile, grid }: { tile: Tile; grid: boolean }) {
  return (
    <figure className="flex w-[88px] flex-col items-center gap-1">
      <span className="om-tile h-[72px] w-[72px]">
        <TileArt tile={tile} grid={grid} />
      </span>
      <figcaption className="text-center text-[10px] leading-tight">{describe(tile, { grid })}</figcaption>
    </figure>
  );
}

// Development only: every puzzle at real size, with answers, on both mats. 404 in production.
export default function ContactSheetPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const c = content();
  const byId = new Map(c.schedule.map((e) => [e.id, e.day]));
  const puzzles = [...c.puzzles.values()];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <h1 className="type-display text-[36px]">Contact sheet</h1>
      <p className="type-body mt-2">
        {puzzles.length} puzzles, answers shown. Development only. Use <code>pnpm puzzle:preview</code> for an SVG version.
      </p>

      <section className="mt-8">
        <h2 className="type-heading text-[24px]">Every shape, fill, rotation and count</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {specimens().map((t) => (
            <Specimen key={tileKey(t)} tile={t} grid={false} />
          ))}
        </div>
        <h3 className="type-heading mt-6 text-[20px]">Every position</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {([0, 1, 2, 3, 4, 5, 6, 7, 8] as const).map((cell) => (
            <Specimen key={cell} tile={{ shape: "circle", color: "pink", fill: "solid", rotation: 0, count: 1, cell }} grid />
          ))}
        </div>
      </section>

      {(["light", "dark"] as const).map((mat) => (
        <section key={mat} data-mat={mat} className="mt-10 rounded-[18px] p-4">
          <h2 className="type-heading text-[24px]">{mat === "light" ? "Light mat" : "Night mat"}</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {puzzles.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <p className="type-label">
                  {p.id} · {p.family} · {p.difficulty} · {byId.get(p.id) ? formatDayLabel(byId.get(p.id) as string) : "unscheduled"}
                </p>
                <RulePanel
                  sequence={p.sequence}
                  choices={p.choices}
                  answerIndex={p.answerIndex}
                  choice={null}
                  explanation={p.explanation}
                  grid={usesGrid(p.rule)}
                  heading={p.id}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
