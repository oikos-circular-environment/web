# T07 — Seções 2, 4, 5, 6 (layout + copy já escrita)

Executor: subagente haiku — layout e copy já prontos, baixo risco de julgamento.

Depende de T02 (primitivas `ui/section.tsx`, `ui/glass-button.tsx`) e T06 (`use-anime-scope`/`onScroll` para o reveal).

Copy consolidada de `plans/landing-page/02-problema/`, `04-publicos/`, `05-denuncia/`, `06-cta-final/` — reaproveitar **literalmente**, sem reescrever.

## Seção 2 — Manifesto (`manifesto/`)

- Overline: `POR QUE ISSO IMPORTA`
- H2: "Reciclar dá certo quando é fácil saber onde — e quando a gente enxerga valor no que sobra."
- Corpo: "Aquilo que parece descarte pode ser matéria-prima, renda ou solução para outra pessoa. Nem sempre o resíduo vale dinheiro para quem separa — mas pode valer para quem coleta, compra, transforma ou precisa daquele material."
- Fecho: "A provocação é simples: separar, avisar e encontrar o destino certo já muda o caminho do resíduo."

Fundo claro (`#FAF9F4`, tom editorial — contrasta com o hero escuro). Reveal em `Section.Body` via `onScroll`.

## Seção 4 — Públicos (`audiences/`)

- Overline: `PRA QUEM É`
- H2: "Um app, dois jeitos de usar."
- Coluna 1 — Cidadão
  - H3: "Quero saber pra onde levar meu resíduo"
  - Body: mapa de pontos de coleta perto de você, filtrado por tipo de material e horário de funcionamento; denúncia de descarte irregular com foto e localização.
  - CTA: "Baixar o app"
- Coluna 2 — Empresa/Ecoponto
  - H3: "Tenho um ponto de coleta"
  - Body: cadastre horário, serviços oferecidos e tipos de resíduo aceitos — apareça pra quem está procurando exatamente o que você recebe.
  - CTA: "Cadastrar meu ponto de coleta"

Duas colunas lado a lado (desktop) → empilhadas (mobile). Hover lift `translateY(-8px)` + sombra, 200ms.

## Seção 5 — Denúncia (`report/`)

- Overline: `DENÚNCIA CIDADÃ`
- H2: "Viu descarte irregular? Registre em 3 passos."
- Passos:
  1. Tire uma foto do local
  2. Confirme a localização (geolocalização automática)
  3. Acompanhe o status até a resolução
- Fecho: "Sua denúncia pode ser encaminhada a órgãos públicos de fiscalização — e você acompanha o que acontece com ela, sem ficar no escuro depois de enviar."
- CTA: "Fazer uma denúncia"

Acento âmbar (`#B8842A` do `DESIGN.md`) pontual — nunca terracota (reservada para narrativa de transformação) nem vermelho de erro.

## Seção 6 — CTA final + footer (`closing/`)

- H2: "Pronto pra dar destino certo ao que sobra?"
- Bloco mobile: badges de loja (App Store / Google Play)
- Bloco web: botão "Cadastrar meu ponto de coleta" (mesmo destino da seção 4)
- Footer: links legais (Termos de Uso, Política de Privacidade — já existem em `(institutional)/`), contato `suporte@oikos.company`. Sem seção de "confiança institucional" — decisão já registrada no plano de conteúdo.

## Checklist

- [x] `manifesto/index.tsx` com a copy acima, fundo claro
- [x] `audiences/index.tsx` com as duas colunas + hover lift
- [x] `report/index.tsx` com os 3 passos + acento âmbar
- [x] `closing/index.tsx` com H2, CTA e footer (linkando `(institutional)/termos-de-uso`, `politica-de-privacidade`)
- [x] Todas as 4 seções usando `ui/section.tsx` (compound) e reveal via `onScroll`
- [x] Responsivo em 390px / 768px / 1440px
- [x] `npm run lint` e `npx tsc --noEmit` limpos
