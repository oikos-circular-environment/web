function DotField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 text-muted-foreground/60"
      style={{
        backgroundImage:
          "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
        backgroundSize: "26px 26px",
        maskImage:
          "linear-gradient(to bottom, transparent, black 160px, black calc(100% - 160px), transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 160px, black calc(100% - 160px), transparent)",
      }}
    />
  );
}

export { DotField };
