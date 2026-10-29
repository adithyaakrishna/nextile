import type { Metadata } from "next";
import { AttributionLink } from "@/ui/AttributionLink";
import { PageShell } from "@/ui/PageShell";
import { teenyTinyHref } from "@/ui/teeny-tiny";
import { TrackAboutView } from "@/ui/TrackView";

export const metadata: Metadata = {
  title: "About · Nextile",
  description: "Nextile is a daily sixty-second visual logic puzzle, built on Teeny Tiny Computer.",
};

// [Confirm] every factual clause about Teeny Tiny Computer against the real deployment before launch
export default function AboutPage() {
  return (
    <PageShell placement="about">
      <TrackAboutView />
      <article className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h1 className="type-display text-[36px] sm:text-[48px]">About Nextile</h1>
          <p className="type-body text-[17px]">
            Nextile is a daily logic puzzle. Everyone gets the same sequence of tiles at 00:00 UTC. You have sixty seconds and one try to pick what comes
            next.
          </p>
          <p className="type-body text-[17px]">
            Every puzzle is written from a rule and checked by a solver that looks for every other reading a reasonable person might see, so exactly one answer
            fits.
          </p>
        </section>

        <section id="teeny-tiny-computer" className="panel flex scroll-mt-6 flex-col gap-3 p-6">
          <h2 className="type-heading text-[22px] sm:text-[25px]">Built on Teeny Tiny Computer</h2>
          <p className="type-body text-[17px]">
            Nextile was built by an AI agent, and it is designed to run on a single Teeny Tiny Computer: the pages, the puzzle server and the database all on
            one small machine.
          </p>
          <p className="type-body text-[17px]">If you build software with agents, Teeny Tiny Computer gives your agent a computer of its own.</p>
          <p>
            <AttributionLink href={teenyTinyHref("about")} placement="about" className="btn press">
              See what it is
            </AttributionLink>
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
