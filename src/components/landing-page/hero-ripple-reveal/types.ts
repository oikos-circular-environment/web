type RippleQuality = "low" | "medium" | "high";

interface RippleRevealConfig {
  brushSize: number;
  spread: number;
  fade: number;
  spacing: number;
  strength: number;
  swirl: number;
  rings: number;
  dispersion: number;
  glint: number;
  revealGain: number;
  revealEdge: [number, number];
  revealMax: number;
  tint: [number, number, number];
  tintAmount: number;
  grayscale: number;
}

interface RippleRevealProps {
  pristineSrc: string;
  degradedSrc: string;
  alt: string;
  quality?: RippleQuality;
  className?: string;
  brushSize?: number;
  spread?: number;
  fade?: number;
  spacing?: number;
  strength?: number;
  swirl?: number;
  rings?: number;
  dispersion?: number;
  glint?: number;
  revealGain?: number;
  revealEdge?: [number, number];
  revealMax?: number;
  tint?: [number, number, number];
  tintAmount?: number;
  grayscale?: number;
}

export type { RippleQuality, RippleRevealConfig, RippleRevealProps };
