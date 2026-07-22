# T7 — `web`: Convites

**Repositório**: `oikos-circular-environment/web`

## Escopo

Painel de convidados dentro da página do formulário: gerar convite (nome/apelido + validade opcional em dias), listar com status (derivado: `ACTIVE`/`USED`/`REVOKED`/"expirado" calculado na leitura), revogar. Geração de código de 6 caracteres alfanuméricos sem ambiguidade visual.

## Fora de escopo

Consumo do código pelo respondente (T8/T9 — aqui só a geração/gestão pelo admin).

## Referências de spec

- `01-core-flows.md` Fluxo 6 — Gerar e gerenciar convites
- `02-tech-plan.md` §Abordagem Arquitetural — Convites (geração de código, status derivado)
- `02-tech-plan.md` §Modelo de Dados — `Invite`, `InviteStatus`

## Dependências

T6 (convite só pode ser gerado com o formulário `PUBLISHED`).

## Checklist

- [ ] Aba "Convidados" na página do formulário — habilitada só quando `status = PUBLISHED`
- [ ] Server Action `createInvite` — nome/apelido obrigatório, validade em dias opcional; gera código com `crypto.randomInt` sobre alfabeto sem `0/O/1/I/L`; retry em colisão de unicidade
- [ ] Server Action `revokeInvite` — `ACTIVE → REVOKED`, efeito imediato
- [ ] Listagem de convites: nome, código, status (calculando "expirado" comparando `expires_at` com `now()` no momento da leitura, sem persistir esse status), data de criação
- [ ] UI de geração mostra código + URL pública lado a lado, com botão de copiar cada um
- [ ] Cypress: gerar convite, ver código de 6 caracteres sem caracteres ambíguos, revogar torna inválido, convite com validade vencida aparece como expirado sem precisar de job/cron

## Definição de Pronto

Admin gera convites pra um formulário publicado, cada um com código único de 6 caracteres, e consegue revogar; a listagem reflete corretamente ativo/usado/revogado/expirado sem depender de nenhum processo em background.
