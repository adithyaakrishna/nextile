import { DIFFICULTY_LABELS, DIFFICULTY_LEVELS, type Difficulty } from "@/engine/difficulty";

// Filled squares plus the word, so the level never relies on color
export function DifficultyMark({ difficulty }: { difficulty: Difficulty }) {
  const level = DIFFICULTY_LEVELS[difficulty];
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-[3px]" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`block h-3 w-3 border-[2.5px] border-current ${n <= level ? "bg-current" : ""}`} />
        ))}
      </span>
      <span className="type-label text-[14px]">
        <span className="sr-only">Difficulty: </span>
        {DIFFICULTY_LABELS[difficulty]}
      </span>
    </span>
  );
}
