# Epic Brief: SDK como pacote e migração de auth para Better Auth

## Resumo

O web gera o SDK da API localmente (`src/libs/oikos-sdk`, via `@hey-api/openapi-ts`), enquanto o mobile já consome o pacote publicado `@oikos-circular-environment/oikos-sdk` (GitHub Packages). A API migrou a autenticação para Better Auth (plugins `admin`, `bearer`, `organization` etc.) e removeu os endpoints `/v2` de auth, conta e moderação de usuários. O SDK local do web ficou defasado e é a única razão de o web ainda compilar com esses endpoints. Este epic troca o SDK local pelo pacote (fixado em `0.1.0-beta.16`, mesma linha do mobile) e migra auth, conta e moderação de usuários para o `authClient` do Better Auth, com sessão em cookie first-party servido por proxy `/api/auth/*` no Next. Tudo na branch `72-migrar-sdk-para-pacote-oikos-sdk` (issue #72), quebrado em tickets pequenos e executado por agentes do opencode sob orquestração.

## Contexto & Problema

**Quem é afetado:** time de desenvolvimento (drift entre web, mobile e API; geração local exige credenciais admin da API) e usuários finais do web (login, cadastro, verificação de e-mail, conta) e moderadores (gestão de usuários).

**Dor atual**
- Duas fontes de SDK: o web gera a sua a partir de uma API local, o mobile usa o pacote. Versões divergem sem aviso.
- `npm run generate:sdk` depende de `ADMIN_USERNAME`/`ADMIN_PASSWORD` e de uma API rodando.
- O pacote publicado (beta.16 e 0.1.17) não tem nenhum símbolo `/v2`. Ao trocar os imports, o `tsc` quebra em 25 símbolos: `postV2Auth*`, `getV2AuthSession`, `deleteV2AccountsMe`, `patchV2AccountsMeCancelDeletion` e `*V2ModerationUsers*`.
- O web não tem Better Auth instalado. A sessão é um cookie próprio (`oikos_session_token`) montado em `src/libs/session.ts` a partir do token devolvido por `/v2/auth/sign-in`.

**Decisões já alinhadas**
- Sessão: cookie do Better Auth, first-party no web via proxy `/api/auth/*` no Next. Server Components e actions usam `authClient` com headers encaminhados. `X-Client-Key` é injetado no proxy.
- Moderação de usuários: plugin `admin` (`authClient.admin.*`).
- Endpoints `/v1` seguem via SDK do pacote, com o client axios atual.
- Orquestração: primeiro ticket traz `.opencode/prompt` e agentes (executor, code-review, qa-runner) do mobile, adaptados a Next.js, biome e playwright.

**Fora do escopo:** redesign de telas, mudanças na API, novos fluxos de produto.

**Riscos e pendências**
- Secret `GH_TOKEN_PERSONAL_TOKEN` ainda não existe no repo `web` nem na Vercel; sem ele CI e deploy não instalam o pacote.
- Dev local: proxy precisa apontar para a API local e as origens confiáveis da API (`trustedOrigins`) precisam aceitar o web.
- Cobertura e2e (Playwright) de login, cadastro e conta precisa continuar verde ao fim.
