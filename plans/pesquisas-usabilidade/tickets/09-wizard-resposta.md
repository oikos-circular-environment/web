# T9 — `web`: Wizard de resposta + finalização

**Repositório**: `oikos-circular-environment/web`

## Escopo

O wizard em si: uma seção por vez, navegação instantânea via o avaliador de condição (T8) do lado client, validação de obrigatórias, salvamento de rascunho a cada avanço de seção, retomada por código em qualquer dispositivo, e a finalização atômica (consome o convite, marca a resposta como finalizada). Fecha o ciclo completo do respondente.

## Fora de escopo

Qualquer visualização/análise das respostas coletadas (fora de escopo do épico inteiro).

## Referências de spec

- `01-core-flows.md` Fluxo 8 — Responder formulário (uma seção por vez)
- `01-core-flows.md` Fluxo 9 — Confirmação de envio
- `02-tech-plan.md` §Abordagem Arquitetural — Progresso salvo como rascunho, transação de finalização
- `02-tech-plan.md` §Modelo de Dados — `Response`, `ResponseStatus`, `Answer`, `AnswerOption`

## Dependências

T8 (gate, cookie, avaliador de condição).

## Checklist

- [ ] Componente client do wizard: recebe a estrutura completa do formulário (seções/perguntas/alternativas) + rascunho existente (se houver) do Server Component pai
- [ ] Navegação por seção usa o avaliador de condição (T8) pra decidir a próxima seção aplicável, sem round-trip ao servidor
- [ ] Validação de perguntas obrigatórias sem resposta bloqueia o avanço, com aviso inline
- [ ] Barra de progresso reflete só as seções aplicáveis, recalculada conforme respostas
- [ ] Server Action `saveProgress` — chamada a cada "Próximo": upsert de `Answer`/`AnswerOption` da seção recém-completada; cria `Response` com `status: DRAFT` no primeiro avanço
- [ ] Botão "Voltar" preserva respostas já dadas; mudar resposta de uma pergunta-condição pode alterar quais seções seguintes aparecem
- [ ] Server Action `submitResponse` (última seção, botão vira "Finalizar", com confirmação) — transação atômica: `Invite.status = ACTIVE → USED` (condicional), checa `Form.status = PUBLISHED`, reavalia a lógica condicional contra o payload final (rejeita tudo se inconsistente), marca `Response.status = FINALIZED` + `submitted_at`
- [ ] Reentrar com código já finalizado/revogado/expirado → erro genérico, sem acesso ao rascunho antigo
- [ ] Tela de confirmação de envio pós-finalização
- [ ] Cypress: fluxo completo com lógica condicional (cenário do walkthrough do mestrado — pergunta Persona decidindo quais seções aparecem), fechar aba no meio e retomar pelo código, tentar finalizar duas sessões com o mesmo código (segunda recebe erro genérico), tentar finalizar um formulário que foi encerrado no meio do preenchimento

## Definição de Pronto

Um respondente completa o formulário do início ao fim com lógica condicional real, incluindo fechar e retomar de outro "dispositivo" (outra sessão de navegador); finalizar consome o convite; uma segunda tentativa de finalizar com o mesmo código falha corretamente. Suíte Cypress deste ticket cobre o cenário completo do walkthrough do mestrado, conforme o critério de sucesso do Epic Brief.
