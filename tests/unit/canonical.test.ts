import { describe as group, expect, it } from "vitest";
import { canonical, distinctRotations, isCanonical, looksSame, tileKey } from "@/engine/canonical";
import { describe } from "@/engine/describe";
import { CELLS, COLORS, COUNTS, FILLS, ROTATIONS, SHAPES, type Tile } from "@/engine/domain";

const t = (partial: Partial<Tile>): Tile => ({ shape: "circle", color: "blue", fill: "solid", rotation: 0, count: 1, cell: 4, ...partial });

function everyTile(): Tile[] {
  const out: Tile[] = [];
  for (const shape of SHAPES)
    for (const color of COLORS)
      for (const fill of FILLS)
        for (const rotation of ROTATIONS)
          for (const count of COUNTS) for (const cell of CELLS) out.push({ shape, color, fill, rotation, count, cell });
  return out;
}

group("visual equivalence", () => {
  it("knows which rotations are visible", () => {
    expect(distinctRotations("triangle", "solid")).toBe(4);
    expect(distinctRotations("circle", "solid")).toBe(1);
    expect(distinctRotations("square", "striped")).toBe(2);
  });

  it("treats a solid circle as identical at every rotation", () => {
    expect(looksSame(t({ rotation: 0 }), t({ rotation: 270 }))).toBe(true);
    expect(isCanonical(t({ rotation: 90 }))).toBe(false);
  });

  it("treats striped squares at 0° and 180° as the same, but not 0° and 90°", () => {
    expect(looksSame(t({ shape: "square", fill: "striped", rotation: 0 }), t({ shape: "square", fill: "striped", rotation: 180 }))).toBe(true);
    expect(looksSame(t({ shape: "square", fill: "striped", rotation: 0 }), t({ shape: "square", fill: "striped", rotation: 90 }))).toBe(false);
  });

  it("ignores position unless there is a single symbol", () => {
    expect(canonical(t({ count: 2, cell: 0 })).cell).toBe(4);
    expect(looksSame(t({ count: 1, cell: 0 }), t({ count: 1, cell: 8 }))).toBe(false);
  });
});

group("describe", () => {
  it("matches the plan's examples", () => {
    expect(describe(t({ shape: "triangle", color: "yellow", rotation: 90 }))).toBe("one yellow solid triangle pointing right");
    expect(describe(t({ shape: "square", fill: "striped", rotation: 90, count: 2 }))).toBe("two blue striped squares, stripes running down to the right");
    expect(describe(t({ color: "pink", fill: "outline", cell: 0 }), { grid: true })).toBe("one pink outlined circle in the top-left corner");
  });

  it("gives tiles that look the same the same words, and tiles that look different different words", () => {
    for (const grid of [false, true]) {
      const byKey = new Map<string, string>();
      const byText = new Map<string, string>();
      for (const tile of everyTile()) {
        if (!grid && tile.cell !== 4 && tile.count === 1) continue;
        const key = tileKey(tile);
        const text = describe(tile, { grid });
        if (byKey.has(key)) expect(byKey.get(key)).toBe(text);
        byKey.set(key, text);
        if (byText.has(text)) expect(byText.get(text)).toBe(key);
        byText.set(text, key);
      }
    }
  });
});
