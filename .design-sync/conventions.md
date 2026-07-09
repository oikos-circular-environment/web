## Setup

No provider wrapper is required — none of these 31 components read from React context for styling (no ThemeProvider needed to render correctly). They are plain Tailwind-styled components; just import and use.

Class merging: when composing variants conditionally, use `cn(...)` (clsx + tailwind-merge) rather than template-literal string concatenation, matching how every component here is implemented internally.

## Styling idiom

Tailwind v4 utility classes, driven by CSS custom properties defined in `styles.css` (compiled from the app's `globals.css`). Never hand-roll hex colors — use the semantic tokens below via their Tailwind utility form (`bg-primary`, `text-primary-foreground`, `border-border`, etc.):

| Token | CSS variable | Typical utility |
|---|---|---|
| Primary brand | `--primary` / `--primary-foreground` | `bg-primary`, `text-primary-foreground` |
| Secondary | `--secondary` / `--secondary-foreground` | `bg-secondary` |
| Destructive | `--destructive` | `bg-destructive/10`, `text-destructive` |
| Muted | `--muted` / `--muted-foreground` | `bg-muted`, `text-muted-foreground` |
| Accent | `--accent` / `--accent-foreground` | `bg-accent` |
| Page background / text | `--background` / `--foreground` | `bg-background`, `text-foreground` |
| Card surface | `--card` / `--card-foreground` | `bg-card` |
| Popover surface | `--popover` / `--popover-foreground` | `bg-popover` |
| Border / input / ring | `--border` / `--input` / `--ring` | `border-border`, `border-input`, `ring-ring` |
| Chart series | `--chart-1` … `--chart-5` | `bg-chart-1` … `bg-chart-5` |
| Sidebar surface | `--sidebar`, `--sidebar-accent`, `--sidebar-primary`, `--sidebar-border`, `--sidebar-ring` | `bg-sidebar`, `bg-sidebar-accent` |

Fonts: `--font-sans` (body/UI), `--font-heading` (headings — use the `font-heading` utility class), `--font-geist-mono` (code, mapped to the `mono` family).

Radius: derived from a single base `--radius`, exposed as `--radius-md` etc. — use `rounded-md`, `rounded-lg`, not hardcoded pixel radii.

Dark mode: class-based (`.dark` on an ancestor toggles the dark values of every token above) — components never need dark-mode-specific classes, the same utility class resolves differently under `.dark`.

## Where the truth lives

- `styles.css` (root) — import closure for every token and component style a rendered design receives.
- `_ds_bundle.css` — the actual compiled Tailwind output (`@import`ed from `styles.css`); read it directly for the full utility-class vocabulary beyond the semantic tokens table above.
- `components/general/<Name>/<Name>.prompt.md` — per-component usage reference and prop contract.

## Example

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from 'oikos-web';

function Example() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Coleta agendada</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Amanhã, 09:00</span>
        <Button variant="default" size="sm">
          Confirmar
        </Button>
      </CardContent>
    </Card>
  );
}
```
