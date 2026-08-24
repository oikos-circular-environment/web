import { cn } from "@/libs/utils";

const STAGGER_SPAN = 0.7;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

type SplitRevealProps = {
  text: string;
  progress: number;
  className?: string;
  as?: "p" | "h2";
};

function SplitReveal({
  text,
  progress,
  className,
  as: Tag = "p",
}: SplitRevealProps) {
  const words = text.split(" ");
  const count = words.length;
  const unitWindow = count > 1 ? 1 - STAGGER_SPAN : 1;

  return (
    <Tag className={cn(className)}>
      {words.map((word, index) => {
        const unitStart = count > 1 ? (index / (count - 1)) * STAGGER_SPAN : 0;
        const wordOpacity = clamp01((progress - unitStart) / unitWindow);

        return (
          <span
            className="inline-block"
            // biome-ignore lint/suspicious/noArrayIndexKey: lista de palavras é derivada de `text`, fixa por render, nunca reordena
            key={`${word}-${index}`}
            style={{
              opacity: wordOpacity,
              transform: `translateY(${(1 - wordOpacity) * 12}px)`,
            }}
          >
            {word}
            {index < count - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}

export type { SplitRevealProps };
export { SplitReveal };
