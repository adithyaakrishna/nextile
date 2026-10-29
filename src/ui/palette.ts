import type { Color } from "@/engine/domain";

// Puzzle content colors are fixed across themes so every player sees the same pieces
export const PIECE_HEX: Record<Color, string> = {
  blue: "#2349F2",
  pink: "#FF6EB0",
  yellow: "#FFD400",
};

export const PIECE_LETTERS: Record<Color, string> = { blue: "B", pink: "P", yellow: "Y" };

export const INK = "#000000";
export const PAPER = "#FFFFFF";
