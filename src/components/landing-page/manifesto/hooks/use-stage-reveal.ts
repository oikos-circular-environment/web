import type { WeightedStage } from "../manifesto-stages";
import { MANIFESTO_STAGES } from "../manifesto-stages";

const BEAT_FADE_MARGIN = 0.25;
const STAGE_FADE_IN = 0.25;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function beatOpacityAt(scaled: number, range: WeightedStage) {
  if (scaled >= range.start && scaled <= range.end) return 1;
  if (scaled < range.start) {
    return clamp01(1 - (range.start - scaled) / BEAT_FADE_MARGIN);
  }
  return clamp01(1 - (scaled - range.end) / BEAT_FADE_MARGIN);
}

function stageOpacityAt(scaled: number, stage: WeightedStage) {
  return clamp01((scaled - stage.start) / STAGE_FADE_IN);
}

function stageLocalProgressAt(scaled: number, stage: WeightedStage) {
  return clamp01((scaled - stage.start) / stage.weight);
}

type StageReveal = {
  beatOpacity: number;
  primaryProgress: number;
  secondaryProgress?: number;
  chipOpacities?: number[];
};

function useStageReveal(progress: number): StageReveal[] {
  const scaled = progress * MANIFESTO_STAGES.totalWeight;

  return MANIFESTO_STAGES.beats.map((beat) => ({
    beatOpacity: beatOpacityAt(scaled, beat.beatRange),
    primaryProgress: stageLocalProgressAt(scaled, beat.primary),
    secondaryProgress: beat.secondary
      ? stageLocalProgressAt(scaled, beat.secondary)
      : undefined,
    chipOpacities: beat.chips?.map((chip) => stageOpacityAt(scaled, chip)),
  }));
}

type OverlineReveal = {
  textProgress: number;
  badgeOpacity: number;
};

function useOverlineReveal(progress: number): OverlineReveal {
  const scaled = progress * MANIFESTO_STAGES.totalWeight;
  const { text, badge } = MANIFESTO_STAGES.overline;

  return {
    textProgress: stageLocalProgressAt(scaled, text),
    badgeOpacity: stageLocalProgressAt(scaled, badge),
  };
}

export { useOverlineReveal, useStageReveal };
