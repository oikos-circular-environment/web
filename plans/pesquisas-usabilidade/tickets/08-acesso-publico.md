# T8 — `web`: Acesso público + sessão do respondente

**Repositório**: `oikos-circular-environment/web`

## Escopo

O lado público começa aqui: rota `/responder/[formId]`, tela de gate pedindo o código de 6 dígitos, validação (sem revelar motivo específico de erro), criação do cookie de sessão (`iron-session`) vinculado ao `invite_id`, e o avaliador de condição de seção como função pura compartilhável — mas ainda sem o wizard em si (T9).

## Fora de escopo

Wizard de perguntas, salvamento de rascunho, finalização (tudo T9).

## Referências de spec

- `01-core-flows.md` Fluxo 7 — Acessar formulário via código
- `02-tech-plan.md` §Abordagem Arquitetural — Sessão do respondente, Lógica condicional
- `02-tech-plan.md` §Arquitetura de Componentes — Avaliador de condição de seção, Sessão do respondente

## Dependências

T7 (precisa de convites reais gerados pra testar o gate).

## Checklist

- [ ] `npm install iron-session` — novo env var `SESSION_SECRET` (min. 32 chars), documentado em `.env.example`
- [ ] `src/app/responder/[formId]/page.tsx` — Server Component: se `Form.status !== PUBLISHED`, mostra indisponibilidade; senão renderiza o gate
- [ ] Server Action `validateInviteCode` — checa `Invite.code` + `status = ACTIVE` + não expirado; erro sempre genérico ("Código inválido ou expirado"), sem distinguir motivo
- [ ] Ao validar com sucesso: cria cookie `iron-session` guardando `invite_id`; busca `Response` existente pelo `invite_id` (se houver, é retomada — consumida por T9) ou nenhuma ainda (começa do zero)
- [ ] Módulo isolado do avaliador de condição — função pura `(conditionQuestionId, acceptedOptionIds[], givenAnswers) => boolean`, sem I/O, testável isoladamente
- [ ] Testes unitários do avaliador de condição: sem condição (sempre true), condição batendo, condição não batendo, pergunta de condição sem resposta (false)
- [ ] Cypress: código válido abre a sessão, código inválido/usado/revogado/expirado mostra erro genérico, formulário não publicado nem chega a mostrar o gate

## Definição de Pronto

Gate de código funciona ponta a ponta contra convites reais; avaliador de condição tem testes unitários cobrindo os casos do Fluxo 3; cookie de sessão é criado corretamente e é a única coisa que distingue "sessão validada" de "não validada" nessa rota pública.
