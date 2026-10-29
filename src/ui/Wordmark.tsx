import Link from "next/link";

interface WordmarkProps {
  size?: "header" | "small";
}

// A paper tile, like the puzzle pieces, holding a stopwatch dial with a three-quarter wedge in signal orange. It never animates.
export function TileMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="44" height="44" rx="9" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
      <rect x="20" y="7" width="8" height="5" rx="1.5" fill="#000000" />
      <circle cx="24" cy="26" r="13" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
      <path d="M24 26 V15.5 A10.5 10.5 0 1 1 13.5 26 Z" fill="var(--signal)" />
      <circle cx="24" cy="26" r="2.4" fill="#000000" />
    </svg>
  );
}

export function WordmarkText({ size = "header" }: WordmarkProps) {
  const text = size === "header" ? "text-[22px] min-[400px]:text-[26px] sm:text-[36px]" : "text-[18px]";
  return (
    <span className={`type-wordmark inline-flex items-center gap-[0.22em] whitespace-nowrap uppercase ${text}`}>
      <TileMark className="h-[1.2em] w-[1.2em] shrink-0" />
      <span>Nextile</span>
    </span>
  );
}

export function Wordmark({ size = "header" }: WordmarkProps) {
  return (
    <Link href="/" className="focus-ring rounded-md">
      <WordmarkText size={size} />
    </Link>
  );
}
