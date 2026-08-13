# T05 — Páginas `/login` e `/registro`

**Status:** [x] Concluído
**Depende de:** T04
**Módulos:** `src/app/login/`, `src/app/registro/`

## Contexto

`verify-email/page.tsx:53` já linka pra `/login`, que não existe hoje. Nenhuma página de
registro existe. Reaproveitar o padrão já estabelecido em `verify-email` (Server Component casca
+ `actions.ts` com Server Action + `Empty*` do shadcn onde fizer sentido pro estado vazio/erro).

**Não existe `authClient`** (removido na correção da T04 — a api não expõe handler nativo do
Better Auth). Login/registro chamam Server Actions que usam `src/lib/session.ts`
(`signInWithPassword`, que já seta o cookie httpOnly) e o SDK gerado direto (`postV2AuthSignUp`,
que não seta cookie nenhum — sign-up não retorna sessão, só cria a conta).

## Passo 1 — `/login`

`src/app/login/page.tsx` (Server Component, casca/SEO) + `src/app/login/actions.ts`
(`"use server"`, chama `signInWithPassword` de `@/lib/session`, `redirect("/dashboard")` em
sucesso) + `src/app/login/_components/login-form.tsx` (Client Component): campos email/senha,
`react-hook-form` + `zod`, `action` do form chama a Server Action. Erro de credencial mostra
mensagem inline (não toast — evita depender de foco de acessibilidade em toast pra erro de
formulário). Botão de submit usa `Spinner` durante pending (regra do `AGENTS.md`, T02).

## Passo 2 — `/registro`

Mesma estrutura, campos nome/email/senha, `src/app/registro/actions.ts` chama `postV2AuthSignUp`
(de `@/libs/oikos-sdk/sdk.gen`, via `apiClient` de `@/libs/api/oikos-api`) diretamente — não passa
por `session.ts` porque não há cookie pra setar (sign-up não retorna token). Sucesso mostra o
mesmo tipo de tela de confirmação usada em `verify-email` (mandar verificar o e-mail), não
redireciona direto pra área logada (a api exige e-mail verificado conforme
`REQUIRE_EMAIL_VERIFICATION`).

## Fora de escopo

- Login social (Google/etc.) — a api não tem provider social configurado ainda.
- Recuperação de senha — a api já tem os endpoints (`/v2/auth/forgot-password`,
  `/v2/auth/reset-password`), mas a tela fica pra outro ticket se o usuário pedir.

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- Manual: login com `christiancnp@gmail.com` (seed da Trilha A) funciona e redireciona; senha
  errada mostra erro inline sem reload de página.
