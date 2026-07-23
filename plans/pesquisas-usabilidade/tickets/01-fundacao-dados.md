# T1 — `web`: Fundação de dados

**Repositório**: `oikos-circular-environment/web`

## Escopo

Base de dados de todo o épico: schema Prisma do módulo de pesquisas, Postgres local via Docker Compose (dev + Cypress), Prisma Client singleton, e `zod` como dependência nova. Nenhuma feature de produto ainda — só a fundação que T3 em diante consome.

## Fora de escopo

Schema do Better Auth (T2, CLI deles gera à parte). Qualquer Server Action de negócio. Hospedagem de produção do banco (decisão adiada, fora desta entrega).

## Referências de spec

- `02-tech-plan.md` §Modelo de Dados (schema Prisma completo: `Form`, `Section`, `Question`, `Option`, `SectionConditionOption`, `Invite`, `Response`, `Answer`, `AnswerOption`)
- `02-tech-plan.md` §Abordagem Arquitetural — banco local, Prisma Client singleton, `zod`

## Dependências

Nenhuma.

## Checklist

- [ ] `prisma/schema.prisma` — todos os models do tech plan, nomes em inglês, campos em snake_case, `@@map` no plural
- [ ] `docker-compose.yml` (raiz do `web`, dev-only) — serviço `postgres` padrão pra desenvolvimento local
- [ ] `.env.example` atualizado com `DATABASE_URL` local
- [ ] `npm install prisma @prisma/client zod` (prisma como devDependency)
- [ ] `npx prisma migrate dev --name init` rodado contra o Postgres local, migration inicial versionada
- [ ] `src/lib/prisma.ts` — singleton do Prisma Client (guarda contra múltiplas instâncias no hot-reload do Next dev)
- [ ] Confirmar manualmente: `onDelete: Restrict` em `SectionConditionOption.option` e `Section.condition_question` realmente bloqueia o delete no Postgres (teste rápido via Prisma Studio ou script ad-hoc)
- [ ] `docker-compose.yml` de teste (ou serviço separado) documentado para os testes Cypress de T9 usarem — banco isolado, resetável entre execuções

## Definição de Pronto

`npx prisma migrate dev` roda limpo do zero contra o Postgres local, `@prisma/client` gerado e importável via `src/lib/prisma.ts`, e a constraint de `Restrict` foi confirmada manualmente impedindo a exclusão indevida.
