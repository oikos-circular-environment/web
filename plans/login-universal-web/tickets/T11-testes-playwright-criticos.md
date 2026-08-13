# T11 — Testes Playwright críticos

**Status:** [x] Concluído (com correção real do coordenador — ver nota abaixo)
**Depende de:** T05, T06, T07, T10
**Módulos:** `e2e/`, `e2e/fake-api-server.mjs`

## Correção pós-implementação (achado do coordenador, não do worker)

Ao validar manualmente contra a api local (não a fake), login parou de funcionar depois desta
ticket: `getSession()`/`signOut()` em `src/lib/session.ts` passaram a usar
`createServerApiClient(headers)` (repassa o header `cookie` bruto do browser) **sem** o header
`Authorization: Bearer <token>` explícito — mas a api real só autentica `/v2/auth/*` via Bearer,
nunca por cookie (`Company` × client-key à parte). O resultado: toda leitura de sessão pós-login
falhava silenciosamente (401 → `getSession()` retorna `null` → redirect pra `/login`).

**Por que os 87 testes passaram mesmo assim**: `e2e/fake-api-server.mjs` foi escrito checando o
header `cookie` (pra bater com o código quebrado), não `Authorization`, então o mock e o cliente
erravam da mesma forma e os testes davam falso-positivo contra a api real.

**Correção**: revertido `getSession`/`signOut` pra usar `apiClient` + `headers: { Authorization:
"Bearer ${token}" }` explícito (mesmo padrão de T04/T08/T09/T10, que sempre passaram o header
certo e por isso nunca quebraram). `fake-api-server.mjs` corrigido pra checar `Authorization`
também, refletindo o contrato real da api.

**Pegadinha de ambiente que atrasou o diagnóstico**: o processo do `fake-api-server.mjs` iniciado
pelo Playwright (`reuseExistingServer: true` fora de CI) ficou vivo entre execuções — é um
script Node puro, sem hot-reload, então continuou rodando a versão antiga mesmo depois do arquivo
corrigido em disco. Rodar `npx playwright test` sem matar esse processo primeiro reproduz o bug
antigo mesmo com o código já certo. Se isso acontecer de novo: `ss -ltnp | grep 3335` pra achar o
PID e matar antes de rodar os testes.

## Contexto

Só o crítico, não cobertura exaustiva (decisão registrada no `00-tech-plan.md`). Reaproveitar
`e2e/fake-api-server.mjs` (mock backend já usado por `suporte.spec.ts`/`verify-email.spec.ts`),
estendendo com as rotas de auth v2 e moderação necessárias pros três cenários abaixo.

## Passo 1 — estender `fake-api-server.mjs`

Adicionar handlers mockados: `POST /v2/auth/sign-in` (sucesso com usuário `role: "user"` sem
organização, e variante `role: "moderator"` com uma organização; e falha 401 com credencial
errada), `GET /v2/auth/session`, `GET /v2/moderation/users` (lista mínima).

## Passo 2 — `e2e/login.spec.ts`

- Login com sucesso redireciona pra `/dashboard`.
- Senha errada mostra erro inline, sem navegar.

## Passo 3 — `e2e/header-account-button.spec.ts`

- Deslogado: mostra Entrar/Registrar.
- Logado (mockando sessão): mostra o botão combinado Dashboard+Avatar.

## Passo 4 — `e2e/sidebar-moderation-visibility.spec.ts`

- Sessão `role: "user"`: item de menu "Moderação" não aparece, `/dashboard/moderacao` redireciona.
- Sessão `role: "moderator"`: item aparece, rota carrega a lista.

## Fora de escopo

- Testes de loading state, variações de organizações no switcher, CRUD completo de
  profile/market — decisão do `00-tech-plan.md`.

## Verificação

- `npx playwright test` verde localmente (`e2e/login.spec.ts`,
  `e2e/header-account-button.spec.ts`, `e2e/sidebar-moderation-visibility.spec.ts`, mais os specs
  já existentes continuam passando).
