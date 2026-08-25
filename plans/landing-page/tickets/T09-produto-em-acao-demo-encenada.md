# T09 — Produto em ação: demo encenada por scroll (cliques simulados) em todos os 5 beats

> Handoff para continuar a implementação (ex.: outro modelo/CLI, tipo OpenCode)
> enquanto a sessão original está pausada. Este arquivo é autocontido: qualquer
> agente pode ler só ele + o código do repo e continuar sem precisar do histórico
> da conversa anterior.

## Objetivo

Transformar a seção "Produto em ação" (`src/components/landing-page/product-showcase/`)
da landing page Oikos numa demonstração "ao vivo" do produto: um cursor/toque
simulado navega pela tela **real** (não uma cópia decorativa) clicando, digitando e
abrindo telas, tudo amarrado ao progresso de scroll — como um product tour em
vídeo, mas 100% CSS/DOM, sem gravação. Vale pros 5 beats da seção.

Ordem final da narrativa (muda a atual): `home → profile → company-registration →
pontos-de-coleta → report-map`. Denúncia (`report-map`) passa a ser o **último**
beat (hoje é o 3º de 5).

## Por que isso (contexto de produto)

- As telas de dentro do "device mockup" (celular fake) já são **funcionalmente
  completas** — filtros, busca, sheets de detalhe, simulação de venda (Pontos de
  coleta), e filtro/pino/detalhe/voto/resolução (Denúncia) já existem com estado
  React real, não decorativo. O trabalho aqui não é "adicionar feature", é
  **coreografar e demonstrar** o que já existe.
- Hoje só o beat `home` (via `HomeReveal`) e `report-map` (via `ReportReveal`) têm
  alguma coreografia ligada a scroll; os outros 3 beats são `Reveal` estático sem
  interação nenhuma.
- Pedido específico do dono do produto, beat a beat:
  - **Home**: mostrar "toda a visão da aplicação e das opções" (hoje só tem hero +
    carrossel de serviços, sem nenhum menu/tab bar) e permitir "navegar" pra uma
    variante logada ("Home 2"), não só um fade passivo de scroll.
  - **Profile**: um efeito tipo "spotlight" mostrando onde o usuário clica —
    primeira ação demonstrada é clicar no ícone/tab de Perfil.
  - **Cadastro de empresa**: mostrar o formulário sendo preenchido de forma
    simulada, com o nome **"Oikos Economia Circular"** (a própria marca como
    empresa de exemplo).
  - **Pontos de coleta**: raio padrão pra **10km** (hoje é 2km); a empresa que
    acabou de ser "cadastrada" no beat anterior deve aparecer **em primeiro** na
    listagem (a listagem real vem de API — "é só a gente tentar manipular o
    resultado para que esse resultado que acabou de ser criado fique em
    primeiro", nas palavras do dono do produto); demonstrar busca/filtro; clicar
    numa empresa → ver detalhe → simular venda.
  - **Denúncia (report-map)**: é a funcionalidade mais importante do produto. Hoje
    o efeito de "tirar foto" (zoom-out) consome demais do scroll do beat e "mal
    mostra o produto" depois. Pedido: mostrar a cena da foto completa (tirando
    foto de um descarte irregular) e DEPOIS ir pro mapa, demonstrando filtros,
    detalhe, votação e resolução como interações separadas.

## Descobertas-chave da pesquisa (já confirmadas lendo o código, não precisa
## reconfirmar do zero)

1. **Nenhum componente de "cursor falso"/spotlight existia** em `landing-page/`
   antes deste ticket — foi construído do zero (ver "O que já foi feito" abaixo).
2. **Os sheets internos das telas (`CompanyDetailSheet`, `ComplaintDetailSheet`,
   `RadiusSheet`, etc.) são `absolute inset-0` dentro da própria tela**, não
   portais pro `document.body` (confirmado lendo `pontos-de-coleta.tsx:1029-1034`
   e o padrão se repete em `report-map.tsx`). Isso é o que viabiliza toda a
   abordagem: dá pra disparar cliques reais nesses elementos que eles ficam
   contidos dentro do `DeviceFrame`, sem vazar pra fora do mockup do celular.
3. **Pontos de coleta usa dado real de API** (`getV1Market` via `useMarket`,
   `hooks/use-market.ts`) — aumentar o raio não garante mais empresas por si só.
   A solução é mesclar a empresa mock (cadastrada pelo visitante) **na frente**
   dos resultados reais, replicando um padrão que **já existe** em
   `report-map.tsx` pras denúncias mock (`[...fromMock, ...fromApi]`, ver
   `report-map.tsx` por volta de L1626-1656 — a leitura anterior confirmou essa
   junção mock-primeiro-depois-API já implementada lá).
4. `MarketCompany` (tipo inferido do retorno de `getMarketAction`,
   `use-market.ts:9-11`) e `MockCompany` (`mock-identity/use-mock-companies.ts`)
   têm shapes diferentes — vai precisar de uma função adaptadora pequena
   (mesma ideia que `report-map.tsx` já faz pras denúncias mock: fabricar
   `status`, contadores etc. que só existem no shape da API).
5. `useMockCompanies` (`mock-identity/use-mock-companies.ts`) hoje só é consumido
   por `screens/company-registration.tsx` — **não** é importado em
   `pontos-de-coleta.tsx` ainda (isso faz parte deste ticket).
6. Raio padrão atual: `DEFAULT_FILTERS.radius = 2000` em
   `screens/pontos-de-coleta.tsx` (por volta da L198, conferir número de linha
   atual antes de editar pois o arquivo pode ter mudado).
7. `RADIUS_OPTIONS` já inclui 10km como opção (`pontos-de-coleta.tsx` por volta
   da L51-59) — só falta trocar o padrão.
8. Em `report-map.tsx`, o efeito de scroll (`report-reveal/index.tsx`) usa
   `START_SCALE = 1.65`, `SETTLE_AT = 0.55` — a partir de 55% do progresso do
   beat, o resto (45%) fica num crossfade estático sem mais nenhuma
   interação — é exatamente o gargalo que este ticket resolve, dando mais
   "altura" de scroll a esse beat e fatiando o progresso em fases (ver seção
   "Denúncia" abaixo).
9. `use-mock-votes.ts` e `use-mock-resolutions.ts` já têm UI ligada de verdade
   dentro de `ComplaintDetailSheet` em `report-map.tsx` (botões de voto por volta
   da L1132-1145; lista + formulário de resolução por volta da L1157-1313) — não
   precisa criar nenhuma lógica nova de voto/resolução, só disparar cliques reais
   nesses elementos já existentes.
10. `mock-identity-context.tsx` (persona ativa) já é compartilhado entre Home e
    Profile — não precisa mexer nele.
11. `status-bar-context.tsx` tem `useSetStatusBarVariant(variant)` pronto pra
    telas declararem contraste da status bar fake, caso alguma tela nova
    precise (nenhuma tela atual usa isso hoje).

## O que já foi feito (arquivos prontos, não mexer a menos que precise ajustar)

### `src/components/landing-page/product-showcase/hooks/use-demo-puppet.ts` ✅

Hook genérico "puppeteer" de DOM real. Recebe:
- `containerRef: RefObject<HTMLElement | null>` — nó raiz da tela montada dentro
  do `DeviceFrame`.
- `progress: number` — progresso de scroll 0-1 local ao beat (vem de
  `useScrollSync`, já existente em `hooks/use-scroll-sync.ts`).
- `script: DemoStep[]` — array de passos:
  `{ at: number; action: "click"; selector: string }` ou
  `{ at: number; action: "type"; selector: string; value: string }`.

Comportamento: a cada mudança de `progress`, acha o passo mais recente cujo
`at <= progress`. Passos anteriores ainda não disparados são executados
imediatamente sem animação (proteção contra scroll rápido pulando vários passos
de uma vez). O passo "atual" ganha uma sequência visual: mostra o cursor na
posição do elemento (medida via `getBoundingClientRect`), espera ~260ms, entra em
estado "pressing" e dispara a ação real (`element.click()` ou seta o valor nativo
do input/textarea + dispara evento `input` pra o React reconhecer a mudança como
se fosse digitação real), depois volta a "not pressing" pouco depois. Cada passo
só dispara **uma vez, pra frente** — não desfaz ao rolar pra cima. Sob
`prefers-reduced-motion`, pula toda a animação do cursor mas ainda dispara a ação
real instantaneamente (conteúdo final continua correto, só sem a "atuação"
visual).

Retorna um `CursorState`:
`{ visible: false } | { visible: true; x: number; y: number; pressing: boolean }`.

### `src/components/landing-page/product-showcase/ui/simulated-cursor.tsx` ✅

Componente puramente visual `SimulatedCursor({ state: CursorState })`. Renderiza
um "dedo"/cursor (círculo com anel de ripple por trás) posicionado via
`style={{ left, top }}` (posição relativa ao container, calculada pelo hook
acima), com:
- Transição de posição: `transition-[left,top] duration-200
  ease-[cubic-bezier(0.23,1,0.32,1)]` (ease-out forte, seguindo a filosofia de
  animação do Emil Kowalski/design engineering: nunca anima de `scale(0)`, usa
  easing customizado mais forte que o CSS padrão).
- Ripple: `bg-primary/40` que vai de `scale(0.6)/opacity(0.5)` (repouso) pra
  `scale(2.2)/opacity(0)` (pressionando), com `transition-all duration-500
  ease-out`.
- Círculo central: escala pra `0.9` quando `pressing` (feedback tátil de botão
  pressionado).

**Como usar os dois juntos** (padrão a repetir em cada `*-reveal/index.tsx`
novo):

```tsx
"use client";
import { useRef } from "react";
import { useScrollSync } from "@/components/landing-page/hooks/use-scroll-sync";
import { useDemoPuppet, type DemoStep } from "../hooks/use-demo-puppet";
import { SimulatedCursor } from "../ui/simulated-cursor";
import { AlgumaTela } from "../screens/alguma-tela";

const SCRIPT: DemoStep[] = [
  { at: 0.2, action: "type", selector: '[data-demo-target="busca"]', value: "óleo" },
  { at: 0.5, action: "click", selector: '[data-demo-target="filtro-chip"]' },
  { at: 0.8, action: "click", selector: '[data-demo-target="empresa-0"]' },
];

function AlgumaRevelacao({ trackRef }: { trackRef: RefObject<HTMLElement | null> }) {
  const progress = useScrollSync(trackRef);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursor = useDemoPuppet(containerRef, progress, SCRIPT);

  return (
    <div className="relative size-full overflow-hidden" ref={containerRef}>
      <AlgumaTela />
      <SimulatedCursor state={cursor} />
    </div>
  );
}
```

**Importante**: pra `element.click()`/`querySelector` funcionarem, os elementos
alvo precisam de um atributo `data-demo-target="algum-id"` estável no JSX da
tela real (`screens/*.tsx`). Adicionar esse atributo é uma mudança mínima,
não-invasiva, que não muda nenhuma lógica existente da tela.

## O que falta fazer (nesta ordem)

### 1. `product-showcase/ui/bottom-tab-bar.tsx` (novo, criar)

Tab bar inferior fake: Home / Mercado / Denúncia / Perfil, ícones `lucide-react`
(a lib já usada no projeto inteiro — **não trocar por outra lib de ícone**, ex.
Phosphor, mesmo que outras convenções genéricas sugiram isso; aqui a regra do
projeto é reuso/consistência acima de preferência genérica). Cada tab é uma
`<div data-demo-target={`tab-${id}`}>` (não precisa de `onClick` de navegação de
verdade — quem decide trocar de tela é o `*-reveal` que envolve o beat, o clique
simulado só precisa de um alvo real no DOM pra `element.click()` disparar em
cima). Prop `active: "home" | "mercado" | "denuncia" | "perfil"` pra destacar a
tab ativa (cor `text-primary` vs `text-gray-400`).

Renderizar como último filho de um container flex-col com `sticky bottom-0`
(mesmo padrão de `HomeScreen`, que já é `flex min-h-full flex-col`) — fica preso
ao fundo do scroll interno do `DeviceFrame` (`overflow-y-auto`), sem precisar de
`position: fixed`.

### 2. Home + Home 2 — `screens/home.tsx` (editar)

- Adicionar `<BottomTabBar active="home" />` como último elemento de `HomeScreen`
  (tanto autenticado quanto não), com a tab "Perfil" recebendo
  `data-demo-target="tab-perfil"` (já é o `data-demo-target` genérico do
  `BottomTabBar`, então isso já vem de graça).
  do BottomTabBar).
- `SessionCta` (o pill "Iniciar sessão") ganha `data-demo-target="session-cta"`
  no elemento clicável.
- **Não precisa reescrever a lógica de scroll existente** — `home-reveal/index.tsx`
  já faz `useScrollSync` + crossfade pra `HomeScreenAuthenticated`. Só adicionar
  por cima: dentro de `HomeReveal`, um `containerRef` + `useDemoPuppet` com um
  script mínimo tipo
  `[{ at: 0.4, action: "click", selector: '[data-demo-target="session-cta"]' }]`
  e renderizar `<SimulatedCursor state={cursor} />` por cima, só pra dar a
  sensação de "alguém clicou" no momento em que o crossfade acontece (o
  crossfade em si continua sendo dirigido pelo `sessionProgress` que já existe,
  não pelo clique simulado — é só reforço visual).

### 3. Profile — novo `product-showcase/profile-reveal/index.tsx`

Mesmo padrão de `home-reveal`/`report-reveal`: `useScrollSync(profileTrackRef)`,
fases (ajustar limiares durante QA visual):
- 0–0.35: `HomeScreen` autenticada parada, tab bar visível.
- 0.35–0.55: cursor desliza até `tab-perfil` (via `useDemoPuppet` com
  `{ at: 0.5, action: "click", selector: '[data-demo-target="tab-perfil"]' }`).
- 0.55–0.65: press/ripple (automático pelo hook).
- 0.65–1.0: crossfade (2 camadas absolutas, mesmo idioma de `ReportReveal`) pra
  `ProfileScreen`. Adicionar `filter: blur(2px)` durante a transição (truque do
  Emil Kowalski pra mascarar crossfade imperfeito — melhora a sensação de troca
  de tela).

`screens/profile.tsx`: adicionar `<BottomTabBar active="perfil" />` no rodapé
(mesmo padrão do item 2).

### 4. Cadastro de empresa — novo `product-showcase/company-registration-reveal/index.tsx`

**Antes de escrever o script**, ler `screens/company-registration.tsx` por
completo (ainda não foi lido nesta pesquisa) pra saber os nomes reais dos campos
do formulário e o texto/seletor do botão de submit. Adicionar
`data-demo-target="..."` nos campos usados pelo script (razão social/nome da
empresa, e o que mais fizer sentido preencher em poucos passos — não precisa
preencher every campo, só o suficiente pra parecer um preenchimento real) e no
botão de confirmar/cadastrar.

Nome sugerido pelo dono do produto pro preenchimento simulado: **"Oikos Economia
Circular"**. Usar dados coerentes (CNPJ fake plausível, endereço etc. — conferir
se a tela já tem algum default/placeholder reaproveitável).

Ao disparar o clique final de submit, `addCompany` (de `useMockCompanies`, já
existente) roda de verdade — é o mesmo caminho que um visitante real usaria — a
empresa passa a existir no `localStorage`
(`oikos-preview-mock-companies`) exatamente como se o usuário tivesse
preenchido à mão. Isso é o que alimenta o item 5.

### 5. Pontos de coleta — `screens/pontos-de-coleta.tsx` (editar) + novo `pontos-de-coleta-reveal/index.tsx`

- **Raio padrão**: trocar `DEFAULT_FILTERS.radius` de `2000` pra `10000`
  (conferir o número de linha atual antes de editar).
- **Empresa mock em 1º lugar**: importar `useMockCompanies` (de
  `../mock-identity/use-mock-companies`) dentro de `pontos-de-coleta.tsx`,
  mesclar as empresas mock **antes** dos resultados de `useMarket()`. Seguir o
  padrão já usado em `report-map.tsx` pras denúncias mock
  (`[...fromMock, ...fromApi]`, ler esse arquivo como referência de como fazer a
  adaptação de shape/campos fabricados que só existem na API). Escrever uma
  função adaptadora pequena `mockCompanyToMarketCompany(mock: MockCompany):
  MarketCompany` (ou o nome do tipo que for) fabricando os campos que só a API
  retorna (distância, badges, etc. — usar valores plausíveis, ex. distância
  "perto de você"/0km, já que é a própria localização do usuário).
- **Adicionar `data-demo-target`** em: campo de busca (`market-search`), um chip
  de categoria (`market-filter-chip`), o card da empresa em 1º lugar
  (`company-card-0` — como a mock sempre vai na frente, esse seletor sempre vai
  ser ela), e um item do catálogo dentro do `CompanyDetailSheet`
  (`catalog-item-0`).
- **Script do `pontos-de-coleta-reveal`**: digitar algo curto na busca → tocar
  chip de categoria → tocar (com destaque, talvez um ripple levemente maior/mais
  demorado pra diferenciar de um clique comum) o card da empresa recém-criada →
  sheet de detalhe abre (comportamento já existente) → tocar um item do
  catálogo → aba muda pra "Simulação" sozinha (já é o comportamento existente,
  não precisa forçar) → quantidade/total aparecem calculados (nenhuma ação
  extra necessária, é reativo).
- `beats.ts`: revisar `topics` do beat `pontos-de-coleta` pra citar que a
  empresa cadastrada aparece pra quem já está procurando (conferir que não fica
  redundante com a copy do beat `company-registration`, que já tem algo parecido
  — "Visibilidade imediata").

### 6. Denúncia (report-map) — o maior item, vai por último na narrativa

Reescrever por completo `product-showcase/report-reveal/index.tsx` (o zoom
atual + crossfade único vira um roteiro de 5 fases). Antes de escrever,
**ler `screens/report-map.tsx` por completo** (1806 linhas — grande, mas todas
as interações pedidas já existem com estado real, é só adicionar
`data-demo-target` nos elementos certos, sem mudar lógica):

1. **Cena da foto** (mantém o zoom-out atual, que "ficou muito bom", mas
   estende a narrativa): depois do zoom, cursor toca 1-2 chips de categoria de
   resíduo no formulário de criação (`CreateComplaintSheet`, já existe) →
   digita uma observação curta → cursor toca "Enviar denúncia" (dispara
   `addComplaint` real via `useMockComplaints`).
2. **Mapa respirando**: trecho de scroll só mostrando `ReportMapScreen` real
   (pinos, mapa) **sem** nenhum overlay por cima — resolve a queixa "mal mostra
   o produto". Não precisa de nenhuma ação nesta fase, só tempo de tela.
3. **Filtro**: cursor toca o botão de filtro → sheet abre → toca um chip de
   periculosidade/categoria → toca "Aplicar" (fecha o sheet, pinos mudam de
   verdade porque o filtro real dispara nova busca via `useComplaintsMap`).
4. **Detalhe + voto**: cursor toca um pino → `ComplaintDetailSheet` abre →
   cursor toca "Resolvida" no `ComplaintVoteButton` (voto real via
   `useMockVotes`).
5. **Resolução**: scroll dentro do sheet até a seção de resolução, mostra
   resolução(ões) existente(s) e/ou simula preencher+enviar uma nova
   (`addResolution` real via `useMockResolutions`).

Este beat precisa de bem mais altura de scroll que os outros pra caber as 5
fases sem parecer corrido (ver item 7 — `trackVh` bem maior, ex. 400).

`beats.ts`: revisar `topics`/`steps` do beat `report-map` pra refletir as 2
partes da narrativa (registrar → acompanhar) — a copy atual já menciona
voto/comentário/acompanhamento, então provavelmente só precisa de ajuste fino,
não reescrita completa.

### 7. Ajustes estruturais em `product-showcase/index.tsx` e `beats.ts`

- `ShowcaseBeat` (tipo em `beats.ts`) ganha campo opcional `trackVh?: number`
  (default 100 se ausente). Valores de partida pra ajustar durante QA visual:
  `home: 100, profile: 150, company-registration: 200, pontos-de-coleta: 250,
  report-map: 400`.
- `BeatArticle` (em `index.tsx`) troca a altura fixa (hoje
  `min-h-[80vh] md:min-h-screen`) por
  `style={{ minHeight: \`${beat.trackVh ?? 100}dvh\` }}` — usar `dvh`, não `vh`,
  pra estabilidade em mobile Safari (barra de endereço).
- `TEXT_SETTLE_AT` (hoje `0.7` em `index.tsx`, compartilhado por todos os
  beats) deve baixar bastante (algo como `0.15`–`0.2`) — com beats agora bem
  mais altos, o texto lateral (tópicos/steps no `GlassPanel`) precisa se
  revelar cedo e ficar estável enquanto o device conduz o resto da encenação,
  em vez de continuar surgindo lentamente até quase o fim do scroll.
- `BeatStage` (em `index.tsx`) ganha mais 3 casos de troca especial
  (`PROFILE_BEAT_ID`, `COMPANY_REGISTRATION_BEAT_ID`, `PONTOS_DE_COLETA_BEAT_ID`),
  no mesmo padrão que já existe pra `HOME_BEAT_ID`/`REPORT_MAP_BEAT_ID` — cada
  um com seu próprio `trackRef` registrado em `registerRef`, igual ao mecanismo
  atual (ver como `homeTrackRef`/`reportMapTrackRef` são passados hoje).
- `BEATS` (array em `beats.ts`) é reordenado pra:
  `home, profile, company-registration, pontos-de-coleta, report-map`.

## Arquivos — resumo

**Já criados** (não recriar):
- `product-showcase/hooks/use-demo-puppet.ts`
- `product-showcase/ui/simulated-cursor.tsx`

**Faltam criar**:
- `product-showcase/ui/bottom-tab-bar.tsx`
- `product-showcase/profile-reveal/index.tsx`
- `product-showcase/company-registration-reveal/index.tsx`
- `product-showcase/pontos-de-coleta-reveal/index.tsx`

**Falta reescrever por completo**:
- `product-showcase/report-reveal/index.tsx`

**Faltam editar**:
- `product-showcase/beats.ts` (reorder + `trackVh` + copy fina)
- `product-showcase/index.tsx` (novos `BeatStage` cases, `trackVh`, `TEXT_SETTLE_AT`)
- `product-showcase/screens/home.tsx` (tab bar + `data-demo-target`)
- `product-showcase/screens/profile.tsx` (tab bar)
- `product-showcase/screens/company-registration.tsx` (`data-demo-target` nos
  campos usados pelo script, sem mudar lógica)
- `product-showcase/screens/pontos-de-coleta.tsx` (raio padrão, merge de
  `useMockCompanies`, `data-demo-target`)
- `product-showcase/screens/report-map.tsx` (`data-demo-target` nos elementos
  usados pelo script, sem mudar lógica)

## Reaproveitar, não recriar

- `useScrollSync` (`hooks/use-scroll-sync.ts`) — motor de progress de todos os
  roteiros novos e existentes.
- Padrão de merge "mock primeiro, API depois" **já usado em `report-map.tsx`**
  — replicar 1:1 em `pontos-de-coleta.tsx`.
- `useMockCompanies`, `useMarketSimulation`, `useMockVotes`,
  `useMockResolutions`, `useMockComplaints` — toda a simulação de dados já
  existe; a demo só dirige os mesmos handlers que um clique real dispararia.
- `GlassPanel`, `Reveal`, `Section` (UI já existente da seção) — não criar novo
  componente de card/texto.
- `lucide-react` pros ícones da tab bar (já é a lib usada no projeto inteiro).

## Convenções do projeto (seguir sempre)

- Zero comentários explicativos por padrão no código (só JSDoc pra função
  utilitária não-óbvia, se necessário).
- Nunca usar em dash/travessão ("—"/"--") em nenhum texto (regra fixa do
  usuário) — usar vírgula ou frases separadas.
- `"use client"` em todo componente que usa hooks/scroll/estado.
- Rodar `bun run lint` (biome) e `bun x tsc --noEmit` depois de cada arquivo
  editado; corrigir antes de seguir pro próximo.

## Verificação (fazer no final, ou incrementalmente por beat)

- `bun x tsc --noEmit` e `bun run lint` limpos.
- Rodar o dev server (`bun run dev` — se a porta 3000 já estiver ocupada por
  outra instância, usar essa mesma, não subir uma segunda) e rolar a seção
  inteira em `/`, checando cada um dos 5 beats: cursor aparece, clica/digita nos
  alvos certos, sheets abrem contidas no `DeviceFrame` (sem vazar pra fora do
  celular), e o resultado final de cada interação é real (voto realmente
  registrado, denúncia realmente criada, empresa realmente aparece em Pontos de
  coleta, em primeiro lugar).
- Confirmar empiricamente quantas empresas reais a API devolve num raio de 10km
  do centro mock (Rondonópolis-MT, `-16.471,-54.636`) — se vier muito vazio, a
  empresa mock em 1º ainda garante que a lista nunca fica vazia, mas vale
  reportar o número real observado ao dono do produto.
- Testar com `prefers-reduced-motion` ativado no SO/navegador: o cursor não
  deve aparecer, mas o conteúdo final de cada passo (texto digitado, sheet
  aberta, voto registrado) precisa aparecer igual.
- Conferir layout mobile (cada beat com seu próprio `DeviceFrame`) com os novos
  `trackVh`.
