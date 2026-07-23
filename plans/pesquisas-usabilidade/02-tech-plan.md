# Tech Plan — Sistema de Pesquisas de Usabilidade

## Abordagem Arquitetural

**Mutações exclusivamente via Server Actions.** Não criamos Route Handlers de negócio — a única exceção é o handler que o próprio Better Auth exige (`api/auth/[...all]/route.ts`, via `toNextJsHandler(auth)`, convenção obrigatória da lib). Toda leitura vem de Server Components buscando direto do Prisma. Isso satisfaz o requisito de zero acesso a banco client-side sem precisar reinventar uma camada de API.

**Autenticação — Better Auth + Prisma adapter, e-mail/senha, conta única:**
- Instância do servidor em `src/lib/auth.ts`; client helper (`createAuthClient`) só pra refletir estado de sessão na UI (ex: trocar "Entrar" por "Sair" no cabeçalho) — nunca pra decisão de autorização.
- Proteção de `/painel/**`: `middleware.ts` faz checagem otimista via `getSessionCookie` (redireciona pra `/entrar` sem sessão) — é reconhecidamente não-autoritativa. A checagem real (`auth.api.getSession()`) acontece no layout server component do painel, que é a fonte da verdade.
- Schema de auth (tabelas de user/session/account/verification) é gerado pelo CLI deles (`npx auth@latest generate`) e mesclado ao `schema.prisma` — não escrito à mão, pra não divergir da versão instalada. Segue a mesma convenção do resto do schema: nomes em inglês, campos em snake_case, tabelas no plural via `@@map`.
- Seed do admin único roda dentro do pipeline de deploy (decisão já tomada com você): um script Node idempotente que verifica se `ADMIN_EMAIL` já existe e, se não, cria a conta via API server-side do Better Auth (que hasheia a senha antes de gravar). Troca de senha subsequente usa a API de credenciais do próprio Better Auth; sem fluxo de recuperação (já assumido nos Core Flows).

**Banco de dados — Postgres local via Docker Compose, hospedagem de produção adiada.** Reverte a ideia inicial de nuvem Prisma: por ora, um serviço `postgres` padrão (não o emulador proprietário `prisma dev`) atende dev e os testes Cypress — mais portável, sem vendor lock-in, troca de destino é só mudar a `DATABASE_URL` quando a hospedagem de produção for decidida. Prisma Client como singleton (`src/lib/prisma.ts`) pra evitar múltiplas instâncias no hot-reload do Next dev.

**Validação — `zod` como nova dependência.** Cada Server Action valida seu payload com um schema zod antes de tocar no Prisma; é o padrão mais direto pra a quantidade de formulários deste módulo (não existe hoje no projeto).

**Reordenação — `@dnd-kit/core` + `@dnd-kit/sortable` como novas dependências.** `radix-ui`/`base-ui` (já presentes) não têm DnD nativo; dnd-kit é o padrão de fato pra listas ordenáveis acessíveis no ecossistema shadcn. Drag é só client-side/otimista; a ordem final persiste via Server Action em `onDragEnd`, sem round-trip por frame.

**Sessão do respondente — cookie assinado, independente do Better Auth, papel só de conveniência.** A retomada de verdade (entre dispositivos, entre sessões) é feita pelo próprio código: reentrar com um código válido busca o rascunho de `Response` existente pelo `invite_id` e retoma dali. O cookie (`iron-session`, HttpOnly assinado+criptografado, sem tabela própria, guardando só `invite_id`) existe só pra evitar redigitar o código a cada "Próximo" dentro da mesma sessão de navegador — não é o mecanismo de resumabilidade em si. Criar um "usuário" fantasma no Better Auth por convite seria forçar uma abstração que não serve aqui (sessão de propósito único, sem login/logout).

**Progresso do respondente é salvo como rascunho, não perdido ao fechar a aba.** Cada "Próximo" persiste as respostas da seção recém-completada (upsert de `Answer`/`AnswerOption`, criando o `Response` com `status: DRAFT` no primeiro avanço). Reentrar com o mesmo código — de qualquer dispositivo — carrega esse rascunho. Só "Finalizar" transiciona `status: DRAFT → FINALIZED` e consome o convite, atomicamente:
- Update condicional `Invite.status = 'ACTIVE' → 'USED'` (fecha a corrida de duplo envio).
- Checagem de `Form.status = 'PUBLISHED'` na mesma transação (evita aceitar resposta tardia de um formulário encerrado durante o preenchimento).
- Reavaliação da lógica condicional contra o payload final: se algo não bater (só possível com client adulterado, já que o fluxo normal sempre produz payload consistente), a submissão inteira é rejeitada com o mesmo erro genérico.

Se duas sessões diferentes usarem o mesmo código simultaneamente, as duas podem editar o rascunho livremente (indefinido qual escrita "vence" em cada seção — risco aceito, cenário raro de mau uso do código) mas só a primeira a clicar "Finalizar" consegue; a segunda recebe o erro genérico de código inválido ao tentar.

**Lógica condicional — avaliada nos dois lados, função pura compartilhada.** A estrutura pública do formulário (seções/perguntas/alternativas — não é dado sensível) é enviada ao client inteira quando o código é validado; um avaliador de condição (função pura, sem I/O) decide no client quais seções mostrar, dando navegação instantânea no wizard sem round-trip a cada "Próximo". No envio final, a *mesma* função roda no servidor sobre o payload recebido, como defesa contra um client adulterado enviando respostas de seções que não deveriam ser alcançáveis.

**Convites:** código gerado com `crypto.randomInt` (não `Math.random`) sobre um alfabeto sem caracteres ambíguos (sem `0/O`, `1/I/L` — vai ser transcrito manualmente por uma pessoa). Unicidade por constraint no banco + retry em colisão (espaço de chaves grande o bastante pra ser raro). "Expirado" é **derivado** (compara `expires_at` com o momento da checagem), não um status persistido — evita depender de job/cron. Consumo do convite (`status: USED`) acontece via update condicional (`WHERE status = 'ACTIVE'`) na mesma transação que grava o `Response`, fechando a race condition de duplo envio simultâneo.

**Restrições:**
- Build de produção é Docker `output: standalone` (sem CLI/`node_modules` completo em runtime) — migrations não podem depender de nada além do que já roda no container final; ficam no pipeline de deploy, fora da imagem.
- Projeto já usa React Compiler (`babel-plugin-react-compiler`) — componentes client novos (wizard, construtor com dnd-kit) não devem usar memoização manual redundante, o compiler já cuida disso.
- O seed do admin e o `prisma migrate deploy` dependem de uma mudança no pipeline do repo `devops` (fora do controle deste plano) — precisa virar um item rastreado explicitamente na quebra em tickets, pra não ser esquecido por estar fora do repo `web`.

## Modelo de Dados

Schema novo, isolado do que o Better Auth gera (nenhuma FK cruzando os dois — o vínculo de "quem é admin" é resolvido via env, não via relação de banco). Convenção: nomes de model em inglês (PascalCase), campos em snake_case, tabelas mapeadas pro plural em inglês via `@@map`.

```prisma
enum FormStatus {
  DRAFT
  PUBLISHED
  CLOSED
}

enum QuestionType {
  TEXT
  SINGLE_CHOICE
  MULTIPLE_CHOICE
}

enum InviteStatus {
  ACTIVE
  USED
  REVOKED
}

enum ResponseStatus {
  DRAFT
  FINALIZED
}

model Form {
  id                          String     @id @default(cuid())
  title                       String
  description                 String?
  status                      FormStatus @default(DRAFT)
  allow_edit_after_responses  Boolean    @default(false)
  created_at                  DateTime   @default(now())
  updated_at                  DateTime   @updatedAt
  published_at                DateTime?
  closed_at                   DateTime?

  sections  Section[]
  invites   Invite[]
  responses Response[]

  @@map("forms")
}

model Section {
  id          String  @id @default(cuid())
  form_id     String
  title       String
  description String?
  order       Int

  form      Form       @relation(fields: [form_id], references: [id], onDelete: Cascade)
  questions Question[]

  // Condição de exibição: aponta pra uma Question de uma seção anterior;
  // aplicável se a resposta intersectar condition_options
  condition_question_id String?
  condition_question     Question? @relation("SectionCondition", fields: [condition_question_id], references: [id], onDelete: Restrict)
  condition_options      SectionConditionOption[]

  @@index([form_id, order])
  @@map("sections")
}

model Question {
  id              String       @id @default(cuid())
  section_id      String
  title           String
  description     String?
  type            QuestionType
  required        Boolean      @default(true)
  character_limit Int?
  order           Int

  section Section  @relation(fields: [section_id], references: [id], onDelete: Cascade)
  options Option[]

  conditioned_sections Section[] @relation("SectionCondition")
  answers              Answer[]

  @@index([section_id, order])
  @@map("questions")
}

model Option {
  id          String @id @default(cuid())
  question_id String
  text        String
  order       Int

  question Question @relation(fields: [question_id], references: [id], onDelete: Cascade)

  accepted_in_conditions SectionConditionOption[]
  selected_in            AnswerOption[]

  @@index([question_id, order])
  @@map("options")
}

// Conjunto de options aceitas pela condição de exibição de uma Section
model SectionConditionOption {
  section_id String
  option_id  String

  section Section @relation(fields: [section_id], references: [id], onDelete: Cascade)
  option  Option  @relation(fields: [option_id], references: [id], onDelete: Restrict)

  @@id([section_id, option_id])
  @@map("section_condition_options")
}

model Invite {
  id               String       @id @default(cuid())
  form_id          String
  code             String       @unique
  interviewer_name String
  status           InviteStatus @default(ACTIVE)
  expires_at       DateTime?
  created_at       DateTime     @default(now())

  form     Form      @relation(fields: [form_id], references: [id], onDelete: Cascade)
  response Response?

  @@index([form_id])
  @@map("invites")
}

model Response {
  id           String         @id @default(cuid())
  form_id      String
  invite_id    String         @unique
  status       ResponseStatus @default(DRAFT)
  updated_at   DateTime       @updatedAt
  submitted_at DateTime?

  form    Form     @relation(fields: [form_id], references: [id], onDelete: Cascade)
  invite  Invite   @relation(fields: [invite_id], references: [id], onDelete: Restrict)
  answers Answer[]

  @@map("responses")
}

model Answer {
  id          String  @id @default(cuid())
  response_id String
  question_id String
  text_value  String?

  response Response @relation(fields: [response_id], references: [id], onDelete: Cascade)
  question Question @relation(fields: [question_id], references: [id], onDelete: Restrict)

  selected_options AnswerOption[]

  @@unique([response_id, question_id])
  @@map("answers")
}

model AnswerOption {
  answer_id String
  option_id String

  answer Answer @relation(fields: [answer_id], references: [id], onDelete: Cascade)
  option Option @relation(fields: [option_id], references: [id], onDelete: Restrict)

  @@id([answer_id, option_id])
  @@map("answer_options")
}
```

**Decisões-chave:**
- `onDelete: Restrict` em `SectionConditionOption.option` e `Section.condition_question` faz o próprio banco impedir a exclusão de uma Question/Option referenciada por uma condição — a Server Action só precisa capturar a violação (Postgres `23503` / Prisma `P2003`) e traduzir pra uma mensagem amigável, a integridade em si é garantida pelo schema. Isso vale em cascata: excluir uma Section inteira que contenha uma Question referenciada por outra Section também é bloqueado pelo mesmo mecanismo (o cascade de `Question` esbarra no `Restrict` antes de completar) — a Server Action de excluir Section precisa do mesmo tratamento de erro.
- `Response.invite_id` é `@unique` — modela o 1:1 "um convite gera no máximo uma resposta" diretamente na constraint.
- IDs `cuid()` em tudo — opacos o bastante pra aparecer na URL pública (`/responder/[formId]`) sem precisar de slug separado.
- `order` é inteiro simples, reescrito nos itens afetados a cada reordenação — sem indexação fracionária, escala tranquila pro volume de seções/perguntas de uma pesquisa.

## Arquitetura de Componentes

**Camada de autenticação** — `src/lib/auth.ts` (instância Better Auth + Prisma adapter), `src/lib/auth-client.ts` (hooks de sessão pro client), `middleware.ts` (guarda otimista de `/painel/**`). Interface com o resto do sistema: server components chamam `auth.api.getSession()`; componentes client leem o hook de sessão só pra exibição condicional (botão Entrar/Sair no `site-header.tsx` existente).

**Camada de dados** — `src/lib/prisma.ts` (singleton do Prisma Client) e `prisma/schema.prisma` (schema deste módulo + o gerado pelo Better Auth, no mesmo arquivo). Único ponto de acesso ao banco; nada fora de Server Actions/Server Components importa isso.

**Server Actions do módulo**, agrupadas por área e cada uma validando entrada com zod antes de tocar no Prisma:
- *Formulário/construtor* — criar, renomear, adicionar/editar/reordenar seção e pergunta, configurar condição de exibição, publicar, encerrar, duplicar, excluir.
- *Convites* — gerar, revogar, listar (com status derivado calculado no momento da leitura).
- *Resposta pública* — validar código (cria o cookie de sessão do respondente; busca rascunho existente pelo `invite_id` ou inicia um novo), salvar progresso por seção (upsert do rascunho), finalizar (revalida a lógica condicional, checa `Form.status`, consome o convite e marca a resposta como `FINALIZED`, tudo na mesma transação).

**Avaliador de condição de seção** — módulo isolado, função pura `(conditionQuestionId, acceptedOptionIds[], givenAnswers) => aplicável: boolean`, sem I/O. Importado tanto pelo componente client do wizard (navegação instantânea) quanto pela Server Action de envio final (revalidação). É a unidade natural pros testes unitários do critério de sucesso definido no Epic Brief.

**Sessão do respondente** — módulo isolado (`iron-session` configurado) responsável por criar/ler o cookie vinculado a um `invite_id`. Só as Server Actions da rota pública o utilizam; nunca cruza com a sessão do Better Auth.

**UI do painel** (`/painel/**`) — reaproveita o `Sidebar` já existente em `components/ui/sidebar.tsx` (ganha um item "Pesquisas"), e os componentes de formulário já padronizados no design system (`Field`, `Input`, `Textarea`, `Select`, `Dialog`, `Tabs` para as abas Construtor/Convidados/Configurações dentro da página de um formulário). O construtor é o único ponto que introduz um componente novo de fato: a lista ordenável via dnd-kit.

**UI pública de resposta** (`/responder/[formId]`) — página inicial (Server Component) resolve o estado do formulário e renderiza o gate de código ou, se o cookie de sessão do respondente já existir e for válido, a estrutura completa junto do rascunho já salvo (se houver, pra retomar de onde parou); o wizard em si é um componente client que consome o avaliador de condição pra decidir a seção seguinte sem round-trip, e persiste o rascunho a cada avanço de seção.

**Integração com o existente:**
- `site-header.tsx` ganha um botão condicionado ao estado de sessão do Better Auth (Entrar / ir ao Painel).
- Feedback de sucesso/erro das Server Actions reaproveita o `Toaster` (sonner) já montado no `layout.tsx` raiz.
- Nenhum componente novo entra em `components/ui` (área gerada pelo shadcn, ignorada pelo Biome) — tudo específico do módulo fica em uma área própria do app.
