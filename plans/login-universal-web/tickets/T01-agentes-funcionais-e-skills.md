# T01 — Agentes funcionais (`.claude/agents/*.md`) + skills

**Status:** [x] Concluído
**Depende de:** nada
**Módulos:** `.claude/agents/`, `.claude/skills/`

## Contexto

Nem este repo nem o `api` têm hoje `.claude/agents/*.md` (confirmado por busca). O usuário pediu
subagentes especializados no web, no mesmo espírito dos usados no `api`. Cada um é um arquivo
`.claude/agents/<nome>.md` com frontmatter (`name`, `description`, `tools`, opcionalmente
`model`) seguido do system prompt do agente.

## Passo 1 — criar os 5 agentes

- **`frontend-architect.md`** — decisões de estrutura de pastas, roteamento App Router,
  composição server/client component, fronteira SSR/client (ver regra em `AGENTS.md`, T02).
  Tools: leitura/escrita de código, sem acesso a infra externa.
- **`better-auth-web.md`** — cliente Better Auth, sessão, hooks, sign-in/sign-up/sign-out,
  proteção de rota. Prompt deve citar explicitamente que este é o único ponto que não passa pelo
  SDK gerado (`src/lib/auth-client.ts`).
- **`api-sdk-client.md`** — geração/manutenção do SDK via hey-api, wrapper axios, integração
  TanStack Query. Prompt deve referenciar `mobile/src/libs/oikos-sdk` e
  `mobile/src/libs/api/oikos-api.ts` como padrão a espelhar.
- **`mvvm-zustand.md`** — hooks de feature (viewmodels) e stores Zustand curtas. Prompt cita a
  definição de MVVM e a regra de tamanho de store do `AGENTS.md` (T02).
- **`tailwind-shadcn-ui.md`** — componentes visuais, tokens do `DESIGN.md`, blocos shadcn
  (sidebar, team-switcher, nav-user, skeleton, spinner, forms).

## Passo 2 — instalar skills relevantes

Via marketplace/plugin do Claude Code (só fonte já confiável, a mesma usada no `api`), instalar
neste repo o que fizer sentido pro escopo deste plano: `better-auth-best-practices`,
`organization-best-practices`, `create-auth`, `email-and-password-best-practices`. Confirmar no
momento da execução quais estão de fato disponíveis — não assumir.

## Fora de escopo

- Qualquer agente pra features fora deste plano (ex: complaints, survey) — só o necessário pro
  login universal e área logada.

## Verificação

- Cada `.claude/agents/*.md` carrega sem erro de frontmatter (testar invocando cada um uma vez
  com uma tarefa trivial).
- Skills listadas aparecem disponíveis via `/help` ou listagem de skills da sessão.
