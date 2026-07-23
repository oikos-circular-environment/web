# T2 — `web`: Autenticação do admin

**Repositório**: `oikos-circular-environment/web`

## Escopo

Better Auth completo pro admin único: schema gerado pelo CLI deles, instância server-side, client helper, middleware de proteção otimista, checagem autoritativa no layout do painel, telas de login e (uma vez logado) troca de senha. O seed em si (criar a conta a partir do env) é T10 — aqui só entra a infraestrutura de auth que o seed vai usar.

## Fora de escopo

Seed do admin via pipeline de deploy (T10). Recuperação de senha (fora de escopo do épico inteiro, ver `00-epic-brief.md`). Qualquer conteúdo real de `/painel/**` além da própria proteção (T3 em diante).

## Referências de spec

- `01-core-flows.md` Fluxo 1 — Login do administrador
- `02-tech-plan.md` §Abordagem Arquitetural — Autenticação (Better Auth + Prisma adapter, e-mail/senha, conta única)

## Dependências

Nenhuma (roda em paralelo com T1 — schema do Better Auth é gerado pelo CLI deles, independente do schema de domínio).

## Checklist

- [ ] `npx auth@latest generate` — gera/mescla o schema de auth em `prisma/schema.prisma` (convenção do projeto: inglês, snake_case, `@@map` plural — confirmar que o CLI respeita ou ajustar manualmente)
- [ ] `src/lib/auth.ts` — instância Better Auth, Prisma adapter, provider e-mail/senha (sem social login, sem magic link)
- [ ] `src/lib/auth-client.ts` — `createAuthClient`, hook de sessão pro client
- [ ] `src/app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)`
- [ ] `src/app/entrar/page.tsx` — tela de login (e-mail + senha), erro genérico em credenciais inválidas
- [ ] `middleware.ts` — checagem otimista via `getSessionCookie`, redireciona `/painel/**` sem cookie pra `/entrar`
- [ ] Layout de `/painel` — checagem autoritativa via `auth.api.getSession()`, redireciona se sessão inválida
- [ ] `site-header.tsx` — botão condicionado ao estado de sessão (Entrar / ir ao Painel + Sair)
- [ ] Tela de troca de senha (dentro do painel, autenticado) usando a API de credenciais do Better Auth
- [ ] Cypress: fluxo de login válido, login inválido (mensagem genérica), acesso a `/painel` sem sessão redireciona pra `/entrar`

## Definição de Pronto

Login funciona ponta a ponta contra uma conta criada manualmente (via script/Prisma Studio, já que o seed automático é T10); `/painel/**` é inacessível sem sessão válida tanto no middleware quanto na checagem autoritativa; troca de senha funciona e passa a valer no próximo login.
