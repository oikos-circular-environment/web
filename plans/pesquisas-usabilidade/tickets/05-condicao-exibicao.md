# T5 — `web`: Condição de exibição de seção

**Repositório**: `oikos-circular-environment/web`

## Escopo

A funcionalidade que motivou o desenho todo do wizard condicional: configurar, por seção (a partir da 2ª), uma condição opcional referenciando uma pergunta de escolha de uma seção anterior + o conjunto de alternativas que liberam a exibição. Inclui a integridade de dados: bloquear exclusão de pergunta/alternativa/seção referenciada por alguma condição.

## Fora de escopo

Avaliação da condição em si (isso é T8/T9, no lado do respondente — aqui só a configuração pelo admin). Remapeamento de condições ao duplicar (T6, mas usa o que for construído aqui).

## Referências de spec

- `01-core-flows.md` Fluxo 3 — bullet de condição de exibição
- `02-tech-plan.md` §Modelo de Dados — `SectionConditionOption`, `onDelete: Restrict`
- `02-tech-plan.md` §Modelo de Dados, Decisões-chave — captura da violação `P2003`/`23503`

## Dependências

T4 (construtor precisa existir pra condição ter onde viver).

## Checklist

- [ ] UI: configuração de condição por seção — seletor de pergunta (só perguntas de seções anteriores à atual), seletor de alternativas aceitas (múltipla escolha das options daquela pergunta)
- [ ] Server Action `setSectionCondition` / `clearSectionCondition` — valida que a pergunta escolhida pertence a uma seção anterior (nunca a mesma ou posterior)
- [ ] Server Actions de exclusão (pergunta, alternativa, seção — de T4) passam a capturar a violação de `Restrict` e traduzir pra mensagem amigável indicando quais seções dependem
- [ ] Indicador visual na seção mostrando que ela tem condição ativa (e qual)
- [ ] Cypress: configurar condição, tentar excluir a pergunta/alternativa referenciada (bloqueado com mensagem clara), remover a condição primeiro e então excluir com sucesso

## Definição de Pronto

Admin configura condição de exibição numa seção; tentar excluir a pergunta/alternativa/seção da qual ela depende é bloqueado com mensagem clara em vez de erro cru de banco; removendo a condição, a exclusão passa a funcionar.
