# T03 — Hero estático

Executor: subagente sonnet — layout e tipografia a partir de specs numéricas já medidas, sem WebGL ainda (isso é T05).

Depende de T01 (rota livre) e T02 (primitivas glass).

## Specs medidas no fora.so (Playwright, viewport 1440×900)

| Elemento | Spec |
|---|---|
| H1 | `56px / 72.8px`, weight 400, `letter-spacing: -2.24px` (−0.04em), cor `#fff3f0` |
| Corpo/nav | `14px / 21px`, `letter-spacing: -0.28px`, `rgba(255,255,255,.8)` |
| Nav | full-width `h-12`, `px-10`, fundo **totalmente transparente** |
| CTA glass | `blur(5px)`, `bg-white/10`, `rounded-full`, sem borda/sombra, `h-9 px-6` |
| Fundo | imagem `object-fit: cover` + gradiente escuro por cima para contraste do texto |

## Estrutura (compound)

`hero/index.tsx` exporta `Hero.Root / .Nav / .Badge / .Title / .Subtitle / .Actions`, usando `ui/glass-button.tsx` e `ui/glass-panel.tsx` de T02.

Nesta etapa o fundo é **imagem estática** (placeholder ou a `pristine` de T04 se já estiver pronta) — o canvas WebGL entra em T05, substituindo o `<Image>` de fundo sem mexer no restante do hero.

`page.tsx` em `(public)/page.tsx` compõe `<Hero.Root>` e permanece **Server Component**.

## Checklist

- [x] `hero/index.tsx` como compound
- [x] `hero/hero-nav.tsx` — nav transparente, links 14px `rgba(255,255,255,.8)`
- [x] Badge, H1 (56px/72.8px/-0.04em/#fff3f0), subcopy, dois CTAs (`glass` + `solid`)
- [x] Fundo com imagem estática + gradiente
- [x] `page.tsx` compondo `Hero.Root`, ainda Server Component
- [x] Responsivo em 390px / 768px / 1440px
- [x] `npm run lint` e `npx tsc --noEmit` limpos
