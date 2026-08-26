# T05 — Ripple em three.js

Executor: eu (shaders, blending, color space — os modos de falha são silenciosos: compila, roda, entrega a imagem errada).

Depende de T04 (as duas imagens) e é consumido por T03 (substitui o fundo estático do hero).

`three` **não está instalado** ainda (só `gl-matrix`, arrastado pelo maplibre). `npm i three`; checar se `node_modules/three/package.json` já expõe `.d.ts` antes de instalar `@types/three` (o pacote DT costuma ter defasagem de releases — `skipLibCheck: true` já está ligado no `tsconfig.json` se precisar).

## Decisões de arquitetura

| Questão | Decisão | Motivo |
|---|---|---|
| Material | `RawShaderMaterial` nos dois passes | zero prefixo injetado — o GLSL do react-bits entra quase verbatim; `ShaderMaterial` colide em `attribute vec3 position` |
| GLSL version | ES 1.00, sem `glslVersion` | mantém `attribute`/`varying`/`gl_FragColor`; WebGL2 compila ESSL1 nativamente |
| Fullscreen | triângulo próprio (`BufferGeometry`, position vec2 + uv vec2, `[-1,-1, 3,-1, -1,3]`) | mesmo padrão nos 2 passes, byte a byte o `Triangle` do ogl, sem infra extra de `three/addons` |
| Câmera | uma `new THREE.Camera()` identidade, compartilhada | os shaders ignoram matrizes; só satisfaz a assinatura `render(obj, camera)` |
| Field RT | `HalfFloatType` com fallback `UnsignedByteType`, `NoColorSpace` | tira o banding de 8 bits do gradiente do glint — mas exige clamp manual, ver abaixo |
| Color space | texturas `SRGBColorSpace`, efeito em linear, encode manual no fim do fragment | mix mais limpo nos meios-tons; alternativa de paridade exata com ogl documentada abaixo |
| Gate de carga | `matchMedia("(hover:hover) and (pointer:fine)")` + `IntersectionObserver` + `import()` dinâmico dentro do efeito | mobile e o Lighthouse (preset mobile) nunca baixam os ~170 KB gz do three |

## Mecânica de origem (react-bits `RippleDistortion`, ogl)

1. Ondas emitidas ao longo do ponteiro quando ele anda mais que `spacing` px, ring buffer de 100 instâncias.
2. Desenhadas com blending aditivo num render target — o displacement field. Cada onda cresce e decai (`decay = exp(-delta·ln500/fade)`).
3. Passe fullscreen lê o campo no canal `.r` como `amount`, desloca a UV da textura, mais swirl/dispersão/glint.

## O reveal: fragment de composição

Pipeline: `coverUV` (espaço de textura) → ler campo em `vUv` (espaço de tela — **não são a mesma UV**, ver armadilha #14 abaixo) → gradiente → swirl → offsets por canal → amostrar as duas imagens → `mix` por `reveal` → tint → grayscale → glint aditivo (depois do mix, é aditivo e independente da imagem visível) → encode sRGB.

```glsl
float amount = min(texture2D(uField, vUv).r, uFieldClamp);
vec2  uv     = coverUv(vUv, uResolution, uTextureSize);
vec2  uvOff  = uv + offset;

float reveal = smoothstep(uRevealEdge.x, uRevealEdge.y, amount * uRevealGain);
reveal = min(reveal, uRevealMax);   // nunca 100% degradado — sustenta a metáfora

vec3 pristine = texture2D(uPristine, uvOff).rgb;               // 1 tap
vec3 degraded = vec3(                                           // dispersão só na degraded, 3 taps
  texture2D(uDegraded, uvOff + push).r,
  texture2D(uDegraded, uvOff).g,
  texture2D(uDegraded, uvOff - push).b
);
vec3 color = mix(pristine, degraded, reveal);
```

Custo: 4 taps de imagem (dispersão nas duas custaria 6; a diferença visual é imperceptível porque a franja cromática só aparece onde `reveal→1`, e ali a `degraded` já domina). `uRevealMax` (~0.9) e `uRevealEdge` como `vec2` (borda macia `(0.05,0.45)` vs. definida `(0.25,0.35)`) ficam expostos como prop.

Quando as ondas decaem, `amount→0 ⇒ reveal→0` e a cena volta ao pristine sozinha — é propriedade do campo, não estado JS.

## Dois `uTextureSize`

Um único, derivado da `pristine` — as duas imagens precisam ter o **mesmo aspect ratio** (resoluções diferentes com aspect igual mapeiam pra mesma UV, sem problema). Se os aspects divergirem, as bordas do reveal se descolam e quebra a ilusão de "mesma cena". Validar em dev:

```ts
if (Math.abs(aspectPristine - aspectDegraded) > 0.01) console.warn(...);
```

## Port ogl → three.js: armadilhas que quebram em silêncio

1. **`transparent: true` é obrigatório no material do wave pass.** `WebGLState.setMaterial()` só aplica `blending` quando `transparent === true`; senão força `NoBlending` e ignora todo o `CustomBlending`. Sem isso, cada onda sobrescreve a anterior em vez de somar.
2. **Blending**: `blending: THREE.CustomBlending`, `blendSrc/blendDst: THREE.OneFactor`, `blendEquation: THREE.AddEquation` (equivalente a `setBlendFunc(gl.ONE, gl.ONE)`; `AdditiveBlending` pronto **não** é igual — é `SrcAlpha, One`).
3. **`side: THREE.DoubleSide`** — default do three é `FrontSide`; dependendo do winding do array de vértices o pass some inteiro (equivalente a `cullFace: false`).
4. **`frustumCulled = false` nos dois meshes**, e não por causa do frustum: `position` com `itemSize: 2` faz `computeBoundingSphere()` ler `.z` como `undefined` → NaN → three loga e não desenha nada.
5. **Color space do render target**: `NoColorSpace` sempre, senão o campo (dado, não cor) é gamma-encodado e o gradiente/glint saem errados.
6. **Color space das texturas**: `SRGBColorSpace` com decode automático por hardware — mas `RawShaderMaterial` não injeta o chunk de re-encode. Sem `linearToSrgb()` manual no fim do fragment, a hero fica visivelmente escura/dessaturada, sem warning nenhum. (Alternativa de paridade exata: `NoColorSpace` nas duas texturas, sem encode manual — pixels idênticos ao protótipo ogl.)
7. **`HalfFloatType` precisa de clamp manual** (`min(amount, uFieldClamp)`) — o `UNSIGNED_BYTE` do ogl clampava em 1.0 de graça; sem o clamp, ondas sobrepostas somam além de 1 e saturam/estouram.
8. **`HalfFloatType` exige feature-detect** de `EXT_color_buffer_half_float`/`EXT_color_buffer_float`; sem isso o framebuffer fica incompleto e a tela vai preta sem erro. Fallback para `UnsignedByteType`.
9. **`autoClear` fica `true`** — é o que limpa o RT a cada frame antes do campo aditivo escrever de novo. Desligar "pra economizar" faz o campo acumular e saturar para branco em ~2s.
10. **RT dimensionado em device px, não CSS px** — usar `renderer.getDrawingBufferSize()`, não `container.clientWidth/Height` direto, senão o campo sai com metade da resolução em telas 2×.
11. **`setSize(w, h, false)`** — o terceiro argumento evita que o three escreva `style.width/height`, brigando com o CSS. `setPixelRatio` sempre antes de `setSize`.
12. **`needsUpdate = true`** em cada `InstancedBufferAttribute` (`iOffset`/`iScale`/`iOpacity`) a cada frame após escrever os `Float32Array`, e em `new THREE.Texture(img)` construída manualmente (`TextureLoader` faz isso sozinho; instanciar direto, não).
13. **A UV do campo (`vUv`) não é a mesma UV da imagem (`coverUv(vUv)`)** — o campo vive em espaço de tela, a imagem em espaço de textura recortado. Misturar as duas é o bug mais fácil de cometer: o rastro aparece esticado/deslocado do cursor sempre que o aspect da imagem difere do aspect do canvas.
14. **`delta` do loop precisa de clamp** (`Math.min(delta, 1/30)`) — sem isso, voltar de uma aba oculta produz um `delta` gigante, satura growth/decay e todas as ondas nascem-e-morrem no mesmo frame (flash).
15. **Cleanup incompleto + StrictMode dev** (que invoca o efeito 2×) acumula contextos WebGL vivos → "Too many active WebGL contexts" depois de alguns hot reloads. `dispose()` em cada geometria/material/textura/RT, `renderer.dispose()`, e só depois `renderer.forceContextLoss()`.
16. **`wrapS/wrapT: ClampToEdgeWrapping`**, nunca repeat — a UV deslocada sai de `[0,1]` na borda da onda.
17. **Descobertas na implementação, não previstas na análise inicial:**
    - **`renderer.sortObjects` (default `true`) computa a bounding sphere para ordenar profundidade, mesmo com `frustumCulled = false`** — são checagens independentes. `frustumCulled` só evita a checagem de frustum; o passo de sort roda de qualquer forma dentro de `projectObject()` e chama `geometry.computeBoundingSphere()`, que lê `.z` como `undefined` em atributos `itemSize: 2` e gera o mesmo erro do item 4. Como os dois passes são renderizados manualmente e cada um tem um único objeto, não há nada a ordenar: `renderer.sortObjects = false` logo após criar o renderer resolve por completo, sem precisar fornecer bounding sphere falsa.
    - **Não usar o `<img>` do `next/image` como fonte da textura.** O `fill` + `sizes="100vw"` gera `srcset` responsivo, e o navegador pode trocar o `currentSrc` do elemento entre o momento em que o código decodifica a imagem e o momento em que o three sobe a textura para a GPU (a montagem só ocorre no próximo `render()`, não na criação do `THREE.Texture`). Isso produz `GL_INVALID_VALUE: glTexSubImage2DRobustANGLE: Offset overflows texture dimensions` e a tela fica preta sem nenhum erro de JS. Correção: carregar a textura via `new Image()` dedicado, apontando direto para a prop `pristineSrc`/`degradedSrc` (URL fixa, sem srcset), independente do `<Image>` do Next usado só para o layer visual/LCP.

## Montagem, gate e fallback

O fallback **é a camada base do próprio componente**, não algo separado: `next/image` (`fill`, `priority`, `sizes="100vw"`, `alt` real) é o LCP e o conteúdo acessível; o `<canvas>` fica por cima com `aria-hidden`, `pointer-events-none`, `opacity-0` até o primeiro frame, então faz fade-in. A textura da imagem degradada é carregada à parte, via `new Image()` dedicado (ver item 17 acima) — não há `<Image>` oculta no DOM para ela, o que também evita baixar o arquivo duas vezes por caminhos diferentes.

Gate de montagem, todas as condições precisam valer: `matchMedia("(hover:hover) and (pointer:fine)")` (o efeito é um rastro de mouse — em touch não existe, e isso sozinho já garante que celular nunca baixa o three), `!prefers-reduced-motion`, WebGL2 suportado (testar via `try/catch` ao criar o renderer, não um contexto de teste descartável). `import("./ripple-reveal-canvas")` só dentro do callback do `IntersectionObserver` — dois níveis de laziness (esse + `import("three")` dentro do efeito do canvas) garantem que nada do bundle WebGL chega a quem não passa no gate.

Pausar `renderer.setAnimationLoop(null)` fora da viewport e em `visibilitychange`; resetar `last = performance.now()` ao retomar. Listener de `webglcontextlost` (`preventDefault()`) volta ao fallback com fade.

Config mutável do loop em `useRef`, escrita **dentro de um `useEffect` sem deps** (não no corpo do componente — mutar ref durante render quebra o React Compiler silenciosamente). Deps do efeito principal só com primitivos (`pristineSrc`, `degradedSrc`, `quality`), nunca um objeto de options recriado a cada render do pai.

## Checklist

- [x] `npm i three`; confirmar `.d.ts` embutido antes de `@types/three` — não embutido, `@types/three` instalado (feito em T02)
- [x] `hero-ripple-reveal/shaders.ts` — os 4 GLSL com `precision highp float;` adicionado, sem outra mudança de sintaxe
- [x] Fragment de composição com `uPristine`/`uDegraded`, `mix` por `smoothstep`, `linearToSrgb()` no fim
- [x] Wave pass: `transparent:true`, `CustomBlending (One,One)`, `side:DoubleSide`, `frustumCulled:false`
- [x] `InstancedBufferGeometry` + `DynamicDrawUsage`, `needsUpdate=true` nos 3 atributos por frame
- [x] Field RT: `HalfFloatType` com fallback + feature-detect, `NoColorSpace`, clamp `uFieldClamp` no shader
- [x] RT dimensionado por `getDrawingBufferSize()`, `setSize(w,h,false)`, `setPixelRatio` antes
- [x] `autoClear` intocado (`true`)
- [x] Campo amostrado em `vUv`; imagens amostradas em `coverUv(vUv)` — não confundir as duas
- [x] `delta` do loop com `Math.min(delta, 1/30)`
- [x] Gate: `matchMedia(hover/pointer)` + `!reduced-motion` + WebGL2 + `IntersectionObserver` + `import()` dinâmico
- [x] rAF pausado fora da viewport e em `visibilitychange`; `webglcontextlost` tratado
- [x] Cleanup: `dispose()` de tudo, depois `renderer.dispose()`, depois `forceContextLoss()`
- [x] `hero-ripple-reveal/index.tsx` com fallback em camada (pristine sempre no DOM, canvas por cima)
- [x] Config do loop em `useRef`, escrita em `useEffect` sem deps — nunca no corpo do componente
- [x] `renderer.sortObjects = false` (item 17) — evitou o NaN de bounding sphere sem precisar mockar geometria
- [x] Textura carregada via `new Image()` dedicado, não pelo `<img>` do `next/image` (item 17)
- [x] Teste manual via Playwright: passar o mouse sobre a área do rio revela lixo/mancha de óleo sem deslocamento em relação ao cursor; soltar o mouse decai de volta ao pristine em ~3s; fallback mobile e `prefers-reduced-motion` confirmados sem canvas montado; console limpo em todos os cenários
- [x] Ajuste de tuning: defaults iniciais (`strength:0.35`, `swirl:1.4`, `dispersion:0.6`) deixavam o efeito ilegível — muito próximo de um warp líquido genérico, lavando o conteúdo revelado. Reduzidos para `strength:0.05`, `swirl:0.35`, `dispersion:0.12`, `grayscale:0.08`, com `revealGain:2.4` para compensar — o lixo e a mancha de óleo ficam legíveis dentro do rastro
- [x] `npm run lint` e `npx tsc --noEmit` limpos
- [ ] `npm run lighthouse` confirma que o bundle WebGL não chega ao preset mobile — pendente, rodar antes do PR final
