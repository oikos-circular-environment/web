import { cn } from "@/libs/utils";

type StoreBadgeGlyphProps = {
  d: string;
  size?: number;
  className?: string;
};

function StoreBadgeGlyph({ d, size = 26, className }: StoreBadgeGlyphProps) {
  return (
    <div
      data-badge-icon-wrapper
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size, transform: "scale(0.8)" }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <path
          d={d}
          data-badge-icon="stroke"
          fill="none"
          pathLength={1}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.4}
          style={{ strokeDasharray: "1 1", strokeDashoffset: 1 }}
        />
        <path
          d={d}
          data-badge-icon="fill"
          fill="currentColor"
          stroke="none"
          style={{ opacity: 0 }}
        />
      </svg>
    </div>
  );
}

export { StoreBadgeGlyph };
