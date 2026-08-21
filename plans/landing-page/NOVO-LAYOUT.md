# Landing page da Oikos — hero com ripple revelando degradação

## Context

A home hoje é um placeholder ("Estamos em construção", `src/app/(public)/page.tsx`). Existe um plano de landing bem avançado em `web/plans/landing-page/` (issue #63, 6 seções com copy escrita), mas ele nunca virou código e sua direção visual do hero ficou em aberto entre duas ideias não decididas.

Este plano fecha essa lacuna: mantém **a copy e a narrativa já escritas** naquele plano e substitui **a direção visual** por uma nova, derivada do fora.so — estética de marca de luxo, fundo tomando a página inteira, glass leve e telas de produto construídas em DOM em vez de screenshot.

A tese de produto é contraintuitiva de propósito: quando se fala de resíduo, espera-se um site sujo e clichê mostrando lixo. A landing faz o oposto — abre com natureza intacta e acabamento caro, e só revela a degradação **onde o usuário passa o mouse**. O resíduo não é o assunto visual; o valor que ele pode virar é. E o custo de não cuidar aparece pelas mãos do próprio visitante.

### Especificações extraídas do fora.so (Playwright + fetch)

O site é feito em Framer. Medições reais, que viram o vocabulário visual da landing:

| Elemento | Spec medida |
|---|---|
| H1 | `56px / 72.8px`, weight 400, `letter-spacing: -2.24px` (−0.04em), cor `rgb(255,243,240)` — off-white **quente**, nunca `#fff` |
| Corpo e nav | `14px / 21px`, `letter-spacing: -0.28px`, `rgba(255,255,255,.8)` |
| Barra de nav | full-width `h-48px`, `padding: 0 40px`, fundo **totalmente transparente** |
| Botão glass | `backdrop-filter: blur(5px)` + `background: rgba(255,255,255,.10)` + `border-radius: 768px`, **sem borda e sem sombra**, `h-36px`, `padding: 0 24px` |
| Painel de app | `backdrop-filter: blur(24px)`, `background: rgba(23,23,23,.85)`, `radius: 24px 24px 0 0` — DOM puro, não imagem |
| Card flutuante | `blur(10px)` + `box-shadow: rgba(0,0,0,.35) 0 1px 32px`, radius 10px |
| Fundo | `body` preto; imagem em `object-fit: cover` + gradiente escuro por cima |
| Entrada | 1000ms `cubic-bezier(.44, 0, .56, 1)` + um grupo de springs de 500ms, com stagger e `will-change: transform` |

O ponto central: **o vidro está nos controles, não nas superfícies grandes**. A barra de nav é invisível; só os botões têm vidro. É isso que produz o ar caro em vez de "app com blur".

## Decisões travadas

| Decisão | Escolha |
|---|---|
| Renderer WebGL | **three.js** — exige reescrever o componente do react-bits (que é ogl), mas reabre a porta para 3D real depois |
| Motor de animação | **anime.js v4** — `createScope({ root })`, `onScroll({ sync })`, `stagger()` |
| Layout | Route group aninhado — nenhuma URL muda |
| Telas do produto | Reconstruídas em DOM + Tailwind, tendo `mobile/pencil/oikos-pencil.pen` como fonte de verdade, com o código do app mobile como referência cruzada (ver abaixo) |
| Imagens do hero | Geradas via Higgsfield: pristine primeiro, degradada **derivada por edição** da pristine |
| Copy | Reaproveitada de `web/plans/landing-page/` |

Consequências assumidas de three.js sobre ogl, para ficarem registradas: +145 KB gz e o port do ripple deixa de ser direto (blending, color space e atributos instanciados têm semântica diferente). Mitigação obrigatória na seção de performance.

## Reorganização de rotas

`(public)/layout.tsx` injeta `SiteHeader` + `SiteFooter` em toda rota pública. A landing tem nav própria, então:

```
src/app/(public)/
├── layout.tsx                 → passa a ser só {children}
├── page.tsx                   → LANDING
└── (institutional)/
    ├── layout.tsx             → SiteHeader + SiteFooter (conteúdo do layout atual)
    ├── login/  registro/  suporte/  verify-email/
    ├── politica-de-privacidade/  termos-de-uso/
    └── design-system/
```

Route group não entra na URL: `/login` e `/registro` continuam idênticos, e **nenhum arquivo dessas rotas é editado** — só movido.

## Estrutura de componentes

Tudo isolado em `src/components/landing-page/`. Compound component em todos os blocos completos, seguindo o padrão flat já usado em `src/components/ui/card.tsx`: várias funções no mesmo arquivo, coordenação por `data-slot`, Context só onde há estado real (o sticky scroll).

```
src/components/landing-page/
├── index.ts
├── ui/                       ← primitivas reutilizáveis
│   ├── glass-button.tsx      cva com a receita medida do fora.so
│   ├── glass-panel.tsx       blur(24px) / rgba(23,23,23,.85)
│   ├── section.tsx           Section.Root/.Header/.Overline/.Title/.Body
│   └── reveal.tsx            wrapper de entrada com stagger
├── hooks/
│   ├── use-anime-scope.ts    createScope({root}) + revert() no cleanup
│   ├── use-scroll-sync.ts    onScroll({sync}) → progresso 0..1
│   └── use-webgl-support.ts
├── hero/
│   ├── index.tsx             Hero.Root/.Nav/.Badge/.Title/.Subtitle/.Actions
│   ├── hero-nav.tsx
│   ├── ripple-canvas.tsx     three.js, client-only
│   ├── ripple-shaders.ts     GLSL
│   └── hero-fallback.tsx     imagem pristine estática
├── manifesto/
├── product-showcase/
│   ├── index.tsx             sticky scroll + state machine
│   ├── device-frame.tsx      carcaça do telefone em DOM/CSS
│   └── screens/              telas reconstruídas do .pen
├── audiences/
├── report/
└── closing/
```

`page.tsx` permanece Server Component e apenas compõe as seções; só `ripple-canvas.tsx`, o sticky scroll e os wrappers de animação levam `"use client"`.

### `ui/glass-button.tsx`

Transcreve a receita medida, em `cva`, seguindo o molde de `src/components/ui/button.tsx` (`function`, `data-slot`, `Slot` do pacote `radix-ui`, export nomeado). O ponto de atenção é resistir à tentação de "melhorar" o vidro: nada de borda, nada de sombra, `blur` baixo. É a contenção que produz o efeito caro.

```
base:  inline-flex items-center justify-center rounded-full
       backdrop-blur-[5px] bg-white/10 text-landing-ink
       transition-colors hover:bg-white/[0.16]
size:  sm → h-8 px-4 text-sm   (nav, medido 96×32)
       md → h-9 px-6 text-sm   (CTA do hero, medido 109×36)
tone:  glass   → o acima
       solid   → bg-primary text-primary-foreground   (CTA de conversão, verde #3f6212)
```

`ui/glass-panel.tsx` faz o mesmo para superfícies: `backdrop-blur-[24px] bg-[#171717]/85`, e a variante de card flutuante com `shadow-[0_1px_32px_rgba(0,0,0,.35)]`.

## O efeito do hero

A mecânica do componente de origem (react-bits `RippleDistortion`), que eu li por inteiro:

1. Ondas são emitidas ao longo do ponteiro quando ele anda mais que `spacing` px, num ring buffer de 100 instâncias.
2. Elas são desenhadas com **blending aditivo** num render target — o *displacement field*. Cada onda cresce e decai (`decay = exp(-delta·ln500 / fade)`).
3. Um passe fullscreen lê esse campo no canal `.r` e usa como `amount` para deslocar a UV da textura, mais swirl, dispersão cromática e glint.

A mudança que produz o efeito pedido é no fragment de composição: **duas texturas em vez de uma**, sampleadas na mesma UV deslocada, com `mix(pristine, degraded, reveal)` onde `reveal` deriva do mesmo campo. O rastro deixa de só distorcer e passa a revelar. Quando as ondas decaem, a cena volta sozinha ao estado íntegro — a natureza "se cura", o que é exatamente a leitura desejada.

### O reveal, em GLSL

No fragment de composição, sampleando as duas texturas na mesma UV já deslocada:

```glsl
float amount = texture2D(uDisplacement, vUv).r;
vec2  uvOff  = coverUV(vUv) + push;
float reveal = smoothstep(uRevealStart, uRevealEnd, amount * uRevealGain);
vec3  color  = mix(texture2D(uPristine, uvOff).rgb,
                   texture2D(uDegraded, uvOff).rgb, reveal);
```

Custo: 2 samples. A dispersão cromática, se ligada, sobe para 6 — por isso ela fica em `0` por padrão (como no original). O `smoothstep` é o que dá borda definida ao rastro em vez de um degradê frouxo.

As duas imagens devem ter dimensões iguais, então `coverUV()` continua com um único `uTextureSize`. Validar isso no carregamento em desenvolvimento, porque a falha é silenciosa e visualmente sutil.

### Port ogl → three.js: onde a semântica difere

Estes são os pontos que quebram **em silêncio** — compilam, rodam, e entregam a imagem errada:

1. **Blending.** O original usa `setBlendFunc(gl.ONE, gl.ONE)`. O `THREE.AdditiveBlending` **não** é equivalente — ele é `(SrcAlpha, One)`. Obrigatório `blending: THREE.CustomBlending` com `blendSrc: THREE.OneFactor`, `blendDst: THREE.OneFactor`, `blendEquation: THREE.AddEquation`. Errar aqui deforma o acúmulo de ondas sobrepostas.

2. **Color space do render target.** O campo de displacement é **dado, não cor**. O render target precisa ficar em `NoColorSpace`; se herdar sRGB, a conversão distorce o campo e o deslocamento sai não-linear. As texturas de imagem, ao contrário, precisam de `SRGBColorSpace`.

3. **`flipY`.** `THREE.Texture` tem `flipY = true` por padrão; ogl não inverte. A imagem sai de cabeça para baixo sem nenhum erro no console. Decidir de que lado corrigir (na textura ou no shader) e manter consistente entre as duas imagens.

4. **`RawShaderMaterial`, não `ShaderMaterial`.** O GLSL original declara seus próprios `attribute vec2 position; attribute vec2 uv;` e escreve `gl_Position` sem matriz nenhuma. `ShaderMaterial` injetaria `attribute vec3 position` e os uniforms de matriz, colidindo na compilação. `RawShaderMaterial` não injeta nada — mantendo GLSL ES 1.00, sem `glslVersion`.

5. **Instancing.** `InstancedBufferGeometry` com `position`/`uv` como `BufferAttribute` e `iOffset`/`iScale`/`iOpacity` como `InstancedBufferAttribute`, todos com `setUsage(THREE.DynamicDrawUsage)` e `needsUpdate = true` a cada frame. `geometry.instanceCount = MAX_WAVES`.

6. **Frustum culling.** Como `gl_Position` é escrito direto, a bounding sphere que o three calcula não corresponde a nada — `mesh.frustumCulled = false` nos dois meshes, ou eles somem sem aviso.

7. **`setSize(w, h, false)`.** O terceiro argumento evita que o three escreva `style.width/height` no canvas, já que o dimensionamento vem do CSS. Junto com `setPixelRatio(Math.min(devicePixelRatio, 2))`.

8. **Câmera.** Nenhum dos dois passes usa matriz, mas `renderer.render(scene, camera)` exige uma — uma `new THREE.Camera()` identidade basta, sem ortográfica.

9. **Descarte.** `dispose()` em cada geometria, material, textura e no render target, mais `renderer.dispose()` e `renderer.forceContextLoss()`. Sem isso, navegar para outra rota e voltar vaza contexto WebGL até o navegador começar a derrubar os antigos.

### Montagem e ciclo de vida

O componente é client-only e não deve entrar no bundle inicial: `next/dynamic` com `ssr: false` no consumidor, e o WebGL só instancia quando **todas** valem — hero em viewport (`IntersectionObserver`), WebGL suportado, e `prefers-reduced-motion` não pedido. O rAF pausa fora da viewport e em `visibilitychange`, para a aba em segundo plano não girar o loop.

O estado mutável do loop (ondas, offsets, escalas) vive em `useRef`, nunca em state, e a config muda por ref atualizada fora do efeito — como o original já faz. Isso mantém o React Compiler satisfeito, já que nada é mutado durante o render.

### Fallback obrigatório

Sem WebGL ou com `prefers-reduced-motion: reduce`, renderiza a imagem pristine estática via `next/image`. A imagem degradada nunca aparece nesse caminho — o efeito é a única forma de revelá-la, e isso é intencional.

## Assets do hero

Duas imagens de **composição idêntica**. É o requisito crítico: se a degradada não casar com a pristine, o reveal "pula" e o efeito se perde.

O caminho que garante o casamento é gerar a pristine primeiro e derivar a degradada **por edição** dela, passando a pristine como referência — não gerar duas imagens independentes a partir de dois prompts.

- `public/hero/pristine.webp` — natureza intacta, tratamento caro, luz de hora dourada
- `public/hero/degraded.webp` — a mesma cena com poluição e resíduo, mesmo enquadramento, mesma luz

Como o `coverUV()` do shader usa as dimensões da textura, as duas devem sair na mesma resolução.

Saldo Higgsfield conferido: **128,64 créditos** (plano starter) — folgado para a pristine mais algumas iterações da degradada até o par casar. Preflight de custo com `get_cost` antes de cada geração.

## Seções

Copy vinda de `web/plans/landing-page/`, reaproveitada literalmente.

**1. Hero** — nav glass centralizada, badge, H1, subcopy, dois CTAs. Fundo é o canvas do ripple ocupando a viewport inteira, com gradiente escuro por cima para garantir contraste do texto.

**2. Manifesto** (`02-problema/`) — overline `POR QUE ISSO IMPORTA`, H2 "Reciclar dá certo quando é fácil saber onde — e quando a gente enxerga valor no que sobra.", corpo e fecho já escritos. Editorial, respirado.

**3. Produto em ação** (`03-produto-em-acao/`) — sticky scroll com telefone em DOM. Telas: login, registro, mapa de pontos, cadastro de ecoponto, denúncia. Legendas já escritas ("Sem burocracia pra começar.", "Ache o ponto certo pro seu resíduo.", …). Transição de 350ms entre estados (fade out 150 → swap → fade in 200).

**Atalho descoberto na exploração:** as telas não precisam ser inferidas de imagem. O app mobile já as tem implementadas em `mobile/src/app/(tabs)/` — `market/index.tsx`, `complaints/index.tsx`, `(home)/sign-in.tsx`, `(home)/sign-up.tsx` — e ele usa **NativeWind 5 + Tailwind 4**, ou seja, as telas já estão escritas com as mesmas classes Tailwind do web (`w-16 h-16 rounded-lg`, `h-6 w-20 rounded-full`, …).

Reconstruir vira quase transliteração — `<View>` → `<div>`, `<Text>` → `<span>`/`<p>` — preservando o `className`. Isso dá fidelidade bem maior do que ler PNG e é muito mais rápido. O `.pen` continua sendo a fonte de verdade para o que o código não carrega (espaçamento de canvas, estados de tela ainda não implementados); as `screens-v2` servem de conferência visual final.

**4. Públicos** (`04-publicos/`) — overline `PRA QUEM É`, H2 "Um app, dois jeitos de usar.", duas colunas (cidadão / empresa-ecoponto) com os CTAs já definidos.

**5. Denúncia** (`05-denuncia/`) — H2 "Viu descarte irregular? Registre em 3 passos.", os 3 passos e o fecho já escritos.

**6. CTA final + footer** (`06-cta-final/`) — H2 "Pronto pra dar destino certo ao que sobra?", badges de loja, CTA de cadastro, links legais e `suporte@oikos.company`.

## Tokens

O `globals.css` de hoje é claro e quente (`--background: #faf9f4`). A landing é escura sobre imagem. Em vez de mexer nos tokens globais, adicionar um bloco de tokens com escopo próprio, evitando qualquer regressão nas telas existentes:

```css
@theme {
  --color-landing-ink: #fff3f0;
  --color-landing-muted: rgb(255 255 255 / 0.8);
  --animate-rise: rise 1s cubic-bezier(.44, 0, .56, 1) both;
  @keyframes rise { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
}
```

O verde `#3f6212` do `DESIGN.md` continua sendo a única cor de ação nos CTAs.

## Dependências novas

```
three     ^0.185   178 KB gz   0 deps   → ripple do hero
animejs   ^4.5      39 KB gz   0 deps   → entrada, stagger, sticky scroll
```

Ambas ESM e tree-shakeable. `three` só é alcançável via `next/dynamic`, então fica fora do bundle inicial da home. `@types/three` como devDependency.

## Onde este plano vive

Este documento é gravado em `web/plans/landing-page/NOVO-LAYOUT.md`, ao lado do plano de conteúdo que já existe lá, e o `00-roteiro.md` ganha um ponteiro para ele. A execução é quebrada em tickets com checklist em `web/plans/landing-page/tickets/`, marcados conforme o trabalho anda — é o log de execução que impede a perda de fio entre sessões.

## Orquestração

Eu não executo os tickets: decido, reviso e sintetizo. A execução vai para agentes mais baratos, escolhidos por risco da tarefa.

| Ticket | Executor | Por quê |
|---|---|---|
| T01 route group | `opencode/big-pickle` (free) | mover pastas e dividir layout — mecânico e verificável |
| T02 deps + primitivas | subagente **sonnet** | `cva` seguindo o molde de `ui/button.tsx`; precisa de padrão, não de invenção |
| T03 hero estático | subagente **sonnet** | layout e tipografia a partir de specs numéricas já medidas |
| T04 imagens do hero | **eu** | exige o MCP do Higgsfield e julgamento visual do par pristine/degradada |
| T05 ripple three.js | **eu** | shaders, blending, color space — os modos de falha são silenciosos |
| T06 motion anime.js | subagente **sonnet** | API nova (v4); passo os trechos de doc já levantados |
| T07 seções 2, 4, 5, 6 | subagente **haiku** | layout e copy já escrita, baixo risco |
| T08 sticky + telas | `opencode` free + **sonnet** | transliterar NativeWind→DOM é mecânico e volumoso; o sticky scroll fica com o sonnet |

Modelos gratuitos confirmados nesta máquina: `opencode/big-pickle`, `opencode/hy3-free`, `opencode/mimo-v2.5-free`, `opencode/nemotron-3-ultra-free`, `opencode-go/ox-alpha-free`.

Regra de revisão: cada ticket entregue passa por `npm run lint` e `npx tsc --noEmit` antes de eu marcar o checkbox. Ticket que encostar em shader ou em rota existente eu confiro à mão, independente de quem executou.

## Tickets

Checklist detalhado de cada ticket em [`tickets/`](./tickets/) — este é o log de execução, marcado conforme o trabalho anda:

- [`T01-route-group.md`](./tickets/T01-route-group.md)
- [`T02-deps-primitivas.md`](./tickets/T02-deps-primitivas.md)
- [`T03-hero-estatico.md`](./tickets/T03-hero-estatico.md)
- [`T04-imagens-hero.md`](./tickets/T04-imagens-hero.md)
- [`T05-ripple-threejs.md`](./tickets/T05-ripple-threejs.md) — inclui a lista completa de armadilhas ogl→three (blending, color space, clamp do campo, delta do loop) do porte técnico feito antes de codar
- [`T06-motion.md`](./tickets/T06-motion.md)
- [`T07-secoes-copy.md`](./tickets/T07-secoes-copy.md)
- [`T08-produto-em-acao.md`](./tickets/T08-produto-em-acao.md)

## Verificação

1. `npm run dev` e abrir `/` — hero monta com stagger, ripple responde ao ponteiro revelando a degradação, cena volta ao pristine ao parar.
2. Confirmar que `/login`, `/registro`, `/suporte`, `/termos-de-uso` e `/design-system` seguem respondendo com `SiteHeader`/`SiteFooter` intactos.
3. DevTools com `prefers-reduced-motion: reduce` e com WebGL desabilitado → fallback estático, sem erro no console.
4. `npm run lint` (Biome) e `npx tsc --noEmit`.
5. `npm run lighthouse` — confirmar que three.js não regrediu LCP/TBT; se regrediu, apertar o gate de montagem do canvas.
6. Responsivo em 390px, 768px e 1440px; verificar que o sticky scroll degrada para fluxo normal no mobile.
