# Hero — Ideia 01: cena WebGL interativa (mar + objetos + dissolve/reforma)

Status: **ideia em avaliação**, não é decisão final. Guardada pra comparar com outras ideias depois.

## Objetivo da seção (correção importante)

O Hero **não** existe pra explicar o que a Oikos faz — isso é trabalho das seções seguintes. O Hero
existe pra **chamar atenção e comunicar, só pela experiência, que a Oikos é uma startup de
tecnologia do ecossistema, não uma "empresa de reciclagem"**. Precisa parecer grande, moderno,
interativo — uma peça de apresentação, não uma explicação.

Decisão explícita: **sem vídeo**. Produção de vídeo (mesmo via IA) tem ciclo longo demais pro tempo
disponível agora. A alternativa é uma **cena 3D ao vivo no navegador**, que além de mais rápida de
iterar, comunica "tecnologia" melhor que vídeo pré-renderado — é interativa, reage a quem está
usando o site, nunca é a mesma experiência duas vezes.

## Conceito

Fundo: um **mar/líquido** que reage ao movimento do mouse. Flutuando nele, **objetos 3D de resíduo**
(garrafa PET, garrafa de vidro, celular, notebook, sacola plástica, banana, maçã, lata) — estilizados,
não fotorrealistas — que se movem levemente conforme o cursor passa perto (parallax/física leve).

Ciclo periódico: de tempos em tempos, um objeto **dissolve** na superfície do líquido, e do mesmo
lugar **emerge uma "criação"** — tênis, camiseta, brinquedo, peça impressa em 3D — como se o líquido
tivesse acabado de formar aquilo. Não precisa ser sempre o mesmo par objeto→criação; pode variar.

## Referências de mood (não de estrutura)

O vídeo em `../references/research___recycled (720p).mp4` (e os frames extraídos em
`../references/video1-frames-dense/`) não vira mais roteiro literal — mas o **ritmo, a paleta
monocromática que "acorda" com cor no momento certo, e a ideia de fragmento se tornando outra coisa**
continuam válidos como referência de sensação, adaptados pra uma peça ao vivo em vez de pré-renderada.

## Stack técnica

`react-three-fiber` + `@react-three/drei` (padrão React pra Three.js, se encaixa direto no Next.js
já usado no `web`).

### Componentes-base identificados (React Bits, `DavidHDev/react-bits`)

Repo tem 165+ componentes; inspecionei o código-fonte de dois candidatos diretos:

- **`LiquidEther`** (`src/content/Backgrounds/LiquidEther/LiquidEther.jsx`) — simulação de fluido
  real em WebGL (não é decoração: usa `isViscous`, `iterationsPoisson`, `BFECC` — termos de solver
  Navier-Stokes simplificado rodando na GPU). Já expõe `mouseForce`, `cursorSize` e `colors` (array
  de cores) prontos pra uso. **Candidato direto pro "mar"**, só precisa retematizar com a paleta do
  DESIGN.md (verde + acentos por categoria de resíduo) em vez das cores padrão do componente.
- **`Ballpit`** (`src/content/Backgrounds/Ballpit/Ballpit.jsx`) — cena física (raycaster de mouse,
  `InstancedMesh`, ambient/point light, `RoomEnvironment` pra reflexo) com objetos que reagem ao
  cursor. Usa `SphereGeometry` por padrão (bolinhas). **Precisa ser forkado**: trocar a geometria da
  esfera pelos modelos `.glb` que vamos construir no Blender, mantendo o motor de física/interação.
- Outros candidatos no catálogo que valem investigar quando formos prototipar o dissolve: `Ferrofluid`,
  `MoltenMetal`, `Particles` — não inspecionados ainda em detalhe.
- MCP de terceiros pra explorar o catálogo via agente: `ceorkm/reactbits-mcp-server` (não oficial da
  React Bits, mas instalável via `npx reactbits-dev-mcp-server` — cobre 135+ componentes, busca por
  categoria/nome). Ainda não configurado no projeto — instalar quando formos prototipar de verdade.

### Dissolve/reforma — abordagem recomendada

**Não** tentar morph de malha exato (objeto A → objeto B com vértices correspondentes) — exige
retopologia manual casada entre modelos com formas muito diferentes (garrafa → tênis), trabalho
grande pra pouco ganho. Abordagem mais viável:

1. **Shader de dissolve** no objeto que está sumindo — técnica padrão em Three.js (fade por
   threshold de ruído sobre o alpha/posição do fragmento), bem documentada, não precisa inventar.
2. A "criação" nova **emerge com um shader de reveal** sincronizado ao mesmo campo de ruído usado
   pelo `LiquidEther` naquele ponto da superfície — dá a sensação de causalidade ("o líquido formou
   isso") sem exigir topologia compatível entre os dois modelos.

## Escopo de Blender (revisado — bem mais leve que a ideia anterior de Geometry Nodes/fratura)

1. **Modelagem low-poly** dos objetos de resíduo (8 itens: PET, vidro, celular, notebook, sacola,
   banana, maçã, lata) — estilizado, coerente com o "papel reaproveitado" do DESIGN.md, não realista.
2. **Modelagem das criações** (2-4 itens: tênis, camiseta, brinquedo, peça 3D) — só o suficiente pro
   ciclo de dissolve/reforma.
3. **Materiais simples** na paleta por categoria do DESIGN.md.
4. **Export `.glb`** (glTF binário + Draco) — formato consumido pelo `react-three-fiber`.
5. Shape keys **não são necessárias** nessa abordagem (o dissolve/reveal é via shader, não morph de
   vértice) — escopo de aprendizado fica em modelagem básica + export, não em Geometry Nodes.

## Pendências

- [ ] Prototipar `LiquidEther` isolado (retematizado) pra validar a leitura visual antes de investir
      em modelagem.
- [ ] Decidir a lista final dos 8 objetos de resíduo + 2-4 criações.
- [ ] Testar o shader de dissolve/reveal num par só (ex: garrafa PET → tênis) antes de generalizar.
- [ ] Avaliar custo de performance em mobile — `LiquidEther` é fluido simulado em tempo real, pode
      pesar em aparelho fraco; precisa de fallback (versão estática/menos iterações) abaixo de tablet.
