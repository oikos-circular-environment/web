import type { CursorState } from "../hooks/use-demo-puppet";

function SimulatedCursor({ state }: { state: CursorState }) {
  if (!state.visible) return null;

  return (
    <div
      className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{ left: state.x, top: state.y }}
    >
      <span
        aria-hidden
        className="absolute inset-0 -m-2 rounded-full bg-primary/40 transition-all duration-500 ease-out"
        style={{
          opacity: state.pressing ? 0 : 0.5,
          transform: state.pressing ? "scale(2.2)" : "scale(0.6)",
        }}
      />
      <span
        aria-hidden
        className="block size-7 rounded-full border border-white/60 bg-foreground/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: state.pressing ? "scale(0.9)" : "scale(1)" }}
      />
    </div>
  );
}

export { SimulatedCursor };
