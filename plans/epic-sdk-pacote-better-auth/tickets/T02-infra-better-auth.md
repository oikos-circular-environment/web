# T02 Infra Better Auth

**Status:** [x] Concluído
**Depende de:** T01
**Módulos:** `package.json`, `src/libs/auth-client.ts`, `src/libs/auth-server.ts`, `src/app/api/auth/[...path]/route.ts`, `src/libs/env.ts`, `.env.example`
**Spec:** Tech Plan (decisões 2 e 3; Componentes novos)

## Escopo
- Adicionar `better-auth` (versão da API, 1.7.3) com `adminClient` e `organizationClient`.
- `auth-client.ts` (client): `baseURL: "/api/auth"`.
- `auth-server.ts` (server-only): `getSession()` e `getOrganizations()` com `headers()` encaminhados e `X-Client-Key`, direto em `${NEXT_PUBLIC_API_URL}/auth`.
- Route handler: só GET e POST, allowlist `/auth/*` em host fixo, injeta `X-Client-Key` (`CLIENT_API_KEY`), repassa `Origin`, `cookie` e todos os `Set-Cookie` (`getSetCookie()`).
- Remover `NEXT_PUBLIC_CLIENT_API_KEY` de `env.ts` e `.env.example` se nenhum uso restar.

## Fora de escopo
Telas, guard, `proxy.ts`.

## Verificação
`tsc`, biome e build verdes. `curl` no `/api/auth/get-session` do web contra a API local responde igual ao `/auth/get-session` da API (depende de `BETTER_AUTH_TRUSTED_ORIGINS` para POST).
