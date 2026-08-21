# Seção 2 — Provocação: resíduo também é valor

## Objetivo

Manter a ideia central já aprovada — **"reciclar dá certo quando é fácil saber onde"** — mas elevar a seção para uma provocação antes da demonstração do produto.

A seção deve fazer o visitante perceber que o que parece lixo pode ser valor para outra pessoa: matéria-prima, renda, coleta pública, ecoponto, comprador, catador ou empresa que transforma aquele material.

A conclusão narrativa é simples: mesmo que o resíduo não valha dinheiro para quem separa, a pessoa já colabora ao **separar, avisar e encontrar o destino certo**. A seção 3 entra em seguida mostrando como o app faz isso na prática.

## Copy atualizada

**Overline**: `POR QUE ISSO IMPORTA`

**H2**: "Reciclar dá certo quando é fácil saber onde — e quando a gente enxerga valor no que sobra."

**Corpo**:
"Aquilo que parece descarte pode ser matéria-prima, renda ou solução para outra pessoa. Nem sempre o resíduo vale dinheiro para quem separa — mas pode valer para quem coleta, compra, transforma ou precisa daquele material."

**Fecho**:
"A provocação é simples: separar, avisar e encontrar o destino certo já muda o caminho do resíduo."

## Beats de scroll / motion

A seção 2 deixa de ser apenas estática e vira uma transição animada para a seção 3.

| Beat | Título | Intenção |
|---|---|---|
| 01 | Isso é lixo? | Materiais aparecem caindo/espalhados, ainda sem contexto. |
| 02 | Ou recurso parado? | Os mesmos materiais ganham categoria: plástico, vidro, metal, orgânico, eletrônico etc. |
| 03 | Alguém pode precisar | Entram destinos possíveis: comprador, catador, ecoponto, coleta pública, empresa. |
| 04 | Separe e avise | A pessoa entende que não precisa resolver tudo sozinha — separar e avisar já gera valor. |
| 05 | A seção 3 mostra como | A narrativa puxa para o app: filtro, lista, mapa, denúncia e acompanhamento. |

## Direção visual

- Manter a base clara da landing (`#FAF9F4`) para leitura editorial.
- Visual de apoio: transformação de materiais soltos em categorias e destinos possíveis.
- Evitar estatísticas inventadas.
- Evitar parecer marketplace financeiro puro: o valor pode ser econômico, social, ambiental ou operacional.

## Intenção de implementação

- Scroll-driven/pinned section curta antes da seção 3.
- Materiais entram com queda leve/stagger.
- Categorias aparecem como etiquetas/chips.
- Destinos possíveis aparecem como cards ou pins.
- Fecho deve conduzir naturalmente para a demonstração do app na seção 3.

## Registro no Pencil

Protótipo atual em:

`/media/ccrs/development/oikos/web/pencil/web.pen`

Frame correspondente:

`02 Provocação / resíduo também é valor`

Sticky Note adicionada com a intenção de motion da seção.

## Pendências

- [ ] Validar copy final com o usuário.
- [ ] Decidir se os materiais serão vetores/SVG em camadas ou elementos gerados diretamente no React.
- [ ] Definir se os destinos incluem "catador" já nesta landing ou se fica genérico como comprador/coleta/ecoponto.
