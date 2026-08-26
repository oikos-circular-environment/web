import type { ManifestoBeat } from "./beats";
import { MANIFESTO_BEATS } from "./beats";

const OVERLINE_TEXT_WEIGHT = 1;
const OVERLINE_BADGE_WEIGHT = 0.4;
const PRIMARY_WEIGHT = 1;
const SECONDARY_WEIGHT = 1;
const CHIP_WEIGHT = 0.6;

type WeightedStage = { weight: number; start: number; end: number };

type BeatStages = {
  beatRange: WeightedStage;
  primary: WeightedStage;
  secondary?: WeightedStage;
  chips?: WeightedStage[];
};

type OverlineStages = {
  text: WeightedStage;
  badge: WeightedStage;
};

function buildManifestoStages(beats: ManifestoBeat[]): {
  overline: OverlineStages;
  beats: BeatStages[];
  totalWeight: number;
} {
  let cursor = 0;

  const overlineTextStart = cursor;
  cursor += OVERLINE_TEXT_WEIGHT;
  const overlineText: WeightedStage = {
    weight: OVERLINE_TEXT_WEIGHT,
    start: overlineTextStart,
    end: cursor,
  };

  const overlineBadgeStart = cursor;
  cursor += OVERLINE_BADGE_WEIGHT;
  const overlineBadge: WeightedStage = {
    weight: OVERLINE_BADGE_WEIGHT,
    start: overlineBadgeStart,
    end: cursor,
  };

  const result: BeatStages[] = beats.map((beat) => {
    const beatStart = cursor;

    const primaryStart = cursor;
    cursor += PRIMARY_WEIGHT;
    const primary: WeightedStage = {
      weight: PRIMARY_WEIGHT,
      start: primaryStart,
      end: cursor,
    };

    let secondary: WeightedStage | undefined;
    if (beat.secondary) {
      const secondaryStart = cursor;
      cursor += SECONDARY_WEIGHT;
      secondary = {
        weight: SECONDARY_WEIGHT,
        start: secondaryStart,
        end: cursor,
      };
    }

    const chips = beat.items?.map(() => {
      const chipStart = cursor;
      cursor += CHIP_WEIGHT;
      return { weight: CHIP_WEIGHT, start: chipStart, end: cursor };
    });

    return {
      beatRange: { weight: cursor - beatStart, start: beatStart, end: cursor },
      primary,
      secondary,
      chips,
    };
  });

  return {
    overline: { text: overlineText, badge: overlineBadge },
    beats: result,
    totalWeight: cursor,
  };
}

const MANIFESTO_STAGES = buildManifestoStages(MANIFESTO_BEATS);

export type { BeatStages, OverlineStages, WeightedStage };
export { buildManifestoStages, MANIFESTO_STAGES };
