# T08 — Produto em ação (sticky scroll)

Executor: `opencode` free para a transliteração das telas (mecânico e volumoso) + subagente sonnet para o sticky scroll (state machine, motion) e para a cena 3D de nuvem. A interação de scroll da Denúncia (imagem→telefone) e o shader de nuvem, por mexerem em `use-scroll-sync`/three.js, revisar à mão antes de marcar o checkbox — mesmo critério do T05.

Depende de T02 (hooks, `use-scroll-sync`), T05 (infra three.js — gate/lazy-mount/dispose, reaproveitada pela cena de nuvem), T06 (`onScroll`) e é a seção mais cara — vai por último.

## Ajustes de 2026-08-21 (revisão do usuário sobre o rascunho anterior)

Estado anterior deste ticket tinha 5 telas fixas (login, cadastro, mapa, cadastro de empresa, denúncia) — revisado para o seguinte:

| Decisão | Antes | Agora |
|---|---|---|
| Login/registro | Telas 1 e 2 do showcase | **Removidas** — não demonstram produto |
| Primeira tela | Login | **Home** (`r5km8p` no `.pen`), com efeito de nuvem 3D na entrada |
| "Mapa" | 1 tela chamada "Mapa" com legenda errada ("ache o ponto certo") | **Pontos de coleta**: é uma **listagem com filtros**, não mapa — mapa é exclusivo da Denúncia. Vira 3 sub-estados (listagem → detalhe geral → detalhe/simulação) |
| Cadastro de empresa | Tela 4 | **Removida da sequência** (confirmado com o usuário) — o "outro lado do marketplace" não entra neste showcase |
| Denúncia | Tela simples, réplica do form | **Interação dedicada**: foto grande de descarte que encolhe pro telefone conforme o scroll, revelando o mapa interativo por dentro |
| Tema | — | Só light. Variar bg/cor por seção é permitido, dark mode não é necessário no site nem no app |

## Ajustes de 2026-08-24 (revisão do usuário sobre a demonstração do produto)

A estratégia de demonstração mudou de novo: em vez de abrir pelo cadastro/login, o showcase entra direto na funcionalidade mais importante (pontos de coleta) e só mostra login de forma simulada, como ponte pro perfil. Sequência final, 6 beats:

1. **Home** (`screens/home.tsx`) — abertura com efeito de nuvem 3D (`cloud-reveal/`)
2. **Pontos de coleta** (`screens/pontos-de-coleta.tsx`)
3. **Denúncia** (`screens/report-map.tsx`) — interação dedicada foto→mapa (`report-reveal/`)
4. **Ponte de persona** (`screens/persona-bridge.tsx`, novo) — wrapper do `PersonaPicker` já existente, pré-seleciona a primeira persona (Cidadã) automaticamente pra quem só rola a página sem clicar
5. **Perfil** (`screens/profile.tsx`)
6. **Cadastro de empresa** (`screens/company-registration.tsx`) — aceito como está, funcionalidade real de cadastro de empresa continua incompleta, mas a tela é apresentada de forma completa

Cada beat ganhou um bloco de conteúdo com título + 2-3 tópicos curtos (feature highlights), sem numeração — copy em `product-showcase/beats.ts`, separado do `screens/registry.ts` (que continua servindo só `/device-preview`).

**Achado de implementação**: o `index.tsx` legado montava um `<DeviceFrame>` fixo por `article` no fallback mobile — ou seja, todas as telas ficavam montadas simultaneamente abaixo de 768px. Corrigido na reescrita: um segundo `IntersectionObserver` (`mobileActiveIndex`) garante que só a tela do beat mais visível monta por vez, também no mobile — necessário porque as telas novas fazem fetch real e uma delas monta um mapa MapLibre real.

**Achado de implementação (cloud-reveal)**: `renderer.forceContextLoss()` no cleanup do `CloudRevealCanvas` matava o contexto WebGL do `<canvas>`, e como o React (StrictMode em dev) remonta o efeito no mesmo nó DOM, o `WebGLRenderer` da segunda montagem herdava um contexto já morto (`getContext` retorna o mesmo contexto pro mesmo canvas, mesmo perdido). Corrigido removendo o `forceContextLoss()` do cleanup — só `renderer.dispose()`, que libera os recursos de GPU sem invalidar o contexto.

Todos os 6 beats validados rodando `/` localmente (sticky scroll desktop, crossfade, interpolação contínua da Denúncia, ponte de persona refletindo em tempo real em Perfil/Cadastro de empresa), `npm run lint`, `npx tsc --noEmit` e `npm run build` limpos.

## Sequência revisada (3 beats, não mais telas fixas 1:1)

1. **Home** — `screens/home.tsx`, réplica de `mobile/src/app/(tabs)/(home)/index.tsx` (HomeHero + carrossel de serviços). Entrada da seção com nuvem 3D revelando a ilha (ver abaixo).
2. **Pontos de coleta** — `screens/collection-points/{list,detail-general,detail-simulation}.tsx`, 3 sub-estados dentro do mesmo beat.
3. **Denúncia** — interação de imagem→mapa, não é mais "réplica de tela parada".

Legendas atualizadas (substituem as 5 antigas):

1. Home — "Tudo o que você precisa, num só lugar."
2. Pontos de coleta — "Ache o ponto certo pro seu resíduo, perto de você."
3. Denúncia — "Registrou, documentou, foi encaminhado."

(Copy definitiva ainda não validada com o usuário — mesma ressalva do `03-produto-em-acao/README.md`.)

## Atalho descoberto na exploração (continua valendo)

As telas **não precisam ser inferidas de imagem**. O app mobile já as implementa em código, usando **NativeWind 5 + Tailwind 4** — já escritas com as mesmas classes Tailwind do web:

- `mobile/src/app/(tabs)/(home)/index.tsx` — Home (`HomeHero` + `ServicesCarousel`)
- `mobile/src/app/(tabs)/market/index.tsx` — listagem de pontos de coleta (`MarketListHeader`, `LocationSourceBottomSheet`, `RadiusBottomSheet`, `CompanyCardItem`)
- `mobile/src/app/(tabs)/market/[companyId].tsx` — detalhe da empresa (abas Geral/Simulação, via `company-detail-general-tab.tsx` / `company-detail-simulation-tab.tsx`)
- `mobile/src/app/(tabs)/complaints/index.tsx` — mapa interativo de denúncias (`Control Map`, `Search Row`, FABs de nova denúncia/lista, `ComplaintsListBottomSheet`, `ComplaintBottomSheet`, `ComplaintFilterBottomSheet`)

Reconstruir vira transliteração: `<View>`→`<div>`, `<Text>`→`<span>`/`<p>`, **preservando o `className`**. `gluestack-ui` (usado no mobile) é construído sobre o mesmo design system do shadcn/ui — **usar os componentes shadcn já instalados em `web/src/components/ui/`** para acelerar a transliteração (`Card`, `Badge`, `Skeleton`, `Spinner`, etc.) em vez de recriar do zero.

`mobile/pencil/oikos-pencil.pen` é a fonte de verdade para o que o código não cobre. Nodes relevantes a esta revisão:

| Node ID | Tela |
|---|---|
| `r5km8p` | Home (guest) |
| `k8FJdz` | `market/index` — listagem |
| `m7x6Xu` | `market/[companyId]` — aba Geral |
| `J0viJC` | `market/[companyId]` — aba Simulação (catálogo selecionável, quantidade, swipe-delete, totais) |
| `wMzDB`, `FatMK` | `complaints/index` — mapa (2 estados: painel fechado / painel de denúncia aberto) |

As screens em `/home/ccrs/Imagens/oikos-screens/screens-v2/` (moldura de iPhone — **não usar como imagem final**) validam o resultado visual.

## 1. Home — entrada com nuvem 3D

Comportamento pedido: ao entrar na seção "Produto em ação", uma cena de nuvens em three.js cria um ar de mistério ("descobrindo um novo mundo") antes de revelar a Home. Referência visual: `/home/ccrs/Imagens/oikos-screens/3d-images/step-03.png` (ilha flutuante suspensa sobre névoa/fumaça na base) — a mesma linguagem visual já usada no app mobile pra essa mesma tela.

**Decisão de arquitetura**: reaproveitar a infra de gate/lazy-mount/dispose já construída em T05 (`use-webgl-support`, `IntersectionObserver`, `import()` dinâmico, `prefers-reduced-motion`, pausa fora da viewport) — é a mesma disciplina, cena diferente. Não reabrir essas decisões, só a mecânica da nuvem muda:

- Nuvem volumétrica real (raymarching, caro) é overkill aqui — mesma lição do T05 (Apple/fora.so não fazem 3D pesado fora do hero). Preferir **billboards com shader de ruído** (`GLSL` FBM/Perlin simples, alpha-blended, várias camadas de plano com textura procedural) — parecido com técnicas de "cloud card" comuns em jogos, muito mais barato que volumétrico.
- A ilha (não é modelo 3D — é a imagem `step-03.png` ou uma geração nova no mesmo estilo via Higgsfield) fica atrás das camadas de nuvem; conforme o scroll avança (`useScrollSync`, mesmo hook do resto da seção), as camadas de nuvem se dispersam (fade + drift), revelando a ilha e por trás dela a `Home` de fato (o `DeviceFrame` com a tela transliterada).
- Fallback obrigatório sem WebGL/`prefers-reduced-motion`: a imagem estática da ilha com um fade CSS simples — mesmo critério do fallback do hero.
- Esse efeito é **local à entrada da seção**, não um novo canvas full-page — escopo pequeno comparado ao ripple do hero.

## 2. Pontos de coleta — listagem + detalhe (3 sub-estados)

Corrige o erro do rascunho anterior: **não é mapa**. O único módulo com mapa interativo é a Denúncia (`complaints/index.tsx`, `MapView` do `react-native-maps`) — o de pontos de coleta (`market/index.tsx`) é sempre uma `FlatList`.

Sub-estados (dentro do mesmo beat, trocados por scroll como os demais):

1. **Listagem** (`k8FJdz`) — réplica de `MarketListHeader` + `CompanyCardItem`: cards com avatar/iniciais, nome, distância, badge aberto/fechado, chips de resíduo/serviço. **Precisa incluir os filtros**, não só a lista pelada:
   - Filtro de localização (`LocationSourceBottomSheet`, mobile) — "localização atual" vs. "endereço do perfil". Mockar com a localização atual = **Rondonópolis, MT** (`-16.471, -54.636`, altitude ~227m) como dado de geolocalização simulado em todas as telas que precisarem de coordenada (esta listagem, o mapa da denúncia).
   - Filtro de raio (`RadiusBottomSheet`, mobile).
   - Chips de categoria (resíduo/serviço), como em `ComplaintFilterRow`/`market-list-header`.
2. **Detalhe — aba Geral** (`m7x6Xu`) — endereço completo, horário, contato, foto.
3. **Detalhe — aba Simulação** (`J0viJC`) — catálogo selecionável + quantidade + lista com totais (mockado, sem cálculo real).

## 3. Denúncia — a interação principal da seção

A tela de maior peso institucional ganha a interação mais elaborada do showcase, deliberadamente **não** uma réplica estática de tela.

**Sequência (scroll-driven, progresso contínuo — não é troca discreta de estado)**:

1. Ao entrar no beat de Denúncia, mostra uma **foto grande, full-bleed**, de um descarte irregular (gerar via Higgsfield — mesma pipeline do resto do site, ver `human-image`/Higgsfield MCP).
2. Conforme o usuário rola, a foto **encolhe e se desloca continuamente** até se encaixar exatamente na área de tela do `DeviceFrame` (mesma carcaça usada nos outros beats) — é uma transformação de escala/posição interpolada pelo progresso do scroll, não um fade discreto entre estados.
3. Uma vez encaixada, a "tela" do telefone assume o **mapa interativo** (reaproveitar `web/src/components/ui/map.tsx` — ver decisão abaixo) com um pino caindo na localização da denúncia e outros pontos de coleta ao redor já visíveis no mapa.

**Decisão de arquitetura — mecanismo de scroll**: os outros beats trocam de sub-estado via `IntersectionObserver` (discreto, ver `product-showcase/index.tsx`). Este não pode: precisa de progresso contínuo 0→1 pra interpolar escala/posição da imagem quadro a quadro. Usar `useScrollSync` (`hooks/use-scroll-sync.ts`, já existe — `onScroll({sync:true})` do anime.js) com um `target` dedicado ao container da Denúncia, mapeando `progress` para `scale`/`x`/`y` da imagem via CSS transform (GPU-friendly, sem afetar layout). Esse é o único beat da seção que usa esse mecanismo — os demais continuam com o `IntersectionObserver` existente.

**Decisão de arquitetura — biblioteca de mapa**: o pedido original citava MapCN (`https://mapcn.vercel.app/`). **Já está instalado** — `web/src/components/ui/map.tsx` implementa exatamente essa API (compound components `Map`/`MapMarker`/`MapPopup`/`MapControls`/`MapRoute`/`MapGeoJSON`/`MapArc` sobre `maplibre-gl`, tema light/dark automático), adicionado junto com o resto do design system shadcn (`git log` do arquivo: mesmo commit `e632da2` que trouxe os componentes shadcn). **Não instalar nada novo** — reusar `<Map>`/`<MapMarker>` diretamente, com `blank: false` (basemap Carto) e um `MapMarker` customizado usando o mesmo desenho de pino do mobile (`ComplaintMarkerPin`, `MARKER_PIN_PATH` em `mobile/src/app/(tabs)/complaints/index.tsx:151-152`).

Mock de geolocalização: **Rondonópolis, MT** (`-16.471, -54.636`), mesma coordenada usada no filtro de localização de Pontos de coleta — mantém consistência entre os dois beats que usam mock geo.

Referência de estrutura de UI (não o mapa em si, que é novo): `wMzDB`/`FatMK` no `.pen` — `Control Map` (zoom/bússola/dark toggle), `Search Row`, FABs `New Complain`, `TabBar`. Adaptar pro tamanho do `DeviceFrame` (360×760), não replicar 1:1 os controles do mobile — o ponto aqui é mostrar o mapa populado, não toda a UI de controle.

## BottomSheet — `ui/bottom-sheet.tsx`

Onde a transliteração precisar de bottom sheet (`LocationSourceBottomSheet`, `RadiusBottomSheet`, `ComplaintsListBottomSheet` do mobile), usar o `Sheet` do shadcn já instalado (`web/src/components/ui/sheet.tsx`, `side="bottom"`) com duas adequações visuais, conforme os prints de referência (`/home/ccrs/Imagens/Capturas de tela/sheet.png`, `bottomsheet.png`):

- Cantos superiores arredondados (`rounded-t-2xl` ou equivalente) — o `Sheet` padrão do shadcn não arredonda por padrão no side="bottom".
- Um "traço" (drag handle) centralizado no topo — barra pequena (`h-1 w-10 rounded-full bg-muted-foreground/30`), decorativo, sem lógica de arrastar de fato (isso é showcase, não o app real).

Não precisa de um componente novo do zero — é o `Sheet` existente com essas duas classes a mais, encapsulado se for reutilizado 2+ vezes (regra do projeto de componentizar repetição).

## Tema

Site institucional e app não têm modo dark — construir só sobre o tema light (`globals.css` atual já é claro/quente). Variar `background`/cores **entre seções** pra dar ênfase (ex.: a nuvem da Home pode ter um tom diferente do resto) continua permitido — é variação de paleta dentro do light, não dark mode.

## Estrutura (atualizada)

```
product-showcase/
├── index.tsx                          sticky scroll + state machine (3 beats)
├── device-frame.tsx                   carcaça do telefone — sem mudança
├── cloud-reveal/
│   ├── index.tsx                      cena 3D da nuvem, client-only, mesmo gate do T05
│   └── shaders.ts                     GLSL das camadas de nuvem (FBM/ruído)
├── report-reveal/
│   └── index.tsx                      interação de scroll foto→mapa (useScrollSync dedicado)
└── screens/
    ├── home.tsx                       novo — réplica de (home)/index.tsx
    └── collection-points/
        ├── list.tsx                   novo — market/index.tsx + filtros
        ├── detail-general.tsx         novo — market/[companyId].tsx aba Geral
        └── detail-simulation.tsx      novo — market/[companyId].tsx aba Simulação
```

`screens/login.tsx`, `screens/signup.tsx`, `screens/company-register.tsx`, `screens/map.tsx` (o antigo, com a legenda errada) **removidos** — não fazem mais parte da sequência.

## Checklist

- [x] Remover `login.tsx`, `signup.tsx`, `company-register.tsx`, `map.tsx`, `report.tsx` de `screens/` (órfãos após a reescrita)
- [x] `screens/home.tsx`, `screens/pontos-de-coleta.tsx`, `screens/report-map.tsx`, `screens/profile.tsx`, `screens/company-registration.tsx` — telas novas, validadas isoladamente via `/device-preview`
- [x] `screens/persona-bridge.tsx` — wrapper do `PersonaPicker` como ponte narrativa antes do Perfil, pré-seleção automática da primeira persona
- [x] `product-showcase/beats.ts` — copy título + tópicos (sem numeração) dos 6 beats
- [x] `product-showcase/index.tsx` reescrito: `MockIdentityProvider` local, sticky scroll + crossfade nos beats discretos, mount único por beat no mobile (bug de 6 telas montadas simultaneamente corrigido)
- [x] `cloud-reveal/` — cena 3D de nuvem (shader de ruído FBM/valor em GLSL, `RawShaderMaterial`, render-on-demand por progresso de scroll, não loop contínuo), gate por `IntersectionObserver`+`useWebglSupport`+`prefers-reduced-motion` igual ao T05, fallback com a imagem estática da ilha
- [x] `report-reveal/` — foto de descarte (`public/device-preview/home/denuncias.jpg`, já existente) encolhendo via `useScrollSync` dedicado até crossfade para o `ReportMapScreen` real; mobile usa snap direto (sem interpolação)
- [x] `page.tsx`: wiring de `Manifesto`/`Audiences`/`Report`/`Closing` (antes só tinha `Hero`+`ProductShowcase`)
- [x] Conferência visual rodando `/` localmente (todos os 6 beats, desktop sticky, crossfade, interpolação contínua, ponte de persona refletindo em Perfil/Cadastro de empresa)
- [x] `npm run lint`, `npx tsc --noEmit` e `npm run build` limpos
