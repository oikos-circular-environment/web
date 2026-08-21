# T01 — Route group `(institutional)`

Executor: `opencode/big-pickle` (free) — mecânico e verificável.

`(public)/layout.tsx` injeta `SiteHeader` + `SiteFooter` em toda rota pública. A landing (T03) tem nav própria, então as rotas institucionais precisam de layout separado, sem que nenhuma URL mude.

```
src/app/(public)/
├── layout.tsx                 → passa a ser só {children}
├── page.tsx                   → LANDING (T03+)
└── (institutional)/
    ├── layout.tsx             → SiteHeader + SiteFooter (conteúdo do layout atual)
    ├── login/  registro/  suporte/  verify-email/
    ├── politica-de-privacidade/  termos-de-uso/
    └── design-system/
```

Route group não entra na URL — `/login` e `/registro` continuam idênticos.

## Checklist

- [ ] Criar `(public)/(institutional)/` e mover login, registro, suporte, verify-email, política, termos, design-system
- [ ] Mover o conteúdo do `(public)/layout.tsx` atual para `(institutional)/layout.tsx`
- [ ] Reduzir `(public)/layout.tsx` a `{children}`
- [ ] Confirmar que nenhuma URL mudou e que nenhum arquivo de rota foi editado (só movido)
- [ ] `npm run dev` e checar manualmente `/login`, `/registro`, `/suporte`, `/termos-de-uso`, `/design-system`
