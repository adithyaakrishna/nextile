import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { challengeNumber, formatChallengeNumber } from "@/config";
import { sharedResult } from "@/server/attempts";
import { serverNow } from "@/server/clock";
import { sharedHeadline, sharedTitle } from "@/share/describe-result";
import { toDayKey } from "@/time/day";
import { PageShell } from "@/ui/PageShell";
import { TimeBar } from "@/ui/TimeBar";

interface SharePageProps {
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { shareId } = await params;
  const result = sharedResult(shareId);
  if (!result) return { title: "Nextile" };
  const title = sharedTitle(result);
  const description = "One visual logic puzzle a day. Sixty seconds, one try. Can you beat it?";
  return { title, description, openGraph: { title, description }, twitter: { title, description } };
}

// A shared result: the score and time only, never the tiles, the answer or the rule
export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;
  const result = sharedResult(shareId);
  if (!result) notFound();
  const todayNumber = challengeNumber(toDayKey(serverNow()));
  const isToday = todayNumber === result.number;

  return (
    <PageShell placement="share_page">
      <section className="panel flex flex-col items-start gap-5 p-6 sm:p-8">
        <h1 className="type-heading text-[26px] sm:text-[32px]">{sharedHeadline(result)}</h1>
        <p className="flex items-baseline gap-2">
          <span className="type-display text-[56px]">{result.score}</span>
          <span className="type-heading text-[20px]">/100</span>
        </p>
        <TimeBar result={result} />
        <p className="type-body text-[17px]">
          {isToday ? "Can you beat it?" : `Today's puzzle is ${formatChallengeNumber(todayNumber)}.`} One visual logic puzzle a day: find the pattern, pick what
          comes next. Sixty seconds, one try.
        </p>
        <Link href="/" className="btn btn-signal btn-big press">
          Play today&apos;s puzzle
        </Link>
      </section>
    </PageShell>
  );
}
