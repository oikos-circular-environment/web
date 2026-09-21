# T03 Sessão, guard e login/logout

**Status:** [x] Concluído
**Depende de:** T02
**Módulos:** `src/proxy.ts`, `src/libs/session.ts`, `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/components/session-sync.tsx`, `src/stores/use-session-store.ts`, login, `nav-user.tsx`, `account-menu-button.tsx`
**Spec:** Tech Plan (decisões 4 e 5; Fluxo; Falhas)

## Escopo
- `proxy.ts` em `/dashboard/:path*`: valida com `get-session` na API, redireciona para `/login` se ausente, forjado ou expirado, repassa `Set-Cookie` de renovação. API fora do ar não pode gerar loop de redirect.
- Layouts usam `auth-server.getSession()` com `cache()`. `moderacao` exige `role === "moderator"`.
- Store: `SessionUser` sem `company_id`, com `role: "user" | "moderator"`. `SessionSync` hidrata do server; `useSession` mantém sync entre abas e refocus.
- Login e sign-out via `authClient` no client. Remover `session.ts` e o cookie `oikos_session_token`.

## Fora de escopo
Registro, verify-email, conta, moderação.

## Verificação
Login em `/login` leva a `/dashboard`; sem cookie, `/dashboard` redireciona; sign-out em uma aba desloga a outra; `tsc`, biome e build verdes.
