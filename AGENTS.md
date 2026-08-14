<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Code comments & design decisions

- Zero explanatory comments in code by default. Add JSDoc only when needed to explain a non-obvious helper/utility function — not elsewhere.
- Design/architecture decisions belong in the plan/ticket (`plans/.../tickets/`), never as a code comment.
- When a design/architecture question comes up mid-task, research it and explain it at that point. Once it's settled and recorded in the ticket, don't re-explain or re-narrate it — that's wasted tokens.

# Response style (token economy)

- No step narration: skip "now I'll do X" before each tool call; keep end-of-turn summaries to 1-2 lines, don't restate the diff in prose.
- Prefer pointers over pasting code: reference existing code by `file:line`, don't paste the block back into the response.
- Explain only when asked: report what changed; only justify the "why" if the user asks or it's a genuine design question (see rule above).
- No inline TODO/FIXME: pending work becomes a ticket in the plan, never a loose marker in code.

# Pull requests

- Never include a "Test plan" section or an open checklist of pending tests in the PR description. A PR communicates what was already resolved — it does not leave verification tasks open for the reviewer.
- Structure the description as: first the context/problem being addressed, then what was done to solve it.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Login universal e área logada

- **SSR sempre.** Página nova é Server Component por padrão; só vira Client Component a parte
  que precisa de interatividade (formulário, dropdown, toggle de sidebar). Busca inicial de dado
  acontece no server (Server Component/Server Action), nunca num `useEffect` client-side.
- **MVVM**: View = componente React, só apresentação. ViewModel = hook por feature
  (`use-<feature>.ts`, em `src/components/<feature>/hooks/` ou `src/app/<rota>/_hooks/`) — chama
  o SDK gerado/TanStack Query, lê/escreve Zustand, devolve dado e handlers prontos pra View.
  Model = tipos gerados pelo SDK (hey-api) + entidades de domínio.
- **Zustand**: uma store por conceito estreito (`use-session-store.ts`,
  `use-active-organization-store.ts`). Se passar de ~80-100 linhas ou acumular ações de mais de
  um domínio, quebrar em duas.
- **Loading state**: conteúdo carregando usa `Skeleton` do shadcn; botão/input/select pendente
  usa `Spinner` nativo do shadcn (já existe, usado em `verify-email/loading.tsx`). Nunca spinner
  customizado ou texto "Carregando...".
- **SDK gerado (`src/libs/oikos-sdk/`) nunca é editado à mão.** Toda chamada à API passa por ele
  + o wrapper axios (`src/libs/api/oikos-api.ts`), exceto autenticação (Better Auth tem cliente
  próprio, ver `src/libs/auth-client.ts`).
