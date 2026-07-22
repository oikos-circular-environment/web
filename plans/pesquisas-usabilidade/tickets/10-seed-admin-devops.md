# T10 — `devops` (cross-repo): Seed do admin no pipeline de deploy

**Repositório**: script vive em `oikos-circular-environment/web`; a invocação (step de pipeline) é uma mudança em `oikos-circular-environment/devops`. Ticket documentado aqui porque nasce deste épico, mas precisa de coordenação/acesso ao outro repo — **não fica implícito em nenhum outro ticket, rastrear explicitamente**.

## Escopo

Script idempotente que garante a existência da conta única de admin (a partir de `ADMIN_EMAIL`/`ADMIN_PASSWORD` do env, senha hasheada pelo Better Auth antes de gravar) e um step no CI/CD do `devops` que roda `prisma migrate deploy` + esse script antes de trocar o container em produção — necessário porque a imagem Docker final (`output: standalone`) não tem CLI/`node_modules` completo em runtime.

## Fora de escopo

Recuperação de senha (fora de escopo do épico). Troca de senha pela UI (isso é T2 — aqui só a criação inicial).

## Referências de spec

- `02-tech-plan.md` §Abordagem Arquitetural — Seed do admin único, Restrições (build standalone)
- `01-core-flows.md` — assunção "sem mecanismo de recuperação de senha"

## Dependências

T1 (schema precisa existir), T2 (API do Better Auth precisa estar configurada).

## Checklist

- [ ] Script (`prisma/seed.ts` ou equivalente, no repo `web`) — idempotente: verifica se `ADMIN_EMAIL` já existe como conta; se não, cria via API server-side do Better Auth com a senha de `ADMIN_PASSWORD`
- [ ] Script não roda nada se as env vars não estiverem presentes (evita quebrar ambientes sem essas variáveis configuradas, ex: preview)
- [ ] Novo step no pipeline do `devops` (fora do container standalone, ambiente Node completo): roda `prisma migrate deploy` seguido do script de seed, contra a `DATABASE_URL` de produção
- [ ] Deploy aborta (não troca o container) se o step de migration/seed falhar
- [ ] `ADMIN_EMAIL`/`ADMIN_PASSWORD` cadastrados como secrets no pipeline do `devops`
- [ ] Validado manualmente em produção: primeira execução cria o admin, execuções seguintes são no-op (idempotência confirmada)

## Definição de Pronto

Um deploy do zero (banco vazio) sobe com o admin já criado e logável, sem intervenção manual; um segundo deploy não duplica nem falha por já existir. Coordenado e implementado no repo `devops` — este ticket só fecha quando o outro lado também estiver feito.
