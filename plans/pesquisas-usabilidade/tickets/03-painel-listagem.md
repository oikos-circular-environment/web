# T3 — `web`: Painel + listagem de formulários

**Repositório**: `oikos-circular-environment/web`

## Escopo

Casca do painel de controle (sidebar com item "Pesquisas") e a tela de listagem: criar formulário (nasce em rascunho), renomear, excluir (só rascunho), ver estado. É o primeiro pedaço com Server Actions de negócio de verdade — estabelece o padrão que T4 em diante replica (validação zod, tratamento de erro, feedback via toast).

## Fora de escopo

Construtor (T4), condição de exibição (T5), publicar/encerrar/duplicar (T6), convites (T7).

## Referências de spec

- `01-core-flows.md` Fluxo 2 — Painel de Controle e listagem de formulários
- `02-tech-plan.md` §Arquitetura de Componentes — UI do painel, Server Actions do módulo

## Dependências

T1 (schema), T2 (auth/proteção de rota).

## Checklist

- [ ] `src/app/painel/layout.tsx` — sidebar reaproveitando `components/ui/sidebar.tsx`, item "Pesquisas"
- [ ] `src/app/painel/pesquisas/page.tsx` — listagem (Server Component, busca direto do Prisma): título, estado, data de criação
- [ ] Estado vazio da listagem convidando a criar o primeiro formulário
- [ ] Server Action `createForm` — cria em `DRAFT` com título placeholder, navega pro construtor (stub de T4 por ora, pode apontar pra uma rota vazia até T4 existir)
- [ ] Server Action `renameForm` — validação zod (título obrigatório)
- [ ] Server Action `deleteForm` — só permite se `status = DRAFT`; diálogo de confirmação na UI
- [ ] Ações contextuais na listagem: Editar, Excluir (condicionalmente visível/desabilitado fora de rascunho)
- [ ] Cypress: criar formulário aparece na listagem, renomear reflete, excluir remove, excluir fica indisponível fora de rascunho

## Definição de Pronto

Admin autenticado cria, renomeia e exclui formulários em rascunho pela UI; listagem reflete o estado de cada um; nenhuma chamada Prisma acontece fora de Server Component/Server Action.
