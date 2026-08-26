# Hero — índice

## Ideias

- [`ideia-01/`](./ideia-01/) — cena WebGL interativa: mar líquido que reage ao mouse (`LiquidEther`,
  React Bits) + objetos 3D de resíduo flutuando (fork do `Ballpit`) + ciclo de dissolve/reforma via
  shader. **Sem vídeo** — decisão explícita por tempo de produção. Status: em avaliação.
- [`ideia-02/`](./ideia-02/) — ilustração isométrica de ecossistema (zona urbana + ponto de coleta +
  natureza, divididas mas integradas) com UI em Apple Liquid Glass de verdade (`FluidGlass`/
  `GlassSurface`, React Bits, via `MeshTransmissionMaterial`) flutuando por cima. Mais barato de
  produzir que a `ideia-01` (sem Blender/física), menos "vivo". Status: em avaliação.

Cada ideia nova do Hero ganha seu próprio diretório `ideia-0N/` com README próprio. Este arquivo é
só o índice — não guarda conceito nenhum diretamente.

## Referências (compartilhadas entre ideias)

`references/` — material bruto, reutilizável por qualquer ideia:
- `research___recycled (720p).mp4` — vídeo de referência original enviado pelo usuário (34,88s).
- `video1-frames/` — 14 frames espaçados a cada ~2,5s (leitura inicial, rápida).
- `video1-frames-dense/` — 35 frames a 1fps, cobrindo o vídeo inteiro (leitura completa).
- `video1-recycled-heart-thumb.jpg`, `video2-nike-bottle-thumb.jpg` — thumbnails estáticos das duas
  URLs originais do Vimeo (não são o vídeo real — a extração de frame real só foi possível depois
  que o usuário forneceu o arquivo `.mp4` local).

### O que o vídeo de referência mostra (achado, não mais roteiro)

Não é um morph contínuo — é uma montagem de 4 motivos visuais recorrentes cortados no ritmo da
música: (1) sacolas flutuando no vazio, (2) escultura colorida crescendo de um vidro/frasco até um
burst de confete multicolorido, (3) papel triturado formando uma pilha/coração monocromática, (4)
uma "onda" de grade/wireframe erguendo-se em fumaça escura, onde nasce o wordmark "recycled" — esse
motivo recorre ~3 vezes e é a espinha dorsal da peça. Fecha num bloco sólido de confete com o
wordmark limpo.

Isso informou a `ideia-01` como referência de **ritmo e sensação** (paleta que "acorda" com cor no
momento certo, fragmento virando outra coisa) — não como estrutura a replicar literalmente, porque
reproduzir via vídeo (mesmo com pipeline Gemini→Higgsfield) tem ciclo de produção longo demais pro
tempo disponível agora.

## Pesquisa auxiliar já feita (vale pra qualquer ideia futura)

- **Blender MCP** (`ahujasid/blender-mcp`) existe e é mantido — addon Blender + servidor MCP via
  socket local, permite a um agente criar/modificar objetos, aplicar materiais, rodar Python,
  inspecionar cena e disparar renders por linguagem natural. Precisa do Blender aberto localmente
  (não roda headless). Não instalado ainda — decisão de quando começarmos a modelar de verdade.
- **React Bits** (`DavidHDev/react-bits`) — 165+ componentes React animados (backgrounds, texto, 3D).
  MCP de terceiros disponível: `ceorkm/reactbits-mcp-server` (`npx reactbits-dev-mcp-server`).
