# T4 — `web`: Construtor: seções/perguntas/alternativas

**Repositório**: `oikos-circular-environment/web`

## Escopo

O maior pedaço do épico: a tela de construção do formulário. CRUD completo de seção, pergunta (com os 3 tipos e suas regras — texto com limite de caracteres opcional, escolha única, múltipla escolha) e alternativa; reordenação por arrastar-e-soltar (`@dnd-kit`) dentro de cada lista; salvamento explícito (sem autosave).

## Fora de escopo

Condição de exibição de seção (T5 — a UI de condição entra na mesma tela, mas é ticket separado por ter integridade de dados própria). Publicar/encerrar/duplicar (T6).

## Referências de spec

- `01-core-flows.md` Fluxo 3 — Criar e montar formulário (construtor)
- `02-tech-plan.md` §Abordagem Arquitetural — Reordenação (`@dnd-kit`)
- `02-tech-plan.md` §Modelo de Dados — `Section`, `Question`, `Option`

## Dependências

T3 (formulário precisa existir e ser navegável a partir da listagem).

## Checklist

- [ ] `src/app/painel/pesquisas/[formId]/page.tsx` (ou layout com abas — Construtor/Convidados/Configurações, convidados e configurações ficam vazios/stub até T5-T7)
- [ ] UI do construtor: lista de seções, cada uma com suas perguntas empilhadas
- [ ] Server Actions: criar/renomear/excluir seção; criar/editar/excluir pergunta (título, descrição, tipo, obrigatória, limite de caracteres); criar/editar/excluir alternativa
- [ ] Reordenação via `@dnd-kit/core` + `@dnd-kit/sortable`: seções entre si, perguntas dentro da própria seção — persiste via Server Action em `onDragEnd`
- [ ] Botão "Salvar" explícito — mudanças pendentes só persistem ao clicar (sem autosave)
- [ ] Bloqueio de edição estrutural fora de rascunho, exceto se `allow_edit_after_responses = true` (toggle ainda não exposto — ver T6, aqui só a regra de bloqueio já vale pro caso simples de "publicado sem a flag")
- [ ] Cypress: montar um formulário completo (2+ seções, os 3 tipos de pergunta, alternativas), reordenar por drag-and-drop, salvar e recarregar confirmando persistência

## Definição de Pronto

Um formulário com múltiplas seções, perguntas dos 3 tipos e alternativas pode ser montado, reordenado e salvo pela UI; reabrir a tela reflete exatamente o que foi salvo.
