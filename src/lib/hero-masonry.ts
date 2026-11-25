import type { HomeHeroMasonryColumns, HomeHeroMasonryImage } from "@/data/siteMarketingDefaults";
import { homeHeroMasonryColumns } from "@/data/siteMarketingDefaults";

const COLUMN_COUNT = 4;
const IMAGES_PER_COLUMN = 5;

/** Ensure a stable 4×5 grid, filling gaps from defaults. */
export function normalizeHeroMasonry(
  input?: HomeHeroMasonryColumns | null,
): HomeHeroMasonryColumns {
  const defaults = homeHeroMasonryColumns;
  const columns: HomeHeroMasonryImage[][] = [];

  for (let c = 0; c < COLUMN_COUNT; c++) {
    const fromInput = Array.isArray(input?.[c]) ? input![c]! : [];
    const fallback = defaults[c] ?? defaults[0]!;
    const col: HomeHeroMasonryImage[] = [];
    for (let i = 0; i < IMAGES_PER_COLUMN; i++) {
      const item = fromInput[i];
      const def = fallback[i] ?? fallback[0]!;
      if (item?.src?.trim()) {
        col.push({
          src: item.src.trim(),
          tall: item.tall ?? def.tall,
          alt: item.alt?.trim() || def.alt,
        });
      } else {
        col.push({ ...def });
      }
    }
    columns.push(col);
  }

  return columns;
}
