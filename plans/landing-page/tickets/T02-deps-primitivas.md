# T02 — Dependências e primitivas

Executor: subagente sonnet — precisa seguir o molde de `src/components/ui/button.tsx` (cva, `data-slot`, `Slot` de `radix-ui`, export nomeado), não inventar padrão novo.

Toda a landing vive isolada em `src/components/landing-page/`:

```
src/components/landing-page/
├── index.ts
├── ui/
│   ├── glass-button.tsx      cva com a receita medida do fora.so
│   ├── glass-panel.tsx       blur(24px) / rgba(23,23,23,.85)
│   ├── section.tsx           Section.Root/.Header/.Overline/.Title/.Body
│   └── reveal.tsx            wrapper de entrada com stagger (usa hooks/use-anime-scope)
└── hooks/
    ├── use-anime-scope.ts    createScope({root}) + revert() no cleanup
    ├── use-scroll-sync.ts    onScroll({sync}) → progresso 0..1
    └── use-webgl-support.ts
```

## `ui/glass-button.tsx` — receita medida no fora.so (Playwright)

Não "melhorar" o vidro: sem borda, sem sombra, blur baixo. É a contenção que produz o efeito caro.

```
base:  inline-flex items-center justify-center rounded-full
       backdrop-blur-[5px] bg-white/10 text-landing-ink
       transition-colors hover:bg-white/[0.16]
size:  sm → h-8 px-4 text-sm   (nav, medido 96×32)
       md → h-9 px-6 text-sm   (CTA do hero, medido 109×36)
tone:  glass   → o acima
       solid   → bg-primary text-primary-foreground   (CTA de conversão, verde #3f6212)
```

`ui/glass-panel.tsx`: `backdrop-blur-[24px] bg-[#171717]/85`, variante de card flutuante com `shadow-[0_1px_32px_rgba(0,0,0,.35)]`.

## Tokens da landing (`globals.css`)

O `globals.css` atual é claro e quente (`--background: #faf9f4`) — não tocar nos tokens existentes. Adicionar bloco com escopo próprio:

```css
@theme {
  --color-landing-ink: #fff3f0;
  --color-landing-muted: rgb(255 255 255 / 0.8);
  --animate-rise: rise 1s cubic-bezier(.44, 0, .56, 1) both;
  @keyframes rise { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
}
```

O verde `#3f6212` do `DESIGN.md` continua sendo a única cor de ação nos CTAs sólidos.

## Checklist

- [x] `npm i three animejs` + `npm i -D @types/three`
- [x] `ui/glass-button.tsx` (variantes glass/solid, tamanhos sm/md)
- [x] `ui/glass-panel.tsx`
- [x] `ui/section.tsx` (compound: Root/Header/Overline/Title/Body)
- [x] `ui/reveal.tsx`
- [x] `hooks/use-anime-scope.ts`
- [x] `hooks/use-scroll-sync.ts`
- [x] `hooks/use-webgl-support.ts`
- [x] Tokens `@theme` adicionados sem alterar os existentes
- [x] `npm run lint` e `npx tsc --noEmit` limpos
