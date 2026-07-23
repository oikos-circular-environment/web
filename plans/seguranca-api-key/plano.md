# Segurança de acesso à API — api-key (mobile#34)

## Contexto

Task nasceu como mobile#34 ("implementar api-key"), cujo corpo reproduz o estudo prévio em `api/docs/api-key-methodology.md`. Objetivo específico do usuário: **apenas os serviços da própria organização (app mobile e frontend web) devem ter acesso à API** — não terceiros/scripts avulsos. Pedido explícito: entender prós e contras, e como isso impacta o acesso aos demais serviços, antes de implementar.

Relacionado: web#30 (PR #31, merged) e api#47 (PR #48, merged) — criaram o fluxo de Suporte e o endpoint público `POST /v1/moderation/support`, que hoje é o principal endpoint de escrita pública da API e um dos motivadores de reforçar esse controle agora.

## Estado atual mapeado (pesquisa no código)

**API (Fastify)**
- Auth de usuário: JWT (`@fastify/jwt`), guard `verifyJwt` em `src/modules/common/middlewares/verify-jwt.ts`, aplicado por módulo via `onRequest`. **Nenhum conceito de service-to-service/API key existe hoje.**
- Rotas 100% públicas, sem qualquer auth: `market`, `moderation/support` (upload de arquivo, acabou de entrar em produção), `waste-categories`, `auth/login`, `auth/refresh`, `users/register`, `/health`. `complaints/map` é pública via flag `config: { public: true }` dentro de um módulo majoritariamente autenticado.
- CORS (`src/app.ts`): `origin: "*"` — libera qualquer origem, sem allowlist.
- Rate limit (`src/app.ts`): `@fastify/rate-limit`, 100 req/min **por IP**, global — não diferencia cliente algum.
- Nenhuma env de segredo tipo `API_KEY`/`SERVICE_TOKEN` existe em `src/env`.

**Mobile**
- Client Axios encapsulado em `src/libs/api/oikos-api.ts`; interceptor injeta só `Authorization: Bearer`. Tokens em `expo-secure-store`.
- Qualquer `EXPO_PUBLIC_*` (onde entraria uma api-key) é embutido no bundle nativo e **extraível** de um APK/IPA — isso é uma limitação de fundo, não um bug a corrigir.
- EAS já suporta secrets/environment por profile (`eas.json`: development/preview/production), mecanismo pronto para injetar a chave só em builds de produção.
- Sem attestation nativo (Play Integrity / App Attest) hoje.

**Web**
- Chamadas 100% client-side via `src/lib/api-client.ts` (Axios simples), sem interceptor de auth/API-key. Consumido direto em hooks (`useMutation` do React Query), ex. `use-submit-support-request.ts` → `POST /v1/moderation/support`.
- Sem `middleware.ts`, sem Route Handlers, sem Server Actions hoje — tudo roda no browser, qualquer header customizado seria visível no devtools.
- `next.config`: `output: "standalone"` — já é um processo Node persistente (não export estático), rodando em container próprio (`web:3000`) atrás do Nginx.
- Login web já seta refresh token em **cookie httpOnly** (diferente do mobile, que usa body/secure-store).

**Devops**
- Nginx puro (sem WAF/gateway dedicado) → `api:3333` / `web:3000` por `server_name`. Cloudflare na frente (`ssl=strict`, `min_tls_version=1.2`, Origin CA na origin, sem Let's Encrypt).
- OCI Security List já restringe a porta 443 aos ranges IP oficiais da Cloudflare — bloqueia bypass direto à VM, mas não diferencia cliente legítimo de terceiro que passe pela Cloudflare.
- Sem Cloudflare Access/WAF rules/IP allowlist configurados no Terraform.
- Sem vault — segredos em `.env.prod` na VM, renderizados via GitHub Secrets no `deploy.yml`.
- Achado lateral (não bloqueia esta task, follow-up separado): `devops/cloudflare/.env.cloudflare` tem um `API_TOKEN` da Cloudflare em texto puro no filesystem local.
- Nenhum outro serviço (cron/worker/script) chama a API via HTTP hoje — os `k6` load tests e scripts de backup não passam pela API.

## O ponto central (trade-off que redefine o escopo)

**Correção importante em relação à primeira versão deste plano**: a exposição do segredo não é um problema de "mobile e web" — é um problema **só do mobile**, condicionado à arquitetura atual do web.

A diferença crucial em relação ao modelo do `JWT_SECRET` (que o usuário usou como analogia) é **quem executa a operação de encode/assinatura**. No fluxo de JWT, só a API roda `sign`/`verify` — o segredo nunca sai dela, o client só carrega um artefato já pronto. O mesmo vale pra api-key **desde que a operação de anexar/assinar o segredo rode só do lado servidor**:

- **Mobile**: não existe "lado servidor" — o app roda inteiro no aparelho do usuário. Qualquer segredo usado pra montar o header tem que estar embutido no bundle, e é irredutivelmente acessível a quem tiver o app instalado (via engenharia reversa do APK/IPA, ou mais fácil ainda, via proxy de rede no próprio aparelho — ver seção abaixo). Isso não é um gap de implementação, é uma limitação estrutural: um app público não tem como guardar segredo de quem o instalou.
- **Web**: hoje tem o mesmo problema, porque a chamada roda 100% no browser (client-side Axios). Mas isso **deixa de ser verdade assim que migrarmos pra Server Components/Server Actions** (decisão 3 abaixo) — a partir daí, o `fetch` pra API roda só no processo Next.js do servidor, o browser nunca vê o segredo, exatamente como o `JWT_SECRET` hoje. Web bem migrado não é "cliente público exposto" pra esse propósito — é estruturalmente equivalente à API.

Ou seja: o esforço de "aceitar uma limitação e mitigar" é **específico do mobile**. Pro web, a arquitetura certa remove o problema, não apenas mitiga.

## Duas ameaças diferentes (e por que rotação/TTL não resolve a que mais importa)

Durante a discussão, surgiu a dúvida: "e se alguém emular um dispositivo (ex.: React Native rodando num emulador) e ficar disparando requisições deliberadas?" — isso é uma ameaça real e, na prática, **mais fácil de executar do que engenharia reversa do binário**. Vale separar em dois eixos independentes:

| Ameaça | O que é | Rotação/TTL ajuda? | O que ajuda de verdade |
|---|---|---|---|
| **Replay** | Alguém intercepta uma requisição específica em trânsito e reenvia depois | Sim — é exatamente pra isso que serve | HTTPS já obrigatório (Cloudflare strict) já cobre a maior parte disso |
| **Extração / captura ao vivo** | Alguém instala o app (beta), roda um proxy (mitmproxy/Charles/Proxyman) com CA confiável no próprio emulador/aparelho, lê o header em texto claro **antes** de virar TLS, e depois escreve um script que dispara requisições fora do app real | **Não** — o atacante está capturando o valor válido atual do jeito que o app real o produz; se ele automatiza a captura ao vivo (em vez de reusar um valor antigo), qualquer rotação é recalculada por ele em tempo real, junto com o app | Trocar o valor da env (`CLIENT_KEY_MOBILE`) + redeploy quando detectado abuso; `CLIENT_KEY_ENFORCE=false` como kill-switch emergencial; **certificate/SSL pinning** no mobile (ver abaixo) |

O ponto chave: interceptar o próprio tráfego de um dispositivo que você controla **não exige quebrar HTTPS nem descompilar nada** — só instalar um proxy com uma CA confiável no emulador/aparelho de teste. Isso é bem mais barato do que engenharia reversa do bundle, e é exatamente o cenário que o usuário levantou.

O que a api-key (versão simplificada, sem banco) já compra aqui, sendo honesto sobre o teto:
- Levanta o piso de "qualquer HTTP client, zero fricção, nem precisa ter instalado o app" para "precisa ter obtido uma key válida real pelo menos uma vez" — hoje, sem key nenhuma, isso nem é necessário.
- Revogar uma key vazada não é instantâneo: como é um valor fixo em env (não uma linha de banco), tirar de circulação exige trocar o valor + redeploy do serviço afetado (aceito conscientemente — só 2 clientes fixos, sem urgência de revogação per-key sem redeploy).

O que resolveria diretamente o cenário de proxy/emulador (sem entrar em Play Integrity, que já ficou de fora): **certificate pinning** no mobile. O app passa a recusar qualquer certificado TLS que não seja o pinado, então o truque de "instalar CA confiável no emulador + proxy" para de funcionar — o atacante precisaria também contornar o pinning (ex.: via Frida/objection), o que já é um nível de esforço bem mais próximo de engenharia reversa de verdade. É uma adição de esforço moderado (padrão conhecido em Expo/React Native), não é attestation completo, e ataca exatamente a ameaça descrita. Fica registrado como candidato a somar ao nível pragmático — não implementado ainda, decisão em aberto.

## Decisões já tomadas com o usuário

1. **Nível de garantia: Pragmático** — client-key + CORS allowlist. Descartado por ora: HMAC request signing/nonce (over-engineering pro cenário) e attestation nativo (Play Integrity/App Attest — grande esforço, não cobre web, fica como ticket futuro separado se algum dia for necessário).
2. **Simplificação: segredos fixos em env, sem banco.** Descartado o desenho inicial (tabela `ApiClient` com hash SHA-256, script de geração, cache) — pensado pro padrão Stripe/GitHub de N clientes dinâmicos, mas aqui são sempre os mesmos 2 clientes (mobile, web) que só nós criamos. `CLIENT_KEY_MOBILE`/`CLIENT_KEY_WEB` comparados direto via `crypto.timingSafeEqual`, mesmo padrão que `ADMIN_USERNAME`/`ADMIN_PASSWORD` já usam no código. Trade-off aceito: revogar uma key vazada exige trocar a env + redeploy (não é instantâneo como seria com uma linha de banco) — considerado aceitável dado o número fixo de clientes.
3. **Web: migrar para Server Components (leituras) + Server Actions (mutações)** usando a sessão via cookie httpOnly já existente, em vez de um Route Handler dedicado — o usuário já teve experiência ruim de manutenibilidade/deploy com BFF via Route Handlers. Como o web já roda `output: "standalone"` (processo Next persistente, já proxied pelo Nginx), Server Components/Actions não criam nenhum deployable novo — é a mesma infra já existente, sem rota `/api/*` extra pra versionar/manter. Isso também encaminha o objetivo maior do usuário: web como extensão do mobile (mesmas funcionalidades, painel de controle, relatórios). Nota: um painel de moderação real esbarra na ausência de `role` no `User`/JWT, já registrada como fora de escopo em api#47 — fica como dependência futura, não bloqueia esta task.
4. **Rollout mobile: enforce direto, sem fase log-only.** O app ainda não foi publicado para usuários finais (só closed beta), então não há instalação legada a proteger — basta pedir aos beta testers pra atualizar.

A quebra por repositório (o que cada um entrega) está na seção **Tarefas por repositório**, mais abaixo — é a versão que virou as issues reais e reflete o design final (sem banco).

## Debugging de Server Components / Server Actions (Next.js 16.2.10, específico deste repo)

Pergunta motivadora: se o fetch/chamada não aparece no Network tab do browser (por rodar no processo Node, não no browser), como debugar?

- **Mental model**: o código de Server Component/Action roda no processo Node — a atividade de rede dele é invisível ao Network tab do browser. O "devtools" muda de lugar: do browser para o processo servidor.
- **`console.log`** dentro de Server Component/Action → aparece no terminal (`npm run dev`) ou em `docker compose logs web` (staging/prod), nunca no console do browser. Hoje o web **não tem pino/log estruturado geral** (comentário em `src/instrumentation.ts:24` confirma isso) — só existe o hook nativo `onRequestError` (Next Instrumentation API), que já captura **erros lançados** dentro de Server Components/Actions e emite via `@opentelemetry/api-logs` pro mesmo pipeline OTel que alimenta Grafana/Loki (usado na investigação do CPU spike). Ou seja: **lançar um erro** (não só logar) no ponto onde a client-key é anexada já aparece na observability existente, inclusive em produção, sem precisar abrir nada no browser.
- **Breakpoints reais**: como é um processo Node comum, `next dev -- --inspect` + `chrome://inspect` (Chrome) ou `about:debugging` (Firefox) abre um DevTools separado *do processo servidor*, com breakpoint de verdade dentro do Server Component/Action. Alternativa: `.vscode/launch.json` (o repo ainda não tem) com uma config `"Next.js: debug full stack"` rodando `next dev --inspect` — debuga client e server na mesma sessão do VS Code. *(Oferecido ao usuário criar esse arquivo — aguardando confirmação.)*
- **O que ainda aparece no Network tab do browser**: para Server Actions, uma única requisição `POST` pra própria URL da página, com header `Next-Action` identificando a action. Corpo vem serializado em RSC/Flight, não JSON legível — só confirma que a action disparou e teve resposta, não permite inspecionar o fetch interno feito para `api.oikos.company`.
- **React DevTools** (extensão) mostra a árvore de Server Components (marcados como tal) — estrutural, não de rede.
- **Recomendação prática** para esta task: durante o desenvolvimento do header de client-key dentro da Server Action, `console.log`/breakpoint logo antes do `fetch`/Axios para `api.oikos.company`, olhando terminal/`docker compose logs web` — é o equivalente ao Network tab do cenário client-side atual.

## Revisão do plano — a pergunta do DDoS/scraping

Pergunta a responder: *independente do device, se alguém mal-intencionado ficar fazendo DDoS/scraping na API, teria acesso livre ou seria bloqueado?*

**DDoS (volume para derrubar o serviço)** — a api-key **não é a defesa certa** e não se deve esperar isso dela. Um 401 rejeitado no Fastify já custou conexão, TLS no Nginx e CPU do Node. Contra volume, o bloqueio precisa acontecer **antes da origin**: Cloudflare já absorve L3/L4 automaticamente (mesmo free) e a OCI Security List impede bypass direto à VM; floods L7 sem regra WAF configurada ainda chegam na origin. O plano não altera isso — e não precisa, desde que a expectativa esteja clara.

**Scraping / requisições deliberadas (abuso funcional)** — aqui o plano muda o jogo:
- Hoje: **acesso livre** (`market`, `waste-categories`, `complaints/map`, `moderation/support` respondem a qualquer `curl`; 100 req/min por IP é contornável por scraper distribuído).
- Com o plano: `curl` sem key → **bloqueado (401)**; scraper casual morre aqui. Atacante determinado com key extraída/capturada → passa a validação; rate-limit continua só por IP (estático, sem diferenciar cliente); revogar a key exige trocar a env + redeploy.
- Veredito: **bloqueado para o caso comum; para o determinado, a única resposta é trocar a key + redeploy quando detectado.** O teto honesto vem da key do *mobile*: por ser um **cliente público** (jargão OAuth: app que roda inteiramente no ambiente do usuário final — não confundir com "endpoint público"), qualquer segredo que ele carrega está fisicamente na mão de quem tem o app instalado, então não há barreira criptográfica absoluta para essa key. A key do *web* pós-migração não tem esse teto — vive só no processo Next.js do servidor (cliente confidencial), nunca obtível, igual ao `JWT_SECRET`. Já os "endpoints públicos" (sem login) deixam de ser abertos: continuam sem exigir usuário autenticado, mas passam a exigir cliente autenticado (client-key) — as duas coisas viram independentes.

### Contras identificados na revisão desta fase (design com banco, depois descartado)

Esta revisão aconteceu quando o desenho ainda usava tabela `ApiClient` + rate-limit composto. Esse desenho foi **descartado depois** (ver "Decisões já tomadas", item 2) por complexidade desnecessária pra só 2 clientes fixos — os itens 1, 2 e 4 abaixo não se aplicam mais por não existir mais banco/cache/rate-limit por cliente. Fica registrado como histórico da revisão, não como estado atual:

1. ~~Rate-limit só por client-key seria vetor de DoS~~ → não se aplica mais (rate-limit voltou a ser só por IP).
2. ~~Validação da key contra banco em toda request~~ → não se aplica mais (comparação direta em memória, sem banco).
3. CORS allowlist não é barreira contra scripts (só browsers) → **ainda vale** — registrado como higiene, não defesa.
4. ~~Key sem expiração/rotação~~ → não se aplica mais (não há mais `expiresAt`; rotação é trocar a env + redeploy).

### Meios correlacionados (ordem de custo-benefício, todos free tier Cloudflare)

1. **Regra WAF exigindo header `X-Client-Key` presente** — bloqueia na *edge* tráfego sem o header; scraper ingênuo e flood L7 sem header nem chegam na VM. Complemento direto à resposta do DDoS.
2. **Turnstile no formulário de suporte** — `moderation/support` é endpoint público de escrita com upload, o alvo mais atraente para spam automatizado; token validado server-side.
3. **Bot Fight Mode** — toggle de detecção heurística de bots na edge.
4. **Rate limiting rule na edge** (free inclui 1 regra) — rejeita volume antes da origin, aliviando a VM.
5. **Alertas no Grafana existente** sobre tráfego anômalo com key inválida (já logado via `request.log.warn`) — ajuda a decidir quando vale rotacionar a env key.

## Tarefas por repositório (prontas para virar issues)

Parent: **mobile#34** (existente — corpo será atualizado para refletir este plano e ganhar as sub-issues abaixo, seguindo o padrão web#30 → api#47).

Ordem de execução e dependências:

```
1. api (fundação — bloqueia todas) [PR api#50 aberto contra development]
2. web e mobile (paralelas entre si, dependem da api)
3. devops (chaves em prod, depende da api)
   Deploy prod: api + web + mobile direto, sem fase de transição — app inteiro
   em beta, sem clientes reais em produção a proteger durante o rollout.
```

### Task A — api: "Autenticação de cliente via X-Client-Key" — ✅ concluída (PR api#50)

**Contexto**: A API não distingue clientes legítimos (mobile/web) de terceiros — endpoints sem login respondem a qualquer request. Criar o conceito de credencial de cliente, separado da autenticação de usuário (JWT).

**Simplificação decidida durante a implementação**: descartado o model Prisma com hash/script/cache (pensado originalmente pro padrão Stripe/GitHub de N clientes dinâmicos). Com apenas 2 clientes fixos e conhecidos, isso era complexidade desnecessária — trocado por 2 segredos fixos em env, comparados direto, mesmo padrão que `ADMIN_USERNAME`/`ADMIN_PASSWORD` já usam neste código.

**Entregue**:
- Envs `CLIENT_KEY_MOBILE`, `CLIENT_KEY_WEB` (segredos fixos).
- Middleware `verifyClientKey` em `src/modules/common/middlewares/`, registrado global para `/v1/*` em `src/app.ts`; exceções: `/health`, `/docs`, `/bullboard`. Comparação `timingSafeEqual`; `AppError` 401 `INVALID_CLIENT_KEY`.
- Env `CLIENT_KEY_ENFORCE` (default `true`) — kill-switch operacional, não mecanismo de rollout faseado.
- CORS: `origin: "*"` → allowlist via env (`CORS_ALLOWED_ORIGINS`).
- Rate limit: mantido como estava (por IP, estático) — decidido não particionar por cliente.
- Swagger: security scheme do header documentado.
- Testes: unitários do middleware + e2e.

### Task B — web: "Migrar submissão de Suporte para Server Action com client-key server-side"

**Contexto**: A chamada `POST /v1/moderation/support` roda no browser — qualquer segredo ali é visível. Migrar para Server Action move o fetch para o processo Next.js (cliente confidencial), onde a key vive como env server-only. Estabelece o padrão para o futuro painel (leituras = Server Components, mutações = Server Actions).

**Critérios de aceite**:
- Server Action (`"use server"`) junto ao form de suporte substituindo o `useMutation`/Axios client-side; `use-submit-support-request.ts` removido ou adaptado.
- `CLIENT_API_KEY` como env **sem** prefixo `NEXT_PUBLIC_` (+ `.env.example` atualizado). Opcional: server-side pode chamar `http://api:3333` direto pela rede Docker interna em prod, dispensando a volta pela edge pública.
- Estados de UI preservados: loading via `formState.isSubmitting`/`useActionState`, erro via toast sem resetar o form (comportamento da web#30 mantido).
- **e2e ajustado**: `page.route` do Playwright não intercepta fetch server-side — mudar estratégia (API fake apontada via env no processo Next, ou e2e contra API real local).
- `.vscode/launch.json` com config "Next.js: debug full stack" (`next dev --inspect`) — o debug agora é no processo Node, não no Network tab.

### Task C — mobile#34 (existente): "Enviar X-Client-Key e X-App-Version"

**Critérios de aceite**:
- Interceptor de request existente (`src/libs/api/oikos-api.ts`) passa a injetar `X-Client-Key` (de `EXPO_PUBLIC_CLIENT_API_KEY`) e `X-App-Version` (`expo-application`/`Constants.expoConfig.version`).
- `EXPO_PUBLIC_CLIENT_API_KEY` em `.env`/`.env.eas` locais + EAS environment variables por profile (production).
- `.env.example` atualizado.
- Verificação fim a fim contra API local com enforce ligado.
- Registrar no corpo da issue a limitação conhecida (cliente público — key extraível; mitigação = trocar o valor da env + redeploy caso vaze; certificate pinning como possível evolução futura).

### Task D — devops: "Provisionar client-keys em produção"

**Contexto**: toda a aplicação está em fase beta (sem clientes reais em produção, só testadores) — não há necessidade de sequenciar o deploy em fases. Api, web e mobile sobem já com o enforcement ligado desde o primeiro deploy.

**Critérios de aceite**:
- Gerar 2 valores aleatórios de alta entropia (`openssl rand -hex 32`) — sem script novo, sem tocar no banco de produção.
- GitHub Secrets: `CLIENT_KEY_MOBILE`/`CLIENT_KEY_WEB`/`CLIENT_KEY_ENFORCE=true` no repo `api`; o mesmo valor gerado para "web" também como `CLIENT_API_KEY` no repo `web`; o valor gerado para "mobile" documentado para uso no EAS environment de produção (`EXPO_PUBLIC_CLIENT_API_KEY`, mobile#34).
- `deploy.yml`/`.env.prod` do `api` e do `web` atualizados para consumir os secrets.
- Deploy direto de api + web + mobile (EAS), sem fase de transição.

### Follow-ups (issues separadas, fora do escopo desta entrega)

- **devops/Cloudflare**: regra WAF exigindo header `X-Client-Key` na edge; Bot Fight Mode; 1 rate limiting rule na edge; Turnstile no form de suporte.
- **devops**: mover `devops/cloudflare/.env.cloudflare` (token em texto puro) para GitHub Secrets.
- **mobile**: certificate pinning (mitiga proxy/emulador); avaliação futura de Play Integrity/App Attest.
- **api**: sistema de `role` no `User`/JWT (pré-requisito do painel de moderação — já registrado como fora de escopo em api#47).

## Em aberto / próximos passos

- Criar as issues (A, B, D) nos respectivos repos como sub-issues de mobile#34 e atualizar o corpo de mobile#34 — aguardando confirmação do usuário.
- Iniciar implementação pela Task A (api).
