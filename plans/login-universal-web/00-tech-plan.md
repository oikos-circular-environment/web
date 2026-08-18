# Login universal + área logada (agentes, SDK, auth, sidebar)

Trilha B do plano cross-repo aprovado em
`/home/ccrs/.claude/plans/aproveitando-que-estamos-mexendo-quiet-octopus.md`. A Trilha A (api,
branch `christiancesar/8-adicionar-better-auth-na-api`) já entregou o pré-requisito: o plugin
`organization` do Better Auth ligado, papel de plataforma `moderator`, e `/v2/auth/sign-in` +
`/v2/auth/session` retornando `organizations` (`id`, `company_id`, `name`, `role`). Este plano
assume esse contrato de sessão como dado.

Branch atual: `christiancesar/48-criar-tela-confirmacao-email` (worktree Orca
`48-criar-tela-confirmacao-email`) — já tem a tela de confirmação de e-mail em progresso (com
diff local não commitado em `verify-email/page.tsx` e `e2e/verify-email.spec.ts`, não mexer).
Next.js já foi atualizado pra `16.3.0` (era `16.2.10`) como pré-requisito, separado deste plano.

## Decisões

- **Agentes funcionais persistidos.** `.claude/agents/*.md` neste repo (não existiam antes em
  nenhum dos dois repos): `frontend-architect`, `better-auth-web`, `api-sdk-client`,
  `mvvm-zustand`, `tailwind-shadcn-ui`. Espelha o papel dos agentes especializados já usados no
  repo `api`.
- **Convenções técnicas viram regra no `AGENTS.md`**, não ticket isolado — SSR-first, MVVM
  (View/ViewModel/Model), Zustand com stores curtas, Skeleton pra conteúdo carregando e Spinner
  nativo pra botão/input/select pendente. Ficam documentadas uma vez, valem pra todo o resto do
  plano sem repetir em cada ticket.
- **SDK gerado via hey-api, replicando `mobile/openapi-ts.config.ts` quase 1:1** — mesmo plugin
  set (`@hey-api/client-axios`, `@hey-api/schemas`, `@hey-api/transformers` com `dates: true`,
  `@hey-api/typescript`, `@hey-api/sdk` com `transformer: true`), mesmo padrão de output isolado
  (`src/libs/oikos-sdk/`, nunca editado à mão). O input aponta pro `/docs/openapi.json` da api —
  **essa rota já existe e já está atrás de HTTP Basic Auth** (`ADMIN_USERNAME`/`ADMIN_PASSWORD`,
  `src/app.ts` do repo api, mesmo mecanismo que o mobile já usa) — reaproveitar exatamente esse
  padrão de credenciais, não inventar um novo.
- **`axios` já é dependência do web** (`^1.18.1`, já instalado — checado em `package.json`, a
  pesquisa anterior não tinha visto isso). Não precisa adicionar, só passar a usar de fato: um
  wrapper único (`src/libs/api/oikos-api.ts`) por trás do SDK gerado, substituindo o `fetch`
  nativo de `src/lib/api.ts` (`apiFetch`, usado hoje por `verify-email`/`suporte`).
- **Centralizar a URL da API num único módulo.** Hoje só existe `API_INTERNAL_URL` (server-only).
  Login/organizações no client precisam de uma URL alcançável pelo browser — como as duas vão
  guardar o mesmo valor na prática, criar `src/lib/env.ts` como fonte única (lida de
  `NEXT_PUBLIC_API_URL`, o único nome que funciona tanto no server quanto no client no Next),
  usado por `oikos-api.ts` e por `auth-client.ts`. Remove `API_INTERNAL_URL` do `.env.example`.
- **Sessão passa pelo SDK gerado como tudo mais — sem cliente nativo do Better Auth.**
  Descoberto durante a T04: a api não monta o handler nativo do Better Auth em rota nenhuma (só o
  wrapper `/v2/auth/*`), então `createAuthClient` de `better-auth/react` nunca funcionaria
  (chamaria rotas inexistentes). `src/lib/session.ts` (server-only) chama
  `postV2AuthSignIn`/`getV2AuthSession`/`postV2AuthSignOut` do SDK via `apiClient`, guarda o
  token bearer num cookie httpOnly próprio (`oikos_session_token`) — não usa `better-auth`
  (client) como dependência. Ver a nota de correção no ticket T04 pro detalhe completo.
- **Zustand entra como dependência nova** (pedido explícito do usuário; hoje o web só tem
  TanStack Query) — só pra sessão/organização ativa, síncrono pro header/sidebar decidir o que
  renderizar sem esperar fetch. Uma store por conceito estreito (regra em AGENTS.md).
- **Sidebar em cima dos blocos oficiais do shadcn** (`sidebar` primitivo já vendorizado +
  `team-switcher` + `nav-user`, buscados via `shadcn` CLI — já é devDependency), restilizados com
  os tokens do `DESIGN.md` pro visual dark/ícone-first da Cloudflare.
- **`market`, não "coleta"/"collection-points"** — nome consistente com o mobile
  (`mobile/src/app/(tabs)/market/`).
- **Playwright só pro crítico**: login/registro (sucesso e erro de credencial), header
  Entrar/Registrar vs. Dashboard+Avatar conforme sessão, sidebar escondendo moderação pra quem
  não é `moderator`. Loading states, variações de organizações no switcher e CRUD de
  profile/market ficam fora do e2e por padrão.

## Fora de escopo

- Convites de membros admin/user numa organização (não existe endpoint pra isso na api ainda).
- Módulo de suporte separado de moderação de suporte (mencionado pelo usuário, mas fica pra
  decisão própria — ver nota equivalente no plano da Trilha A).
- Dashboard/funcionalidades avançadas do módulo pago em si — só a fundação de acesso.

## Tickets

Ver `tickets/`. Ordem sugerida (T01-T04 são fundação, sem eles nada do resto funciona):

1. **T01** — Agentes funcionais + skills.
2. **T02** — Convenções técnicas em `AGENTS.md`.
3. **T03** — SDK gerado (hey-api) + `env.ts` centralizado + wrapper axios, substituindo `apiFetch`.
4. **T04** — Cliente Better Auth (`auth-client.ts` + `organizationClient`) + store Zustand de sessão.
5. **T05** — Páginas `/login` e `/registro`.
6. **T06** — Botão de conta no header (Entrar/Registrar vs. Dashboard+Avatar).
7. **T07** — App shell privado + sidebar (org switcher + nav-user), condicionada a papel.
8. **T08** — Profile (exemplo de feature).
9. **T09** — Market (exemplo de feature, listagem paginada).
10. **T10** — Moderação de usuários (exemplo de feature, só `moderator`).
11. **T11** — Testes Playwright críticos.
12. **T12** — Drawer de detalhes do usuário (moderação). Bloqueado por mudança na api (ver ticket).

T05 depende de T04; T06/T07 dependem de T04 (precisam saber se há sessão); T08/T09/T10 dependem
de T03 e T07 (SDK + shell). T09 e T10 podem rodar em paralelo entre si.

## Verificação (roda no fim de cada ticket)

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npx playwright test` (a partir de T11; antes disso, só os testes já existentes não podem
  quebrar)
