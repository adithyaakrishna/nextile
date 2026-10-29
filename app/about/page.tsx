import type { Metadata } from "next";
import { PageShell } from "@/ui/PageShell";
import { TrackAboutView } from "@/ui/TrackView";

export const metadata: Metadata = {
  title: "About · Nextile",
  description: "Nextile is a daily sixty-second visual logic puzzle. Find the pattern, pick the next tile. One try.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <TrackAboutView />
      <article className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h1 className="type-display text-[36px] sm:text-[48px]">About Nextile</h1>
          <p className="type-body text-[17px]">
            Nextile is a daily logic puzzle. Everyone gets the same sequence of tiles at 00:00 UTC. You have sixty seconds and one try to pick what comes next.
          </p>
        </section>

        <section className="panel flex flex-col gap-3 p-6">
          <h2 className="type-heading text-[22px] sm:text-[25px]">How the puzzles are made</h2>
          <p className="type-body text-[17px]">
            Every puzzle is written from a rule and checked by a solver that looks for every other reading a reasonable person might see, so exactly one answer
            fits. Difficulty is worked out from the rule itself rather than picked by hand.
          </p>
          <p className="type-body text-[17px]">
            The clock runs on the server, the tiles only reach your browser when you press Start, and the answer stays on the server until you&apos;ve finished.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-heading text-[22px] sm:text-[25px]">Privacy</h2>
          <p className="type-body text-[17px]">
            No accounts. A random ID in a cookie makes sure each browser gets one try a day. We count page views and game events to improve the game. We
            don&apos;t collect names, email addresses or locations, and IP addresses are never stored.
          </p>
        </section>
      </article>
    </PageShell>
  );
}
