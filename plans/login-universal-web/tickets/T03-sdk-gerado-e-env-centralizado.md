# T03 — SDK gerado (hey-api) + `env.ts` centralizado + wrapper axios

**Status:** [x] Concluído (entrou junto de #52 — `env.ts` centralizado, SDK e wrapper axios em `src/libs/`)
**Depende de:** nada tecnicamente, mas é pré-requisito de T04, T08, T09, T10
**Módulos:** `openapi-ts.config.ts`, `src/libs/oikos-sdk/`, `src/libs/api/`, `src/lib/env.ts`,
`src/lib/api.ts` (removido), `.env.example`

## Contexto

`axios` já é dependência (`package.json:31`, `^1.18.1`) — não precisa instalar. `@hey-api/openapi-ts`
não é dependência ainda. O repo `api` já expõe `/docs/openapi.json` atrás de HTTP Basic Auth
(`ADMIN_USERNAME`/`ADMIN_PASSWORD`, `api/src/app.ts`) — mesmo mecanismo que
`mobile/openapi-ts.config.ts` já usa pra gerar `mobile/src/libs/oikos-sdk`.

## Passo 1 — `env.ts` centralizado

`src/lib/env.ts`:
```ts
function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} não configurada. Ver .env.example.`);
	}
	return value;
}

export function getApiUrl(): string {
	return requireEnv("NEXT_PUBLIC_API_URL");
}
```
Atualizar `.env.example`: remover `API_INTERNAL_URL`, adicionar
`NEXT_PUBLIC_API_URL=http://localhost:3333` com comentário explicando que server e client leem a
mesma variável agora (motivo: os dois valores já eram idênticos na prática).

## Passo 2 — `openapi-ts.config.ts` (raiz do repo, espelha o do mobile)

```ts
import "dotenv/config";
import { defineConfig } from "@hey-api/openapi-ts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export default defineConfig({
	input: {
		path: `${apiUrl}/docs/openapi.json`,
		fetch: {
			headers: {
				Authorization:
					"Basic " +
					btoa(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`),
			},
		},
	},
	output: {
		path: "./src/libs/oikos-sdk",
		postProcess: ["biome:format"],
	},
	plugins: [
		"@hey-api/client-axios",
		"@hey-api/schemas",
		{ dates: true, name: "@hey-api/transformers" },
		{ enums: "javascript", name: "@hey-api/typescript" },
		{ name: "@hey-api/sdk", transformer: true },
	],
});
```
Adicionar `ADMIN_USERNAME`/`ADMIN_USERNAME` ao `.env.example` (dev local do repo `api`, não
confundir com segredo de produção). Adicionar `@hey-api/openapi-ts` como devDependency e um
script `"generate:sdk": "openapi-ts"` no `package.json`.

## Passo 3 — `src/libs/api/oikos-api.ts`

Instância axios embrulhando o cliente gerado (`createClient` do `@hey-api/client-axios`,
configurado com `baseURL: getApiUrl()`), injetando `X-Client-Key` (mesmo valor de
`CLIENT_API_KEY` já existente) em toda chamada, e o token/cookie de sessão do Better Auth nas
chamadas autenticadas. Dois pontos de entrada — `createServerApiClient()` (usa a sessão lida via
Server Component/Server Action) e o client singleton (usa a sessão do `authClient` no browser).

## Passo 4 — remover `src/lib/api.ts`

Migrar `verify-email/actions.ts` e `suporte/actions.ts` (únicos consumidores de `apiFetch`) pra
usar o SDK gerado + `oikos-api.ts` em vez de `fetch` cru. Deletar `src/lib/api.ts` depois.

## Fora de escopo

- Gerar o SDK contra um schema de produção — sempre local/dev nesta fase.

## Verificação

- `npm run generate:sdk` roda sem erro contra a api local rodando (`npm run dev` no repo `api`
  primeiro).
- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- `grep -rn "apiFetch\|@/lib/api" src` não retorna nada (confirma a remoção completa).
