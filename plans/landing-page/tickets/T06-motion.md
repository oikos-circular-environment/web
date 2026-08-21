# T06 — Motion (anime.js v4)

Executor: subagente sonnet — API nova (v4), passar os trechos de doc já levantados via Context7 (`createScope`, `onScroll`, `stagger`).

Depende de T02 (hooks) e T03 (hero pronto para animar).

## API v4 (Context7, `/websites/animejs`)

```ts
import { animate, createScope, stagger } from 'animejs';
import { useEffect, useRef } from 'react';

const root = useRef(null);
const scope = useRef(null);

useEffect(() => {
  scope.current = createScope({
    root,
    mediaQueries: { reducedMotion: '(prefers-reduced-motion)' },
  }).add(() => {
    animate('.hero-rise', {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 1000,
      ease: 'cubicBezier(.44, 0, .56, 1)',
      delay: stagger(120),
    });
  });
  return () => scope.current.revert();
}, []);
```

`onScroll` para reveal por seção:

```ts
import { animate, onScroll } from 'animejs';

animate('.section-reveal', {
  opacity: [0, 1],
  translateY: [40, 0],
  autoplay: onScroll({ enter: 'bottom-=50 top', sync: true }),
});
```

Easings medidos no fora.so (Playwright): entrada 1000ms `cubic-bezier(.44, 0, .56, 1)`, mais um grupo de springs de 500ms com stagger.

## Checklist

- [x] `hooks/use-anime-scope.ts` finalizado com `createScope({root, mediaQueries.reducedMotion})`
- [x] Entrada do hero com `stagger()` e o easing medido, a 1000ms
- [ ] Reveal por seção via `onScroll()` nas seções 2, 4, 5, 6 (T07)
- [x] `mediaQueries.reducedMotion` desativando movimento sem remover conteúdo
- [x] Cleanup confirmado: `scope.revert()` ao desmontar, sem leak de listener
- [x] `npm run lint` e `npx tsc --noEmit` limpos
- [x] Verificação visual via Playwright: entrada com stagger em ~300ms, tudo estável em opacity:1 por volta de 1100-1400ms, `prefers-reduced-motion` mostra o hero pronto sem replay
- [x] Bug encontrado e corrigido: `animejs` 4.5.0 removeu o easing por string — `ease: "cubicBezier(.44,0,.56,1)"` emitia warning no console e provavelmente caía num easing default, não a curva medida. Corrigido para `ease: cubicBezier(0.44, 0, 0.56, 1)` importando a função de `animejs` (`hero-entrance.tsx`)
