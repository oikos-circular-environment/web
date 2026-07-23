# Design System da Oikos — "Circular Warmth" (proposta)

> Status: proposta para discussão, não é padrão fechado ainda.
> Inspirado em dois sistemas do catálogo [`nexu-io/open-design`](https://github.com/nexu-io/open-design) — `claude` (calor editorial, sombras "ring", neutros sempre quentes) e `clay` (materialidade tátil, radius generoso, paleta nomeada) — adaptado ao tom institucional-mas-humano que a Oikos precisa: confiável para empresas, cooperativas e poder público, acessível para catadores e cidadãos.

O nome de trabalho "Circular Warmth" resume a ideia central: um sistema visual que parece **feito de material reaproveitado** (papel kraft, tons terrosos, texturas discretas) em vez de plástico corporativo frio — sem virar lúdico ou infantil, porque parte do público (prefeituras, cooperativas, empresas parceiras) precisa confiar visualmente na plataforma antes de confiar operacionalmente nela.

Este documento é plataforma-agnóstico. A seção 10 (Notas de Implementação) traduz cada decisão para `web` (Tailwind v4 + shadcn/ui) e `mobile` (NativeWind + gluestack-ui).

---

## 1. Visual Theme & Atmosphere

A Oikos não é um app de reciclagem "fofo" — é infraestrutura para economia circular, usada por prefeituras, cooperativas de catadores, empresas geradoras de resíduo e recicladoras. O tom precisa equilibrar **credibilidade institucional** (como o Claude: calmo, editorial, confiável) com uma **materialidade reconhecível** (como o Clay: tátil, feito de coisas reais) — porque o produto literalmente lida com matéria sendo transformada em recurso.

Isso se traduz em:
- **Canvas quente, nunca frio**: fundo base é um branco-quebrado com leve viés verde-terroso (não o creme puro do Clay, não o pergaminho amarelado do Claude — algo entre os dois, puxado para o verde da marca) em vez de branco `#ffffff` ou cinza corporativo.
- **Bordas com textura de papel reaproveitado**: contornos sutis em tom quente (nunca cinza-azulado), sugerindo cartão/papelão reciclado sem ilustrar isso literalmente.
- **Radius generoso mas contido**: acolhedor, não infantilizado — nunca chega nos 40px do Clay; o teto é ~24px em containers grandes.
- **Elevação discreta**: a maior parte da UI fica **flat** (é um app denso em dados — marketplace, mapas, rotas), com sombra reservada para elementos flutuantes (modais, toasts, FAB). Nada de sombra "prensada" multi-camada nem hover com rotação — isso quebraria a confiança institucional que o produto precisa transmitir.
- **Verde como âncora de marca preservada**: o verde já é reconhecível como "Oikos = reciclagem/economia circular" no rascunho atual — a proposta formaliza e evolui essa cor em vez de descartá-la.

**Características-chave:**
- Canvas base quente com leve viés verde (não branco frio, não cinza corporativo)
- Verde `lime-800` como acento primário único de ação — reafirmado, não reinventado
- Um segundo acento terroso ("Terracota de Recurso") reservado para narrativa de transformação de material, nunca para CTAs primários
- Paleta nomeada por **categoria real de resíduo** (não por sabor/flavor como no Clay) — papel, plástico, metal, vidro, orgânico, eletrônico
- Sombra "ring" (`0 0 0 1px`) para estados interativos, sombra "whisper" só para elementos flutuantes — sem drop-shadow pesado
- Tipografia com voz de autoridade (Oswald) para headings + utilitária (Space Grotesk) para tudo o mais — já convergente entre web e mobile hoje

---

## 2. Color Palette & Roles

### Primário
- **Circular Green** `#3f6212` (Tailwind `lime-800`): acento de ação único — botões primários, links de destaque, estado ativo. **Esta proposta resolve a divergência existente**: o Pencil (`mobile/docs/design-system/REFERENCE.md`) aponta `$primary = #333c12`, mas o código (`mobile/src/app/global.css`, `web/src/app/globals.css`) já usa uma família de verde equivalente a `lime-800`. Recomendação: formalizar `#3f6212` como valor único de verdade e atualizar o Pencil para bater com o código — não o contrário, porque `lime-800` já é um valor real de escala Tailwind, já está em produção e não exige remapear componentes existentes.
- **Circular Green Foreground** `#FAFAF3`: texto sobre fundo verde.

### Secundário — Terracota de Recurso
- **Resource Terracotta** `#B0532E`: acento secundário, usado exclusivamente em contextos de "material sendo transformado" — ex. ilustrações conceituais, estado de destaque em telas de educação ambiental, nunca em CTA primário (esse papel é do verde). É o único ponto de contato direto com a inspiração Clay/Claude (ambos usam terracota como acento único).

### Paleta nomeada por categoria de resíduo
Em vez da paleta "sabor de doce" do Clay (Matcha, Slushie, Lemon...), a Oikos já tem categorias reais que merecem cor própria — isso dá uma identidade visual imediatamente reconhecível para badges de tipo de material em toda a plataforma (mobile já tem um componente `waste-category` que é o lugar natural para isso):

| Categoria | Cor | Hex | Papel |
|---|---|---|---|
| Papel/Papelão | Kraft Tan | `#A67C52` | bg de badge, ícone |
| Plástico | Ocean Teal | `#2E7D74` | bg de badge, ícone |
| Metal | Steel Slate | `#5B6B75` | bg de badge, ícone |
| Vidro | Glass Sage | `#7C9473` | bg de badge, ícone |
| Orgânico | Compost Brown | `#7A5A3A` | bg de badge, ícone |
| Eletrônico | Circuit Indigo | `#4A4A6A` | bg de badge, ícone |

Cada cor é usada em ~10–15% de opacidade como fundo de badge (`bg-{cor}/12`) com a cor sólida no texto/ícone — nunca como fundo de seção inteira (diferente do Clay, que usa swatches para blocos grandes). É decoração funcional, não celebrativa.

### Neutros (sempre com viés quente)
| Token | Light | Dark | Uso |
|---|---|---|---|
| `background` | `#FAF9F4` | `#171510` | canvas base |
| `surface` / `card` | `#FFFFFF` | `#211E17` | cards, containers elevados |
| `foreground` | `#211D15` | `#F5F3EC` | texto primário |
| `muted-foreground` | `#6B6355` | `#A79E8C` | texto secundário |
| `subtle-foreground` | `#948C7A` | `#8A8271` | texto terciário/metadata |
| `border` | `#E7E1D2` | `#332E22` | bordas padrão |
| `border-strong` | `#D8CFB8` | `#443E2E` | bordas de destaque, dividers |

Nenhum neutro tem viés azul — todo cinza aqui tem um leve calor amarelo-marrom, seguindo diretamente o princípio do Claude ("every gray has a yellow-brown undertone").

### Semânticas
- **Success**: reaproveita o próprio Circular Green (`#3f6212`) — reforça que "sucesso" no produto = mais reciclagem.
- **Warning**: `#B8842A` (âmbar terroso, não o amarelo puro do Clay).
- **Destructive/Error**: `#A23E2E` (vermelho-tijolo quente, não crimson frio).
- **Focus ring**: `#3B82C4` — **único tom frio de todo o sistema**, reservado estritamente para acessibilidade (foco de teclado/input). Claude e Clay convergem exatamente nessa regra de forma independente — ambos reservam um único azul frio só para foco; a Oikos adota a mesma convenção.

---

## 3. Typography Rules

### Famílias
- **Display/Heading**: `Oswald` (700/600) — já usada no mobile, tem presença de "sinalização"/placa que remete a infraestrutura pública sem parecer burocrática.
- **Corpo/UI**: `Space Grotesk` (400/500/600) — já compartilhada entre web e mobile hoje; ponto de convergência real entre as duas stacks, deve continuar sendo.
- **Mono** (opcional, uso técnico): manter o `mono` padrão do Tailwind no web; não introduzir fonte mono nova.

### Escala (formalizando a escala de 12 estilos já existente em `mobile/docs/design-system/REFERENCE.md`, estendendo-a ao web)

| Token | Família | Tamanho | Peso | Uso |
|---|---|---|---|---|
| `display` | Oswald | 36px | 700 | telas de onboarding/hero |
| `h1` | Oswald | 28px | 700 | título de página |
| `h2` | Oswald | 22px | 600 | título de seção |
| `h3` | Oswald | 18px | 600 | título de card/bloco |
| `h4` | Oswald | 15px | 600 | subtítulo pequeno |
| `overline` | Oswald | 11px | 600, uppercase, tracking +0.5px | rótulo de categoria/wayfinding |
| `body-lg` | Space Grotesk | 17px | 400 | parágrafo de destaque |
| `body` | Space Grotesk | 15px | 400 | corpo padrão |
| `body-sm` | Space Grotesk | 13px | 400 | corpo compacto, listas densas |
| `label` | Space Grotesk | 13px | 500 | rótulo de campo/formulário |
| `button` | Space Grotesk | 15px | 600 | texto de botão |
| `caption` | Space Grotesk | 11px | 400 | metadata, timestamps |

### Princípios
- **Oswald é só para autoridade**: headings, overlines e títulos de seção. Nunca corpo de texto, nunca botão.
- **Space Grotesk é só para função**: tudo que é UI, formulário, corpo, botão.
- **Sem terceira família**: dois pesos de trabalho bem definidos, como Claude (serif/sans) e Clay (uma família com pesos), evitando a fragmentação atual (o web ainda carrega Montserrat + Geist não usados — a proposta consolida em Oswald + Space Grotesk nas duas plataformas).

---

## 4. Component Stylings (mapeado a shadcn/ui)

O web já usa shadcn/ui (`components.json`, style `radix-vega`, base `zinc` a trocar por esta paleta). As diretrizes abaixo assumem variantes via `cva`, primitivas Radix e `cn()` — sem introduzir biblioteca nova.

### Button (`src/components/ui/button.tsx`)
- **Primary**: bg `Circular Green` (`#3f6212`), texto `#FAF9F3`, radius `--radius-md` (~10px), sem borda. Hover: leve escurecimento (`brightness-95`), sem drop-shadow. Focus: ring de 2px em `Focus Blue`.
- **Secondary/Outline**: bg transparente, borda `border-strong`, texto `foreground`. Hover: bg `surface` levemente destacado.
- **Destructive**: bg `#A23E2E`, texto `#FAF9F3`.
- **Ghost**: sem bg/borda, texto `foreground`, hover com bg `muted` sutil.
- Nunca aplicar rotação ou transform no hover (diferente do Clay) — a interação deve parecer estável e confiável, não brincalhona.

### Card
- bg `surface`, borda `1px solid border`, radius `--radius-lg` (~16px).
- **Flat por padrão** (a maioria dos cards em listas/mapas fica sem sombra — é um produto denso em dados).
- Sombra "whisper" (`rgba(33,29,21,0.06) 0px 4px 16px`) reservada para cards que flutuam sobre conteúdo (ex. bottom sheet, card de destaque no dashboard).

### Badge — categoria de resíduo
- Pill (`radius-full`), padding compacto, fundo na cor da categoria a 12% de opacidade, texto/ícone na cor sólida da categoria (tabela da seção 2).
- Texto no estilo `overline` (11px, uppercase, tracking) — reaproveitando o princípio de "uppercase label com tracking" que Claude e Clay usam de formas diferentes, aqui aplicado a algo funcional (identificar material) em vez de decorativo.

### Input
- borda `border`, radius `--radius-md`, texto `foreground`.
- Focus: ring 2px `Focus Blue` — o único momento em que uma cor fria aparece na interface.

### Tabs / Navegação
- Indicador ativo em `Circular Green`, texto inativo em `muted-foreground`.
- Sem gradientes, sem pills coloridos por seção (diferente do Clay) — a navegação deve ser previsível, não expressiva.

### Mobile (gluestack-ui / `tva`)
Mesma linguagem visual (cores, radius, tipografia), implementada via `tva` nos arquivos `src/components/ui/*/styles.tsx` do mobile — shadcn não roda em React Native, então a primitiva equivalente lá é gluestack-ui, não um port de shadcn.

---

## 5. Layout Principles

### Espaçamento
Base 8px, escala convergente com o que já existe no mobile (`docs/design-system/REFERENCE.md`), formalizada também no web:
`4, 8, 12, 16, 20, 24, 32, 40` (px)

### Radius
| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 6px | inputs pequenos, chips |
| `radius-md` | 10px | botões, inputs |
| `radius-lg` | 16px | cards padrão |
| `radius-xl` | 20px | cards em destaque, modais |
| `radius-2xl` | 24px | bottom sheets, containers grandes (teto da escala) |
| `radius-full` | 999px | badges, avatares, pills |

Mantém o mecanismo atual do web (escala derivada de um único `--radius` base) — só recalibra os valores finais.

### Grid & Container
- Container máximo web: ~1200px, centralizado.
- Grids de cards: 1 coluna mobile → 2 tablet → 3 desktop.
- Mobile: respeitar safe-area insets e altura de tab bar; ações primárias sempre alcançáveis com o polegar (zona inferior 2/3 da tela).

---

## 6. Depth & Elevation

| Nível | Tratamento | Uso |
|---|---|---|
| 0 — Flat | sem sombra, sem borda | fundo, texto solto |
| 1 — Contained | `1px solid border` | cards padrão, listas, seções |
| 2 — Ring | `0 0 0 1px` na cor de foco/hover | estados interativos, foco de input |
| 3 — Whisper | `rgba(33,29,21,0.06) 0px 4px 16px` | elementos flutuantes: modal, toast, bottom sheet, FAB |

**Filosofia**: a maior parte da interface fica nos níveis 0–1. Sombra é sinal de "isto está temporariamente sobre o resto da tela", não decoração. Isso é uma escolha deliberada contra o sistema multi-camada "prensado" do Clay — bonito para uma agência criativa, mas errado para um produto que cooperativas e prefeituras precisam achar sério.

---

## 7. Do's and Don'ts

### Do
- Usar `Circular Green` (`#3f6212`) como única cor de CTA primário em toda a plataforma.
- Manter todo neutro com viés quente (amarelo-marrom), nunca cinza-azulado.
- Reservar `Focus Blue` estritamente para foco de teclado/acessibilidade.
- Usar a paleta de categoria de resíduo apenas em badges/tags de material — nunca como fundo de seção inteira.
- Manter a maior parte da UI flat (nível 0–1); sombra só em elementos flutuantes.
- Oswald só em headings/overlines; Space Grotesk em tudo o mais.
- Radius generoso mas com teto em 24px.

### Don't
- Não usar drop-shadow pesado ou sombra multi-camada "prensada" — quebra a seriedade institucional.
- Não aplicar hover com rotação/transform físico (assinatura do Clay) — o produto precisa parecer estável.
- Não introduzir terceira família tipográfica.
- Não usar terracota como cor de CTA primário — é acento narrativo, o verde é quem age.
- Não usar branco puro (`#ffffff`) como fundo de página — sempre o canvas quente (`#FAF9F4`).
- Não deixar a divergência de verde entre Pencil e código sem resolver — `#3f6212` é o valor de verdade.

---

## 8. Responsive Behavior

### Web (breakpoints Tailwind padrão)
| Nome | Largura | Mudanças-chave |
|---|---|---|
| Mobile | <640px | coluna única, nav colapsada |
| Tablet | 640–1024px | grids de 2 colunas |
| Desktop | 1024px+ | grids de 3 colunas, layout completo |

### Mobile (Expo)
- Respeitar safe-area (notch, home indicator).
- Tab bar fixa na base, altura consistente entre telas.
- Ações primárias (ex. "Solicitar coleta", "Confirmar entrega") sempre em zona de alcance do polegar.
- App é **light-only hoje por decisão de produto** — este documento não força reintrodução de dark mode; se voltar, os tokens dark já estão definidos na seção 2.

---

## 9. Agent Prompt Guide

### Referência rápida de cor
- CTA primário: "Circular Green (#3f6212)"
- Fundo de página: "canvas quente (#FAF9F4)"
- Card: "surface (#FFFFFF) com borda #E7E1D2"
- Texto primário: "#211D15"
- Texto secundário: "muted-foreground (#6B6355)"
- Badge de papel: "Kraft Tan (#A67C52) a 12% de opacidade"
- Badge de plástico: "Ocean Teal (#2E7D74) a 12% de opacidade"
- Foco: "Focus Blue (#3B82C4), único tom frio do sistema"

### Exemplos de prompt
- "Crie um botão primário com fundo Circular Green (#3f6212), texto #FAF9F3, radius 10px, sem sombra em repouso, ring de 2px em Focus Blue no foco."
- "Desenhe um card de coleta: fundo branco (#FFFFFF), borda 1px #E7E1D2, radius 16px, sem sombra (nível 1 — contained). Título em Oswald 18px peso 600, corpo em Space Grotesk 15px."
- "Crie um badge de categoria 'Plástico': pill radius, fundo Ocean Teal (#2E7D74) a 12% opacidade, texto Ocean Teal sólido, Space Grotesk 11px uppercase com tracking."
- "Construa uma bottom sheet: fundo #FFFFFF, radius 24px no topo, sombra whisper (rgba(33,29,21,0.06) 0px 4px 16px) — é o único momento de elevação nível 3 na tela."

### Guia de iteração
1. Comece pelo canvas quente (#FAF9F4) — nunca branco frio.
2. Verde é ação; terracota é narrativa; cores de categoria são só para badges de material.
3. Flat primeiro — só adicione sombra se o elemento realmente flutua sobre o resto.
4. Oswald é reservado para autoridade (headings); tudo funcional é Space Grotesk.
5. Nenhum hover com movimento físico — mudança de tom é suficiente.

---

## 10. Notas de Implementação

### Web (`oikos/web`)
- Tokens hoje em `src/app/globals.css` (Tailwind v4 `@theme inline`, cores em OKLCH) — converter os hex acima para OKLCH mantendo a estrutura de variáveis já existente (`--primary`, `--background`, `--foreground`, etc.).
- `components.json` (shadcn) troca `baseColor: "zinc"` pelo novo conjunto de neutros quentes; componentes em `src/components/ui/*` recebem as novas variantes `cva` descritas na seção 4.
- Radius: recalibrar a escala derivada de `--radius` (hoje base `0.625rem`) para os novos valores da seção 5.
- Consolidar fontes: remover Montserrat/Geist não utilizados, adotar Oswald (heading) + Space Grotesk (body) via `next/font/google`, igual ao mobile.

### Mobile (`oikos/mobile`)
- Tokens hoje em `src/app/global.css` — atualizar `:root` e `:root.dark` com os novos valores.
- `docs/design-system/REFERENCE.md` e `pencil/oikos-pencil.pen` devem ser atualizados para apontar `$primary = #3f6212`, resolvendo a divergência documentada na epic brief atual.
- Badges de categoria de resíduo: bom candidato para formalizar como componente novo a partir do `waste-category` já existente (`src/components/custom/waste-category/`).
- Componentes gluestack-ui (`src/components/ui/*/styles.tsx`, padrão `tva`) recebem as mesmas variantes descritas na seção 4, adaptadas à API do gluestack.

### Observação sobre o nome da marca
`pesquisa-marca-inpi.md` (raiz do monorepo) indica risco de conflito de registro para "OIKOS" na classe 42 — o nome verbal pode mudar. Este sistema visual (cor/tipografia/forma) foi desenhado para não depender do nome "Oikos" especificamente, então permanece válido mesmo que o naming mude.

### Próximos passos sugeridos (fora do escopo deste documento)
- Validar esta direção com o time antes de qualquer migração de código.
- Depois de validado, gerar uma apresentação (slides) usando este mesmo DS como base visual.
