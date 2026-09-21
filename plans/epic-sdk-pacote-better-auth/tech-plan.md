# Tech Plan: SDK como pacote e Better Auth no web

## Abordagem Arquitetural

**Decisões**
1. **SDK do pacote** `@oikos-circular-environment/oikos-sdk@0.1.0-beta.16`, com caret na linha beta (igual ao mobile). Sem geração local. Cobre só `/v1`; não tem endpoint de auth.
2. **Auth pelo Better Auth nativo da API**, montado em `/auth/*`. O web usa só o `authClient` (`better-auth/react`), com `adminClient` e `organizationClient`. Não há instância `betterAuth` no Next.
3. **Cookie first-party via proxy.** Route handler `app/api/auth/[...path]/route.ts` repassa para `${API}/auth/*`. O `Set-Cookie` da API volta no domínio do web (httpOnly). O cookie `oikos_session_token` deixa de existir. O handler tem allowlist só de `/auth/*` (host fixo, sem SSRF), injeta `X-Client-Key` server-side e repassa `Origin`, `cookie` e `Set-Cookie`.
4. **Divisão híbrida.** Critério: o server decide e lê autoridade e dado; o client cuida de interação e reatividade; a API é a autoridade final.
   - **Server:** leitura de sessão (layouts, RSC, guards, `cache()` por request), checagem de papel, todas as chamadas `/v1` (Server Actions/RSC com `cookie` encaminhado), Turnstile de `/suporte`, conta (`getV1UsersMe`, `patchV1UsersMeChangePassword`, `deleteV1UsersMe`, `patchV1UsersMeCancelDeletion`, todos no SDK), segredos.
   - **Client via `/api/auth`:** sign-in, sign-up, sign-out, verify-email, `useSession` (sync entre abas e refocus), `organization.setActive`, ações `admin.*` da moderação com TanStack Query.
5. **Três camadas de proteção.**
   1. `proxy.ts` em `/dashboard/:path*`: chama `get-session` na API, redireciona para `/login` se cookie ausente, forjado ou expirado, e repassa o `Set-Cookie` de renovação de sessão ao browser.
   2. Layout/RSC: `getSession()` real, e `role === "moderator"` para `moderacao`.
   3. API: autoriza cada `/v1` e cada `/auth/admin/*` (role `moderator` no plugin `admin`).
6. **`/v1` do SDK** só roda no server: `createServerApiClient(headers)` encaminha `cookie`. O browser não chama `/v1`. O `Authorization` some.

**Trade-offs**
- Formulários de auth deixam de ser Server Actions puras (perdem progressive enhancement), em troca de cookie correto sem relay manual e sessão reativa no client.
- `proxy.ts` validando na API custa uma chamada por navegação em `/dashboard/*`; o layout repete a checagem. Mitigação: `cookieCache` do Better Auth na API e `cache()` no layout. Resolve o cookie que expira no prazo original mesmo com sessão ativa, que um RSC não consegue renovar.
- Admin no client expõe o caminho `/api/auth/admin/*` ao browser. Aceito porque a API valida o role em cada chamada.

**Restrições**
- API: `BETTER_AUTH_TRUSTED_ORIGINS` deve incluir a origem do web (dev e prod).
- Cookie `better-auth.session_token`, com prefixo `__Secure-` em HTTPS. O `proxy.ts` aceita os dois.
- A API só aceita GET e POST em `/auth/*`; o route handler repassa só esses métodos. Mutações com cookie passam pelo `originCheck` do Better Auth, que exige `Origin` do web em `trustedOrigins`.
- A API não configura `session` (padrão: 7 dias, renovação a cada 1 dia, sem `cookieCache`). Cada `get-session` consulta o banco. Ticket na API para habilitar `cookieCache` é recomendado, não bloqueante.
- `/v1` autentica por `getSession(headers)` da API, então o cookie encaminhado basta (sem Bearer).
- CI e Vercel precisam do secret `GH_TOKEN_PERSONAL_TOKEN`.
- Dependência nova: `better-auth` (versão da API, hoje 1.7.3).

## Modelo de Dados

Sem schema (o web não tem banco). Muda o formato da sessão no cliente.

```ts
type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  email_verified: boolean;
  image: string | null;
  role: "user" | "moderator";
};
type SessionOrganization = { id: string; name: string; role: string };
```
- `organizations` vem de `organization.list()` no server e hidrata a store junto com o usuário. `company_id` sai (nenhum consumidor no web).
- `activeOrganizationId` continua na store client (default: primeira organização). Sincronizar com `organization.setActive` na API é opcional e não bloqueia.
- `role` vem do plugin `admin`.
- Store zustand: hidratada pelo server (`SessionSync`) e mantida por `useSession` no client. Fonte de verdade em conflito: o server, a cada navegação.

**Ambiente**
- Remove `ADMIN_USERNAME`, `ADMIN_PASSWORD`. Adiciona `GH_TOKEN_PERSONAL_TOKEN`.
- Mantém `NEXT_PUBLIC_API_URL` e `CLIENT_API_KEY` (server-only). `NEXT_PUBLIC_CLIENT_API_KEY` sai, pois o browser não chama a API direto.

## Arquitetura de Componentes

**Novos**
- `src/libs/auth-client.ts` (client): `createAuthClient({ baseURL: "/api/auth", plugins: [adminClient(), organizationClient()] })`.
- `src/libs/auth-server.ts` (server-only): `getSession()` e `getOrganizations()` com `headers()` encaminhados e `X-Client-Key`, direto na API. Substitui `src/libs/session.ts`.
- `src/app/api/auth/[...path]/route.ts`: proxy de auth descrito acima.
- `src/proxy.ts`: guard e renovação de sessão.

**Alterados**
- `login`, `registro`, `verify-email`: formulários client chamam `authClient`. As `actions.ts` de auth somem.
- `account`: troca de senha, exclusão e cancelamento de exclusão pelos endpoints `/v1/users/me/*` do SDK, em Server Actions (não usam `authClient`).
- `moderacao`: `authClient.admin.*` em hooks client. Actions de moderação de suporte (`/v1`) permanecem no server.
- `profile`, `market`, `device-preview`, `suporte`: trocam imports para o pacote; `/v1` no server com cookie encaminhado.
- `app/layout.tsx`, `dashboard/layout.tsx`, `SessionSync`, `nav-user`, `team-switcher`: usam `auth-server.getSession` e a store.
- `oikos-api.ts`: só cliente server (sem `withCredentials` e sem `Authorization`).
- `e2e/fake-api-server.mjs`: simula `/auth/*` nativo em vez de `/v2/auth/*`.

**Fluxo (login)**
1. Browser: `authClient.signIn.email` → `POST /api/auth/sign-in/email`.
2. Route handler injeta `X-Client-Key` e repassa a `${API}/auth/sign-in/email`.
3. API responde com `Set-Cookie`; o browser recebe no domínio do web.
4. `router.push("/dashboard")` → `proxy.ts` valida na API → layout `getSession()` → renderiza e hidrata a store.

**Falhas**
- Cookie inválido ou expirado: `proxy.ts` redireciona para `/login`; o layout também.
- API fora do ar: páginas públicas degradam como "sem sessão"; `proxy.ts` em `/dashboard/*` mostra erro em vez de redirecionar em loop.
- Origem não confiável: a API recusa mutações (403).
- Sign-out em outra aba: `useSession` invalida a store e leva para `/login`.
