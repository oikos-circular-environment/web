# T10 — Moderação de usuários (exemplo de feature, só `moderator`)

**Status:** [x] Concluído (entrou junto de `987e739`, sem marcação no plano até agora)
**Depende de:** T03, T07
**Módulos:** `src/app/(dashboard)/moderacao/`, `src/components/moderacao/`

## Contexto

Consome `/v2/moderation/users` (já existe na api: list, get, create, ban/unban, set-role, revoke
sessions, remove). Não existe UI de moderação em nenhum dos dois clientes hoje — greenfield.
Acesso condicionado a `role === "moderator"` tanto na navegação (T07, item da sidebar só aparece
pra moderator) quanto na própria página (`redirect` se não for moderator — nunca confiar só no
item de menu escondido, a api já valida de verdade no backend, mas a página confirma no client
pra não vazar layout).

## Passo 1 — `use-users-list.ts` (viewmodel)

`useQuery` sobre a função gerada de listagem, com paginação/busca por email (a api já suporta
`searchField`/`searchValue` via Better Auth admin plugin).

## Passo 2 — página

Lista + ações básicas (ban/unban, mudar papel) via `useMutation`. Padrão de UI: tabela +
dropdown de ação por linha, confirmação (`AlertDialog` do shadcn) antes de ban/remove — ação
destrutiva não dispara direto no clique.

## Fora de escopo

- Listagem de suporte (o endpoint `POST /v1/moderation/support` existe mas não tem `GET` — vira
  ticket de backlog separado, mencionado no plano da Trilha A).

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- Manual: logado como `christian.cesar@oikos.company` (moderator, seed da Trilha A) vê a lista;
  logado como `christiancnp@gmail.com` (user) não vê o item de menu e é redirecionado se acessar
  a URL direto.
