import { formatChallengeNumber } from "@/config";
import { HeaderControls } from "./HeaderControls";
import { Wordmark } from "./Wordmark";

export function Header({ number = null }: { number?: number | null }) {
  return (
    <header className="flex h-[52px] items-center justify-between gap-3 sm:h-16">
      <div className="flex min-w-0 items-end gap-3">
        <Wordmark />
        {number !== null && (
          <span className="type-heading hidden pb-[1px] text-[17px] min-[360px]:inline sm:text-[22px]">
            <span className="sr-only">Challenge </span>
            {formatChallengeNumber(number)}
          </span>
        )}
      </div>
      <HeaderControls />
    </header>
  );
}
