# T6 — `web`: Ciclo de vida do formulário

**Repositório**: `oikos-circular-environment/web`

## Escopo

Publicar, encerrar e duplicar. Transições de estado só pra frente (`DRAFT → PUBLISHED → CLOSED`, sem volta); duplicação copia seções/perguntas/alternativas e remapeia as condições de exibição pras cópias (não pros originais); toggle `allow_edit_after_responses` nas configurações do formulário.

## Fora de escopo

Convites (T7 — só ficam disponíveis depois que este ticket permite publicar).

## Referências de spec

- `01-core-flows.md` Fluxo 4 — Publicar e encerrar formulário
- `01-core-flows.md` Fluxo 5 — Duplicar formulário
- `02-tech-plan.md` §Modelo de Dados — `FormStatus`, `allow_edit_after_responses`

## Dependências

T4 (construtor), T5 (condição — necessária pro remapeamento na duplicação).

## Checklist

- [ ] Server Action `publishForm` — valida que há ao menos uma seção com uma pergunta antes de permitir; `DRAFT → PUBLISHED`
- [ ] Server Action `closeForm` — `PUBLISHED → CLOSED`, com confirmação na UI (ação irreversível)
- [ ] Server Action `duplicateForm` — clona `Section`/`Question`/`Option`/`SectionConditionOption` com IDs novos, remapeando `condition_question_id` e as linhas de `SectionConditionOption` pras entidades da cópia; título sugerido `"[Original] (cópia)"`; não copia `Invite`/`Response`
- [ ] Toggle `allow_edit_after_responses` na tela de configurações do formulário (default `false`)
- [ ] Construtor (T4) respeita a trava: estrutura só editável em rascunho, ou publicado com a flag ligada
- [ ] Botões de Publicar/Encerrar/Duplicar na listagem (T3) e/ou dentro do construtor
- [ ] Cypress: publicar valida seção+pergunta mínima, encerrar bloqueia novas respostas (validado de fato em T9, aqui só o estado), duplicar preserva a condição de exibição apontando pra pergunta certa na cópia

## Definição de Pronto

Um formulário percorre `DRAFT → PUBLISHED → CLOSED` sem caminho de volta; duplicar um formulário com condição de exibição configurada produz uma cópia funcional, com a condição intacta e reapontada pra si mesma.
