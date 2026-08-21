# Hero — Ideia 02: ilustração de ecossistema + Apple Liquid Glass

Status: **ideia em avaliação**, alternativa à `ideia-01` (cena 3D interativa). Comparar antes de decidir.

## Referências (2 imagens)

- `references/ref-green-de-floating-island.png` — crop só da ilha flutuante (o que foi analisado
  abaixo).
- `references/ref-green-de-full-page.webp` — a mesma peça "Green-de", mas em screenshot de página
  inteira (nav + headline + CTA + a ilha no contexto real do layout).

### Achado importante ao ver a página inteira

A ilustração de referência **não toma a tela inteira** — é uma composição contida, centralizada,
com bastante espaço em branco ao redor (nav simples no topo, headline curto, CTA, ilha ocupando só
uma fração da viewport). **Decisão tomada: a Oikos vai de full-bleed** — o Hero toma a tela inteira,
não o editorial contido da referência. Os elementos hexagonais/circulares translúcidos abaixo da
ilha (visíveis nas duas imagens) sugerem um toque "vidro", mas são estáticos — não são Liquid Glass
de verdade, só decoração.

## Variável dia/noite (ligada ao tema claro/escuro)

Ideia nova: a ilustração do Hero muda com o tema claro/escuro do site (infra já existe —
`next-themes`, `useTheme()`, toggle já em produção no `NavUser`). **Dia** (tema claro): cena
acordada, tudo em atividade. **Noite** (tema escuro): céu escuro, animais deitados dormindo, cidade
escura com janelas de prédio acesas, carros com farol ligado.

### O problema real: consistência entre as duas versões

Gerar duas imagens completas separadamente (dia e noite) via IA **não garante posição idêntica** —
modelos de imagem não reproduzem a mesma composição pixel a pixel numa segunda geração, mesmo com
prompt detalhado. As duas rotas abaixo resolvem isso *por construção*, não por sorte de prompt.

### Opção A — Diorama 3D ao vivo

Cena modelada uma vez no Blender/`react-three-fiber` (cidade + ecoponto + natureza); dia/noite vira
só uma troca de iluminação na mesma geometria (sol vs. lua + janelas acesas + postes). Consistência
garantida por construção, e permite transição **animada** (sol se pondo, luzes acendendo uma a uma,
animais deitando) em vez de crossfade seco.

**Custo real, sem meias-verdades**: isso é ambientação de cena (environment art) de verdade, bem
maior que os 8 objetos soltos já cortados pra `ideia-01`:
- Prédios (mesmo simplificados, são vários modelos/variações + material).
- Fauna: cada espécie precisa de modelo + **duas poses** (acordado/dormindo) — não precisa de rig
  completo, mas é escultura extra por espécie.
- Carros: modelo + variação de farol pra noite.
- Vegetação em quantidade suficiente pra "natureza" não parecer vazia.
- Terreno esculpido (a base/ilha).
- Composição da cena (arrumar tudo) é trabalho de arte à parte, depois de modelar as peças.

Isso é mais perto de semanas de trabalho de diorama populado do que dias. **O que reduz**: kit
modular de prédio (4-5 peças remontadas em vez de cada prédio único), só 2-3 espécies de fauna com
2 poses estáticas cada (sem rig), estilo low-poly/flat-shaded (bate com o tom "papel reaproveitado"
do DESIGN.md e é mais rápido que modelagem detalhada), um quarteirão pequeno em vez de "cidade"
inteira. A troca de luz em si continua barata — o caro é ter a geometria pra relightar.

### Opção B — Sprites 2D em camadas

Cada elemento (prédio, árvore, animal, carro, coletor) é uma arte separada com fundo transparente,
posicionada por código (CSS/SVG), não uma imagem única — nenhuma curva de aprendizado de Blender.

**O que é genuinamente simples**: pra maioria dos elementos, dia/noite **não exige duas gerações de
IA** — janela de prédio como retângulo separado com cor/glow controlado por `filter`/variável de
tema (reaproveitando os mesmos tokens light/dark que o app já usa via `next-themes`); farol de carro
à noite é glow via `box-shadow` no mesmo asset, não um asset novo. Full-bleed responsivo fica **mais
fácil** nessa rota (reflow por breakpoint) do que recortar uma imagem única gerada.

**O que não é simples, pra ser justo**:
- Fauna precisa mesmo de pose diferente (bicho deitado é uma forma diferente de bicho em pé) — duas
  gerações por espécie, mas isoladas/pequenas, muito mais fáceis de manter consistentes que a cena
  inteira.
- Direção de arte consistente entre assets gerados separadamente é o risco real — sem um
  "manual de estilo"/prompt-template fixo reaproveitado em cada geração, prédio/árvore/bicho/carro
  podem parecer de artistas diferentes (colagem, não ilustração única).
- Compor a cena (onde cada peça senta, escala, isometria coerente) continua sendo trabalho manual de
  layout — só que é frontend, não 3D.

### Comparação e estado atual

Sprites 2D não exige aprender Blender, reaproveita a infra de tema que já existe, e o primeiro
resultado visível sai em dias, não semanas — bem mais leve que o diorama 3D. O preço é menos "vivo"
(parallax, não física/interação real de verdade) e o risco de "colagem" se a direção de arte não for
disciplinada.

**Inclinação atual, dado o tempo disponível: Opção B (sprites 2D)** — mas ainda não é decisão
fechada, só a rota mais realista pro escopo de agora.

## Conceito

Diferente da `ideia-01` (objetos 3D flutuando ao vivo), essa ideia parte de **ilustração isométrica
estática/parallax** (gerada por IA) como pano de fundo, com **UI em vidro líquido (Apple Liquid
Glass)** flutuando por cima — nav, CTAs, cards. Muito mais barato de produzir que a `ideia-01`
(sem Blender, sem física, sem shader de dissolve): a complexidade vai pra 1-2 imagens bem
trabalhadas + componentes de vidro já prontos, não pra uma engine 3D inteira.

## Referência visual

`references/ref-green-de-floating-island.png` — ilha flutuante isométrica gerada por IA (não é do
usuário, achado como referência), pra uma marca fictícia "Green-de" (energia). Mostra floresta,
zona úmida com peixes, cachoeira central, fazenda solar em terraços com fauna, tudo conectado numa
única massa de terra flutuante fragmentada. Nav e botões são flat/frosted simples — **não** é
Liquid Glass de verdade, é só um glassmorphism raso (blur + opacidade), sem refração real.

### O que reaproveitar

- A composição "arquipélago flutuante fragmentado, mas visualmente contínuo" — prova que dá pra
  caber várias zonas temáticas distintas numa imagem só gerada por IA.
- A ideia de conectar as zonas por elementos físicos (pontes, cachoeiras, caminhos) em vez de
  deixá-las soltas — reforça leitura de "sistema", não colagem aleatória.

### O que muda pra Oikos

A referência é **100% natureza** — não tem zona urbana, não tem carro, não tem gente. O pedido do
usuário é justamente ambientes **divididos mas integrados**: natureza (fauna/flora) convivendo com
o humano, não misturados num só bloco. Proposta de zonas pra essa versão:

1. **Zona urbana**: prédios, ruas, carros — de onde o resíduo sai.
2. **Ponto de coleta / ecoponto**: contêineres coloridos pela paleta por categoria de resíduo do
   DESIGN.md (papel `#A67C52`, plástico `#2E7D74`, metal `#5B6B75`, vidro `#7C9473`, orgânico
   `#7A5A3A`, eletrônico `#4A4A6A`) — o ponto de virada visual da peça, onde a cor de categoria
   aparece pela primeira vez.
3. **Zona de natureza**: fauna/flora prosperando — o resultado do sistema funcionando.

Conectadas por pontes/trilhas/rios, como na referência — não é preciso fundir as três zonas numa
coisa só, só integrar visualmente (mesma ilha, setores diferentes).

**Paleta**: sem se prender à paleta verde-clara da referência — usar a paleta real do DESIGN.md
("Circular Warmth"), isso é ajuste de prompt/pós-produção, não limita o conceito.

## Apple Liquid Glass — o que é de verdade (pesquisado, não memória antiga)

Anunciado na WWDC 2025, é a linguagem de design atual da Apple (iOS/iPadOS/macOS 26+). Características
reais confirmadas: **lensing em tempo real** (o conteúdo atrás do vidro é literalmente distorcido/
ampliado, não só borrado), **specular highlights que reagem ao movimento do dispositivo/cursor**,
material que **adapta cor ao conteúdo e ao tema claro/escuro** por trás dele. Não é só
`backdrop-filter: blur()` — é refração física simulada.
Fontes: [Apple Newsroom](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/),
[LiquidGlassReference (guia feito pra apontar IA)](https://github.com/conorluddy/LiquidGlassReference).

### Componentes React Bits que já implementam isso de verdade

Inspecionei o código-fonte — não é decoração, usam `MeshTransmissionMaterial` do `@react-three/drei`
(material de transmissão/refração física real, renderizado via WebGL com `useFBO` pra capturar o
conteúdo atrás e distorcer):

- **`FluidGlass`** (`src/content/Components/FluidGlass/FluidGlass.jsx`) — nav em 3 modos (`lens`,
  `bar`, `cube`), com `ScrollControls`, refrata o conteúdo atrás em tempo real. Candidato direto pra
  nav/CTA do Hero.
- **`GlassSurface`**, **`GlassIcons`**, **`SpecularButton`**, **`ReflectiveCard`** — variações menores
  do mesmo princípio, pra cards/ícones/botões individuais.

Ou seja: dá pra ter Liquid Glass de verdade (não imitação) sem escrever o shader do zero — só
integrar esses componentes (via `npx reactbits-dev-mcp-server`, MCP de terceiros, ou copiando o
código-fonte direto do repo) e aplicar a paleta/tokens do DESIGN.md.

## Camadas de movimento (sem precisar de engine 3D completa)

Muito mais barato que a `ideia-01`:
- **Parallax por camada**: separar a ilustração em 3-4 camadas PNG com alpha (fundo, ilha,
  primeiro plano) que deslizam em profundidades diferentes conforme mouse/scroll — técnica clássica,
  não precisa de WebGL pesado.
- **Loops pequenos**: água brilhando, pássaros voando, fumaça leve — via CSS/sprite loop ou um vídeo
  curto em alpha, não simulação.
- Vidro líquido (`FluidGlass`/`GlassSurface`) fica só no chrome de UI por cima, que é onde o custo de
  WebGL realmente vale a pena (pouca área de tela, sempre visível).

## Viabilidade de gerar a imagem

A própria referência prova que múltiplas zonas temáticas cabem numa imagem só gerada por IA — não é
o gargalo. O gargalo real é **fidelidade de elementos específicos**: cores exatas dos coletores
batendo com o hex do DESIGN.md, silhueta reconhecível de carro/prédio genérico o suficiente pra não
parecer marca específica, etc. — isso normalmente precisa de 2-3 rodadas de iteração de prompt (ou
edição/inpainting sobre a base gerada), não sai perfeito na primeira. Geração de imagem final usa a
skill `nano-banana` (Gemini) quando formos produzir de verdade — não faz sentido gastar isso agora
em fase de conceito.

## Comparação rápida com a `ideia-01`

| | Ideia 01 (3D interativo) | Ideia 02 (ilustração + Liquid Glass) |
|---|---|---|
| Custo de produção | Alto (Blender, física, shader) | Baixo (1-2 imagens + componentes prontos) |
| "Vivo"/interativo | Sim, reage ao mouse de verdade | Parcial (parallax + loops, não simulação) |
| Custo mobile | Alto (fluido simulado em tempo real) | Baixo (imagem + parallax é leve) |
| Leitura "tech" | Vem da interação | Vem do material (vidro líquido = linguagem Apple) |

## Pendências

- [x] Confirmar se há uma segunda imagem de referência — sim, `ref-green-de-full-page.webp`.
- [x] Full-bleed vs. contido — decidido: full-bleed.
- [ ] Fechar Opção A vs. Opção B pro dia/noite (inclinação atual: B, sprites 2D).
- [ ] Escrever o prompt de geração das 3 zonas (urbana/ecoponto/natureza) pra testar no Gemini —
      ou, se for Opção B, o manual de estilo pra manter os assets consistentes entre si.
- [ ] Prototipar `FluidGlass` isolado com a paleta do DESIGN.md antes de desenhar o resto do chrome.
- [ ] Decidir se essa ideia substitui a `ideia-01` ou se dá pra combinar (ex: ilustração de fundo +
      1-2 objetos 3D pontuais em vez de cena 3D completa).
