import { cn } from "@/libs/utils";
import { StoreBadgeGlyph } from "./store-badge-glyph";

type StoreBadgeProps = {
  href: string;
  storeName: string;
  iconD: string;
  ariaLabel: string;
};

function StoreBadge({ href, storeName, iconD, ariaLabel }: StoreBadgeProps) {
  return (
    <a
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl px-4 py-2.5",
        "backdrop-blur-[5px] bg-white/10 text-landing-ink transition-colors hover:bg-white/[0.16]",
      )}
      data-slot="store-badge"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <StoreBadgeGlyph d={iconD} size={22} />
      <span className="flex flex-col text-left leading-tight">
        <span className="text-sm font-medium">{storeName}</span>
      </span>
    </a>
  );
}

export { StoreBadge };
