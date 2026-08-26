# Roteiro da Landing Page — Oikos

Issue: [#63 — Criar landing page](https://github.com/oikos-circular-environment/web/issues/63)
Branch: `63-criar-landing-page`

**Direção visual e execução**: [`NOVO-LAYOUT.md`](./NOVO-LAYOUT.md) fecha a decisão de hero que este roteiro deixou em aberto (ripple de duas imagens revelando degradação, inspirado em specs medidas do fora.so) e quebra a implementação em tickets com checklist em [`tickets/`](./tickets/). A copy e a narrativa das seções abaixo continuam valendo — o que mudou foi só a direção visual do hero e a forma de construir a seção 3 (DOM transliterado do mobile em vez de telefone 3D).

## Seções (ordem final)

| # | Diretório | Seção | Status |
|---|---|---|---|
| 1 | [`01-hero/`](./01-hero/) | Hero | Em pesquisa (referências de vídeo) |
| 2 | [`02-problema/`](./02-problema/) | O problema | Rascunho |
| 3 | [`03-produto-em-acao/`](./03-produto-em-acao/) | Produto em ação (telefone 3D) | Em pesquisa (referências de design) |
| 4 | [`04-publicos/`](./04-publicos/) | Dois públicos, dois CTAs | Rascunho |
| 5 | [`05-denuncia/`](./05-denuncia/) | Denúncia em destaque | Rascunho |
| 6 | [`06-cta-final/`](./06-cta-final/) | CTA final + footer | Rascunho |

Cada diretório tem um `README.md` com o roteiro/copy da seção e um `references/` (quando aplicável)
com todo material de apoio — frames extraídos de vídeo, notas de análise de outros sites, prints —
gerado durante a pesquisa daquela seção especificamente.

## Mudanças em relação à primeira proposta (discutida no chat)

- **"Confiança institucional" removida.** A Oikos ainda não tem nome de marca/reputação
  estabelecida — uma seção dedicada a "somos confiáveis" soaria vazia agora. Selos legais
  (CNPJ, termos) continuam existindo no footer, só não viram seção própria.
- **"Como funciona" (passo a passo) e "Módulos" (grid de cards) consolidados em "Produto em
  ação".** Em vez de descrever os módulos em texto/ícone, a seção 3 mostra o produto de verdade
  — um telefone 3D com a réplica da UI (não printscreen) revelando login → registro → mapa de
  pontos → cadastro de empresa → denúncia à medida que o usuário rola a página. É mais
  convincente que dois blocos de texto separados e evita repetir a mesma informação duas vezes.
- **Denúncia continua com seção própria** (5), reforçando o módulo com mais peso institucional,
  mesmo aparecendo de passagem no walkthrough da seção 3.

## Status / continuar daqui (handoff pra próxima sessão)

Sessão anterior terminou aqui — próximo passo combinado é **prototipar** (sair do discurso e
montar algo visível), possivelmente via **Framer**: o usuário está instalando o `@framer/agent`
+ MCP do Framer num terminal separado; a sessão precisa reiniciar pra esse MCP aparecer nas
tools. **Decisão em aberto**: Framer é só ferramenta de prototipagem visual (mockup pra validar
antes de portar pro Next.js real do `web/`), ou vira o alvo de build de fato? Não assumir — o
`web/` é Next.js (App Router) por convenção do repo (`AGENTS.md`), então se Framer virar o alvo
final isso é uma mudança de stack que precisa ser confirmada explicitamente, não inferida.

**Hero (`01-hero/`)**:
- `ideia-01` (cena 3D interativa — mar `LiquidEther` + objetos flutuantes fork do `Ballpit` +
  dissolve/reforma via shader) documentada, sem protótipo ainda.
- `ideia-02` (ilustração isométrica + Liquid Glass real via `FluidGlass`/`GlassSurface`) — full
  bleed confirmado; variável dia/noite ligada ao tema (`next-themes`) ainda com decisão aberta
  entre Opção A (diorama 3D ao vivo, relighting grátis mas cena inteira pra modelar) e Opção B
  (sprites 2D em camadas, mais barato, inclinação atual mas não fechada).
- **Tentativa de gerar a imagem da ilha/ecossistema direto no Gemini (nano banana 2, via
  `gemini.google.com/images` navegado pelo claude-in-chrome) não agradou o usuário** — resultado
  descartado. O prompt usado (disciplina de `human-image`/`stylized.md`: isométrico low-poly,
  3 zonas cidade/ecoponto/natureza, paleta limitada do DESIGN.md) não está salvo em arquivo — se
  for retomar geração de imagem depois, vale re-escrever do zero em vez de reusar aquele prompt
  sem revisão, já que o resultado não convenceu.
- Vale notar: o histórico do Gemini do usuário já tem conversas anteriores e não relacionadas a
  esta sessão sobre esse mesmo tema ("Floating Eco-Industrial Diorama Render", "Recreating
  Floating Forest Island 1:1", "Floating Island Wildlife Sanctuary Diorama", "Floating Island
  Diorama Prompt Generation", "Logo ESG Modular Oikos", "Logo Design for Oikos ESG") — não
  exploradas nesta sessão, o usuário optou por seguir com prompt novo. Podem valer uma olhada
  antes de tentar gerar imagem de novo.

**Skills instaladas** (`~/.claude/skills/`, globais — via `human-agent-lab/INSTALAR TODAS SKILLS/`,
pasta movida pra `/media/ccrs/development/oikos/human-agent-lab/`, fora do repo git do `web`):
`human-image`, `human-cinematic`, `human-dna`, `human-carrossel`, `human-social`, `human-team`,
`human-motion` — todas usam Higgsfield CLI ou Magnific MCP pra gerar imagem/vídeo (não o Gemini
web direto). `human-image` é a mais relevante pra retomar geração de imagem de forma automatizada
em vez de manual pelo browser.

**Seções 02–06** (problema, produto-em-ação, públicos, denúncia, cta-final): rascunhos escritos,
sem revisão do usuário ainda — não confundir "escrito" com "aprovado".

## Pipeline de produção (visão geral, detalhado em cada seção)

- **Imagens estáticas**: Google Gemini Pro (geração) — ilustrações de apoio, texturas.
- **Vídeo/motion**: Higgsfield — a partir das imagens geradas (image-to-video), para o Hero.
- **3D**: Blender (modelagem/render) + WebGL (`three.js`/`react-three-fiber` ou `ogl`) para o que
  precisa rodar ao vivo no navegador (telefone 3D interativo, shader de fundo do Hero).
- **Shaders**: GLSL customizado só no Hero (textura de fundo + transição resíduo→recurso), sem
  espalhar por outras seções — custo de performance, principalmente mobile.
