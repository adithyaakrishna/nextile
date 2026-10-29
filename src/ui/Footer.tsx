import Link from "next/link";
import type { AttributionPlacement } from "@/config";
import { AttributionLink } from "./AttributionLink";
import { teenyTinyHref } from "./teeny-tiny";

const LINKS = [
  { href: "/how-to-play", label: "How to play" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
] as const;

export function Footer({ placement = "footer" }: { placement?: AttributionPlacement }) {
  return (
    <footer className="mt-12 flex flex-col gap-3 border-t-[3px] border-current/15 pb-8 pt-5 text-on-mat">
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="type-label link inline-flex min-h-[44px] items-center">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="type-small text-on-mat-soft">
        <AttributionLink href={teenyTinyHref(placement)} placement={placement}>
          Built on Teeny Tiny Computer
        </AttributionLink>
      </p>
    </footer>
  );
}
