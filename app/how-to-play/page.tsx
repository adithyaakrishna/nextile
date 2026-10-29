import type { Metadata } from "next";
import { TUTORIAL } from "@/content/tutorial";
import { usesGrid } from "@/engine/validate";
import { BASE, LIMIT_MS, SPEED_BONUS } from "@/scoring/score";
import { PageShell } from "@/ui/PageShell";
import { Practice } from "@/ui/Practice";

export const metadata: Metadata = {
  title: "How to play · Nextile",
  description: "Press Start, find the rule, pick what comes next. One try, sixty seconds.",
};

const STEPS = [
  { title: "Press Start and the clock runs", body: "The tiles appear the moment you start, and you have sixty seconds. Refreshing doesn't stop the clock." },
  { title: "Find the rule", body: "Shapes, colors, fills, counts, turns and positions can each follow a pattern. Sometimes two patterns run at once." },
  { title: "Pick what comes next. One try.", body: "Click or tap a card, or press 1 to 4. Your first pick is final." },
];

export default function HowToPlayPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <h1 className="type-display text-[36px] sm:text-[48px]">How to play</h1>
        <ol className="flex flex-col gap-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="type-display grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border-[3px] border-current text-[22px]" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <span className="type-heading block text-[19px]">{s.title}</span>
                <span className="type-body block text-[16px]">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <Practice puzzle={TUTORIAL} grid={usesGrid(TUTORIAL.rule)} />

        <section className="flex flex-col gap-3">
          <h2 className="type-heading text-[22px] sm:text-[25px]">Scoring</h2>
          <p className="type-body text-[17px]">
            A correct answer scores {BASE} points plus up to {SPEED_BONUS} more for speed: {BASE} + {SPEED_BONUS} × (time left ÷ {LIMIT_MS / 1000} s), rounded.
            Solve it in 18.4 seconds and you score 91. A wrong answer or running out of time scores 0. Times are measured by the server, with a small allowance
            for your connection.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-heading text-[22px] sm:text-[25px]">Streaks</h2>
          <ul className="type-body flex list-disc flex-col gap-1 pl-5 text-[17px]">
            <li>A day counts toward your streak only if you solved that day&apos;s puzzle.</li>
            <li>
              Your current streak is the run of consecutive solved days ending today, or ending yesterday if you haven&apos;t played today yet. It stays alive
              until today&apos;s puzzle is missed.
            </li>
            <li>A wrong answer, running out of time, or skipping a day resets your current streak to zero.</li>
            <li>Your best streak is the longest run you&apos;ve ever had on this device.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-heading text-[22px] sm:text-[25px]">Good to know</h2>
          <ul className="type-body flex list-disc flex-col gap-1 pl-5 text-[17px]">
            <li>A new puzzle goes live for everyone at 00:00 UTC.</li>
            <li>Settings let you switch the theme and add color letters (B, P, Y) inside every piece.</li>
            <li>Results and streaks are kept on this device. There are no accounts.</li>
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
