# T08 — Produto em ação (sticky scroll)

Executor: `opencode` free para a transliteração das telas (mecânico e volumoso) + subagente sonnet para o sticky scroll (state machine, motion).

Depende de T02 (hooks, `use-scroll-sync`), T06 (`onScroll`) e é a seção mais cara — vai por último.

## Atalho descoberto na exploração

As telas **não precisam ser inferidas de imagem**. O app mobile já as implementa em código, usando **NativeWind 5 + Tailwind 4** — ou seja, já escritas com as mesmas classes Tailwind do web:

- `mobile/src/app/(tabs)/market/index.tsx` — mapa/lista de pontos de coleta
- `mobile/src/app/(tabs)/complaints/index.tsx` — denúncia
- `mobile/src/app/(tabs)/(home)/sign-in.tsx` — login
- `mobile/src/app/(tabs)/(home)/sign-up.tsx` — registro

Reconstruir vira transliteração: `<View>`→`<div>`, `<Text>`→`<span>`/`<p>`, **preservando o `className`** (ex. `w-16 h-16 rounded-lg`, `h-6 w-20 rounded-full` já existem literalmente no código mobile). Fidelidade muito maior que ler PNG, e mais rápido.

`mobile/pencil/oikos-pencil.pen` é a fonte de verdade para o que o código não cobre (espaçamento de canvas, estados de tela não implementados). As screens em `/home/ccrs/Imagens/oikos-screens/screens-v2/` (já vêm dentro de moldura de iPhone — **não usar como imagem final**, servem só de conferência visual) validam o resultado.

## Legendas por tela (copy já escrita, `03-produto-em-acao/README.md`)

1. Login — "Sem burocracia pra começar."
2. Cadastro — "Seu endereço, seu ponto de partida."
3. Mapa — "Ache o ponto certo pro seu resíduo."
4. Cadastrar ponto de coleta — "Sua empresa, visível pra quem procura."
5. Denúncia — "Registrou, documentou, foi encaminhado."

## Estrutura

`device-frame.tsx` — carcaça do telefone em DOM/CSS, **sem moldura duplicada** (as screens-v2 já vêm com moldura; aqui construímos do zero a partir das telas transliteradas, então a carcaça é nossa, uma vez só).

`product-showcase/index.tsx` — sticky scroll: telefone fixo à direita (`position: sticky`), legendas rolando à esquerda. Progresso 0→1 via `use-scroll-sync` (`onScroll({sync:true})` do anime.js). Transição de 350ms por troca de estado (fade out 150ms → swap de conteúdo → fade in 200ms), `cubic-bezier(0.4, 0, 0.2, 1)`.

Abaixo de 768px: sem sticky, reflow para largura total, scroll normal — mudança de estado ainda dispara por `IntersectionObserver`.

## Checklist

- [ ] `device-frame.tsx` — carcaça própria em DOM/CSS
- [ ] `screens/login.tsx`, `screens/signup.tsx`, `screens/map.tsx`, `screens/company-register.tsx`, `screens/report.tsx` — transliteradas de `mobile/src/app/(tabs)/`, `className` preservado
- [ ] Dados mockados nas telas (sem chamada real de API)
- [ ] `product-showcase/index.tsx` com sticky scroll + state machine de 5 telas
- [ ] Transição 350ms (150 out → swap → 200 in) via `use-anime-scope`
- [ ] Legendas laterais sincronizadas com o estado ativo
- [ ] Mobile (<768px): sem sticky, reflow, `IntersectionObserver` disparando a troca
- [ ] Conferência visual contra `screens-v2` (moldura descartada, só o conteúdo interno)
- [ ] `npm run lint` e `npx tsc --noEmit` limpos
