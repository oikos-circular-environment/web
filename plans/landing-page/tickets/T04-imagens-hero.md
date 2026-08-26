# T04 — Par de imagens do hero

Executor: eu (exige MCP do Higgsfield + julgamento visual do par).

Duas imagens de **composição idêntica** — requisito crítico: se a degradada não casar com a pristine, o reveal do ripple "pula" e o efeito se perde.

Caminho que garante o casamento: gerar a **pristine primeiro**, depois derivar a **degradada por edição** dela (passando a própria pristine como referência de imagem) — nunca gerar as duas a partir de prompts independentes.

- `public/hero/pristine.webp` — natureza intacta, tratamento caro, luz de hora dourada
- `public/hero/degraded.webp` — mesma cena com poluição e resíduo visível, mesmo enquadramento, mesma luz

Mesma resolução nas duas (o `coverUV()` do shader em T05 usa `uTextureSize`; dimensões diferentes distorcem o reveal).

Saldo Higgsfield conferido em 2026-08-21: **128,64 créditos** (plano starter) — folgado para a pristine mais algumas iterações da degradada até casar. Preflight de custo com `get_cost` antes de cada geração.

## Checklist

- [x] Gerar a pristine (`get_cost` antes) — `nano_banana_pro`, 2 créditos, job `d3164138-bc77-48b4-8a86-8522f513bc47`
- [x] Derivar a degradada por edição da pristine, mesma referência — 2 tentativas: a 1ª (job `c3e1810a`) divergiu de composição e foi descartada; a 2ª (job `8c40f8e8`, 2 créditos) manteve enquadramento/árvores/afloramento rochoso e casou. Total gasto: 6 créditos.
- [x] Conferir sobrepondo as duas (mesmo enquadramento/composição) — validado visualmente, mesma cena, degradação via lixo flutuante + mancha de óleo
- [x] Exportar as duas na mesma resolução para `public/hero/` — 1920×1072, `.webp`
- [x] Confirmar peso de arquivo razoável para LCP — `pristine.webp` 575 KB, `degraded.webp` 395 KB (`quality=80`, `method=6`); T03/T05 devem considerar `next/image` com `priority` e talvez `quality` menor se o Lighthouse (T05) apertar
