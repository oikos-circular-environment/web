import growingPlant from "@/assets/lord-icons/wired-outline-1827-growing-plant-hover-pinch.json";

const ICON_POOL = [growingPlant];

type LordIconData = (typeof ICON_POOL)[number];

function pickRandomIcon(): LordIconData {
  const icon = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
  return icon ?? growingPlant;
}

export type { LordIconData };
export { pickRandomIcon };
