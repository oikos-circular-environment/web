# T02 — Convenções técnicas transversais em `AGENTS.md`

**Status:** [x] Concluído
**Depende de:** nada
**Módulos:** `AGENTS.md`

## Contexto

Regras que valem pro plano inteiro (login universal + área logada), não só pra uma feature —
documentadas uma vez em `AGENTS.md` (já lido automaticamente via `CLAUDE.md` → `@AGENTS.md`) pra
todo agente/ticket seguinte seguir por padrão, sem repetir.

## Passo 1 — adicionar seção nova ao `AGENTS.md`

```markdown
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
  próprio, ver `src/lib/auth-client.ts`).
```

## Fora de escopo

- Revisar/reescrever seções já existentes do `AGENTS.md` — só adicionar a nova.

## Verificação

- `AGENTS.md` continua sob o limite de tamanho razoável pra ser lido em toda sessão (não virar
  um documento gigante — se crescer demais, considerar mover detalhe pra este próprio
  `00-tech-plan.md` e deixar só a regra curta no `AGENTS.md`).
