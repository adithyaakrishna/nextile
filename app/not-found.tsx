import Link from "next/link";
import { PageShell } from "@/ui/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <section className="panel flex flex-col items-start gap-4 p-6">
        <h1 className="type-heading text-[25px]">Nothing here</h1>
        <p className="type-body text-[17px]">That page doesn&apos;t exist, or it isn&apos;t public yet.</p>
        <Link href="/" className="btn btn-signal press">
          Go to today&apos;s puzzle
        </Link>
      </section>
    </PageShell>
  );
}
