# Seção 3 — Produto em ação

> A sequência de 5 telas (login/cadastro/mapa/cadastro de empresa/denúncia) e a técnica de
> "telefone 3D com `<Html>`" descritas abaixo são o rascunho de pesquisa original — **superadas**
> pela decisão em [`tickets/T08-produto-em-acao.md`](../tickets/T08-produto-em-acao.md): telas em
> DOM/Tailwind (não telefone 3D), sequência revisada pra 3 beats (Home → Pontos de coleta →
> Denúncia), login/cadastro/empresa removidos. Mantido aqui só como histórico da pesquisa de
> referência (Apple, etc.), que ainda vale.

## Pesquisa de referência

### Apple — iphone-17-pro/

Screenshots em `references/`:
- `apple-hero-color-transition.jpg` — hero pinned: o telefone (fundo preto puro) troca de material/cor
  conforme o scroll avança dentro da seção fixa, antes de "soltar" pro resto da página.
- `apple-sticky-nav-carousel.jpg` — depois do hero, a página vira scroll normal (não pinned): um card
  horizontal "Get the highlights" com um `Watch the film` — ou seja, a Apple reserva a técnica cara
  (pinned + troca de frame) só pro hero, e usa vídeo pré-gravado + carrossel simples pro resto. Confirma
  a decisão que já tínhamos tomado de reservar WebGL/shader só pro Hero da Oikos.
- `apple-closer-look-tabs.jpg` — a peça mais relevante pra nossa seção: **"Take a closer look"** — uma
  lista vertical de abas à esquerda (Colors, Aluminum unibody, Vapor chamber, Ceramic Shield, Immersive
  pro display, Camera Control, Action button) com o telefone renderizado à direita, cross-fade suave
  entre estados conforme a aba ativa muda (por clique ou por scroll dentro da seção pinned). O blur/glow
  na transição sugere troca de vídeo/imagem pré-renderada, não recálculo de material em WebGL ao vivo —
  mais barato e mais controlável visualmente que 3D live.

**Técnica confirmada**: a Apple não faz um objeto 3D reagindo livremente ao scroll — é uma seção
`position: sticky`/pinned onde o *progresso do scroll* (ou clique numa aba) dirige qual de um conjunto
finito de estados pré-produzidos (vídeo/imagem) é mostrado, com cross-fade entre eles. Isso é MUITO mais
barato e replicável do que simular deformação de material em tempo real.

### Contra — project-rate-hiring-calculator/

A página não renderizou visualmente no browser automatizado (ficou presa no loader/spinner da marca —
possível dependência de interação real do usuário ou de viewport specifico). Via extração de texto,
confirmei que é uma **calculadora interativa multi-step** (`STEP 0 1 2 3 4`), com depoimentos em
carrossel, painel de resultado ("Money saved / Time saved") e captura de e-mail no fim. Não é scroll+3D
— é um wizard de etapas com resultado ao vivo. Relevante como referência de **progressão por etapas
numeradas** (0→4) e "resultado revelado no final", não como referência de renderização 3D.

## Spec da seção — "Produto em ação"

### Sequência de telas (5 estados, replicando o padrão de abas da Apple)

| # | Tela | O que comunica |
|---|---|---|
| 1 | Login | Entrada simples, sem fricção — "é só um app, não um formulário de prefeitura" |
| 2 | Registro (perfil + endereço) | Cadastro rápido, dado real (endereço) usado pra algo útil (achar pontos perto) |
| 3 | Mapa de pontos de coleta | O núcleo do produto — pontos reais, filtro por resíduo/horário |
| 4 | Cadastro de empresa/ecoponto | O outro lado do marketplace — quem oferece o ponto de coleta |
| 5 | Denúncia (foto + geo + status) | O módulo de maior peso institucional, ver seção 5 dedicada |

### Abordagem técnica recomendada

**Não** replicar a Apple ao pé da letra (vídeo pré-renderado por Blender) — nosso caso é diferente:
o "conteúdo" da tela é UI de produto real, que já muda com frequência (novas features), então
pré-renderizar vídeo por tela ficaria obsoleto rápido e é caro de re-gerar a cada mudança de design.

Recomendação: **telefone 3D com a tela como overlay de UI real**, não vídeo pré-gravado:

- Modelo 3D low-poly do telefone (Blender → glTF) renderizado com `react-three-fiber`, luz/ambiente
  simples (não precisa ray tracing — a Apple também não usa WebGL pesado aqui).
- A "tela" do telefone é um `<Html transform occlude>` do `@react-three/drei`, recortado na forma da
  tela do modelo — renderiza componentes React **reais**, reaproveitando os componentes já existentes
  do app (`src/app/(public)/login/_components/login-form.tsx`,
  `src/app/(public)/registro/_components/sign-up-form.tsx`, cards do `market-list.tsx`) com dados
  mockados — isso satisfaz o requisito de "não é printscreen": é o design de verdade renderizado ao
  vivo, só que dentro do canvas 3D.
- Sincronização com scroll: seção com `position: sticky` (como a Apple), progresso do scroll mapeado
  0→1 via `useScroll` (Framer Motion) ou `ScrollTrigger` (GSAP) — cada 20% de progresso troca a tela
  ativa (`currentScreen = Math.floor(progress * 5)`), com cross-fade de opacidade entre telas (sem
  troca de modelo 3D, só o conteúdo do `<Html>` muda) — mais leve que a abordagem Apple porque não tem
  vídeo pra carregar, só componentes React.
- Legenda lateral (texto) troca junto, mesmo padrão de "Colors / Aluminum unibody / ..." da Apple, mas
  vertical numa lateral com peso editorial (Oswald, como define o DESIGN.md).

**Prós dessa abordagem** vs. sequência de frames pré-renderados: sempre atualizado com o design real do
produto, não precisa re-render a cada mudança visual, bundle menor (sem vídeo pesado).
**Contras**: exige que os componentes React usados aqui aceitem dados mockados sem quebrar (loading
states, etc.) e mais trabalho de engenharia do que só trocar um `<video>`.

### Copy de legenda por tela (rascunho, tom DESIGN.md — Oswald pros títulos)

1. **Entrar** — "Sem burocracia pra começar."
2. **Cadastro** — "Seu endereço, seu ponto de partida."
3. **Mapa** — "Ache o ponto certo pro seu resíduo."
4. **Cadastrar ponto de coleta** — "Sua empresa, visível pra quem procura."
5. **Denúncia** — "Registrou, documentou, foi encaminhado."


Observações:
Nessa parte de demonstração, até mesmo para a gente poder criar um motion, ou poder criar partes animadas da própria aplicação, por assim dizer, vou deixar marcado aqui.

Mas o repositório web, dentro tem um arquivo pencil, que contém todos os componentes, todas as telas do mobile.

Então, nós podemos utilizar aqui dentro, como, como posso dizer, como próprio exemplo, como própria animação, como próprio reaproveitamento de componentes. Então é essa parte que eu queria deixar clara aqui. 
