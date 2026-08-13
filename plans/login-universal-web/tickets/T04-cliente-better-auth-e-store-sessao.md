# T04 — Cliente Better Auth + store Zustand de sessão

**Status:** [x] Concluído (redesenhado — ver nota abaixo)

## Correção pós-implementação (achado do coordenador, não do worker)

A implementação original deste ticket usava `createAuthClient` de `better-auth/react` (cliente
nativo do Better Auth) apontando pra `NEXT_PUBLIC_API_URL`. **Isso nunca funcionaria de verdade**:
o repo `api` não monta o handler nativo do Better Auth em rota nenhuma (confirmado com
`curl -H "X-Client-Key: ..." http://localhost:3333/get-session` → 404) — a Trilha A só expõe o
wrapper customizado `/v2/auth/*`, com formas de resposta e regras próprias (client-key
obrigatória, `organizations` no payload, etc). `createAuthClient` chamaria rotas nativas
(`/get-session`, `/sign-in/email`, `/organization/list`...) que simplesmente não existem.

**Redesenho** (implementado pelo coordenador diretamente, não pelo executor):
- Sem `better-auth` (client) como dependência — removido.
- `src/lib/session.ts` (server-only, `import "server-only"`): `signInWithPassword`,
  `getSession`, `signOut`, todos chamando o SDK gerado (`postV2AuthSignIn`, `getV2AuthSession`,
  `postV2AuthSignOut` de T03) via `apiClient`. Sessão guardada como cookie httpOnly
  (`oikos_session_token`, o `token` bearer que `/v2/auth/sign-in` retorna no corpo) — não como
  cookie nativo do Better Auth.
- `src/app/layout.tsx` virou `async`, chama `getSession()` no server e passa o usuário resolvido
  como prop pro `SessionSync` (que só hidrata a store, não faz fetch nenhum client-side).
- "Organização ativa" não tem endpoint próprio na api (não foi criado na Trilha A) — fica
  inteiramente client-side na store (`activeOrganizationId`, default pra primeira organização,
  trocável via `setActiveOrganizationId` — quem usa isso é o org switcher, T07).
- Efeito colateral aceito: como o layout raiz agora lê cookies, toda página do site deixou de ser
  estática (`○`) e virou dinâmica (`ƒ`) no build — é o preço de todo request precisar saber se
  tem sessão (pro header). Sem PPR configurado; se performance de página pública virar problema,
  vale revisitar com Suspense/PPR num ticket futuro, não bloqueia este.
**Depende de:** T03 (usa `env.ts`)
**Módulos:** `src/lib/auth-client.ts`, `src/stores/`, `package.json`

## Contexto

Nenhum cliente Better Auth existe hoje no web (confirmado por busca — zero `authClient`,
`useSession`, `signIn`). A api já usa Better Auth com o plugin `organization` ligado (Trilha A) —
o client deste ticket precisa do plugin equivalente pra expor `useActiveOrganization`/
`useListOrganizations`.

## Passo 1 — dependência

Adicionar `better-auth` (client) ao `package.json`.

## Passo 2 — `src/lib/auth-client.ts`

```ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { getApiUrl } from "./env";

export const authClient = createAuthClient({
	baseURL: getApiUrl(),
	plugins: [organizationClient()],
});

export const { useSession, useActiveOrganization, useListOrganizations, signIn, signOut } =
	authClient;
```
Checar se a api espera `X-Client-Key` também nas chamadas do próprio Better Auth (client-side) —
se sim, configurar via `fetchOptions.headers` do `createAuthClient` (não só no wrapper axios do
SDK gerado, que é um cliente HTTP separado).

## Passo 3 — `src/stores/use-session-store.ts`

Store Zustand curta, síncrona, alimentada pelo resultado de `useSession()` (via um efeito/adapter
raso, não duplicando a fonte de verdade) — existe pra permitir que componentes fora da árvore de
`useSession` (ex: um Server Component não pode chamar hooks, mas o header/sidebar client-side
pode ler daqui sem esperar novo fetch em navegação). Guarda só o essencial: `user`, `role`,
`organizations`, `activeOrganizationId`.

## Fora de escopo

- Refresh-token/retry avançado — Better Auth já lida com isso via cookie/sessão nativa; não
  reimplementar o que o mobile faz manualmente (lá não tem Better Auth).

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- Teste manual: `authClient.signIn.email({ email, password })` contra a api local autentica com
  um dos usuários fixos do seed da Trilha A (`christiancnp@gmail.com` / `christian.cesar@oikos.company`).
