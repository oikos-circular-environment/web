# Planejamento Detalhado — Landing Page Oikos (Pencil Prototype)

**Data**: 2026-08-20  
**Branch**: `63-criar-landing-page`  
**Arquivo Pencil**: `web/pencil/web.pen`  
**Frame Principal**: "Landing Page Prototype / Oikos" (1440px width, vertical layout)

---

## Visão Geral

Estrutura vertical com **12 seções** mapeadas no Pencil (totalizando ~8000px de altura). Cada seção combina:
- **Copy frame**: Texto, headline, CTA
- **Visual frame**: Placeholder ou mockup de interação
- **Motion note**: Sticky note com specs de animação/interação
- **Detailed interaction frame** (quando aplicável): Breakdown de steps/beats

---

## Seção 1: Hero / Ecossistema vivo
**Altura**: 920px  
**Tipo de Interação**: Parallax/scroll reveal + static 3D ecosystem

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Atmospheric Gradient Base** | Rectangle | 1440×920 | Fundo com gradiente linear (floresta → bege) |
| **Glass Nav / shadcn shell** | Frame | 1312×72 | Navegação glassmorphism com backdrop blur |
| **Hero Copy** | Frame | 640×? | Headline + subheadline + CTA (lado esquerdo) |
| **Full bleed isometric ecosystem** | Frame | 560×560 | Placeholder (beige + white stroke + shadow) para ilustração isométrica |
| **Sticky Note / Motion** | Note | 310×150 | Specs: parallax scroll, timing, opacity reveal |

### Copy / Mensagem Chave
- **Headline**: "Transformar resíduo em recurso" (ou similar — confirmar com copy doc)
- **Subhead**: Contextualiza o problema + solução
- **CTA Primária**: "Começar" ou "Explorar"

### Interação & Motion
- **On scroll into view**: Fadeup do copy (0–600ms easing out)
- **3D ecosystem**: Fade in + subtle parallax (scroll depth × 0.3 offset)
- **Glass nav**: Sticky no topo ao scroll; blur aumenta levemente conforme scroll
- ✅ **Placeholder status**: Isometric illustration ainda não renderizada — aguarda Blender/Figma export

---

## Seção 2: Provocação / Resíduo também é valor
**Altura**: 1040px  
**Tipo de Interação**: Scroll reveal + visual transformation

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Problem Copy** | Frame | 580×? | Contextualiza o problema em 2–3 parágrafos |
| **Territory map placeholder** | Frame | 520×440 | Visual: mapa de pontos de coleta / territórios |
| **02 Scroll Provocation** | Frame | 1248×300 | Horizontal scroll ou timeline: cadeia de valor do resíduo |
| **02 Value Transformation Visual** | Frame | 520×350 | Ilustração: transformação visual (lixo → recurso) |
| **Sticky Note / Section 02 Motion** | Note | 340×190 | Specs: scroll trigger, stagger animation de elementos |

### Copy / Mensagem Chave
- **Headline**: "Resíduo também é valor"
- **Body**: Estatísticas ou contexto sobre economia circular
- **Visual narrative**: "X toneladas/ano desperdiçadas" → "Y negócios já participam"

### Interação & Motion
- **Trigger**: Section enters viewport
- **Territory map**: Pins aparecem em cascata (stagger 80ms cada)
- **Value transformation**: Clip path reveal (left-to-right, 800ms)
- **Scroll provocation**: Horizontal snap scroll ou carousel (touch + scroll wheel)

---

## Seção 3: Produto em ação / Telefone sticky
**Altura**: 980px  
**Tipo de Interação**: Sticky scroll (telefone travado) + conteúdo revelado ao scroll

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Product Section Copy** | Frame | 430×? | Intro: "Veja o produto em ação" + contexto |
| **3D Phone Placeholder** | Frame | 360×760 | Mockup do telefone 3D (awaits Blender render ou 3D model) |
| **Sticky Note / Motion** | Note | 310×150 | Specs: sticky scroll container, intersection observer |

### Copy / Mensagem Chave
- **Headline**: "Produto em ação"
- **Subhead**: Contextualiza os 6 walkthrough abaixo

### Interação & Motion
- **Sticky scroll**: Telefone fica fixo enquanto viewport scroll passa pelas seções 03.0–03.5
- **Screen transition**: Cada nova seção (index → onboarding → home → map → report → tracking) muda a tela exibida no telefone
- **Phone screen content**: Espelha exatamente a UI do app (não é printscreen; é replícação visual em Pencil)
- ✅ **3D Phone**: Placeholder — aguarda render 3D (three.js/Blender)

---

## Seção 3.0: Motion Demo — Índice e fonte mobile
**Altura**: 680px  
**Tipo de Interação**: Reference table + visual landmark

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Motion Index Copy** | Frame | 500×? | Titulo: "Veja aqui cada etapa" + legenda |
| **Motion Source Table** | Frame | fill_container×? | Tabela de referência: ícone, nome, descrição de cada walkthrough |
| **Sticky Note / Motion Index** | Note | 320×170 | Specs: table layout, highlight on scroll (CSS :target ou data attrs) |

### Interação & Motion
- **Highlight sync**: Conforme telefone muda de tela (3.0→3.5), linha correspondente da tabela fica highlighted
- **Table design**: Usará componente Data Table do shadcn (ou Card layout em grid)

---

## Seção 3.1: Motion Demo — Entrada e onboarding do app
**Altura**: 760px  
**Tipo de Interação**: Scroll-reveal + phone screen update

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Motion Copy** | Frame | 570×? | "Login, registro, termos" — explica as 2–3 primeiras telas do app |
| **Motion Visual** | Frame | fill_container×? | Wireframe/mockup das telas: login form, signup form, terms modal |
| **Sticky Note / Motion Spec** | Note | 320×180 | Specs: fade in timing, input placeholder changes, "next" button progression |

### Interação & Motion
- **Trigger**: Section 3.1 enters viewport (sticky scroll offset)
- **Phone screen update**: Transição suave (fade out / fade in) mostrando: tela login → signup → termos
- **Form interaction hint**: Input placeholders ou labels aparecem em cascata (stagger)

---

## Seção 3.2: Motion Demo — Home como painel de ações
**Altura**: 760px  
**Tipo de Interação**: Tab/panel reveal + scroll-driven

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Motion Copy** | Frame | 570×? | "Seu painel de ações: pontos, denúncias, histórico" |
| **Motion Visual** | Frame | fill_container×? | Mockup da home: cards de ações, saldo de pontos, badges |
| **Sticky Note / Motion Spec** | Note | 320×180 | Specs: card appear timing, badge pulse, number counter animation |

### Interação & Motion
- **Trigger**: Section 3.2 enters viewport
- **Cards appear**: Stagger 120ms cada (recolher pontos, denunciar, histórico, etc.)
- **Number counter**: Saldo de pontos anima de 0 → valor final (2s, easeOut)
- **Badge pulse**: Badge de "notificações" tem pulso suave contínuo

---

## Seção 3.3: Motion Demo — Mapa e mercado de ecopontos
**Altura**: 980px  
**Tipo de Interação**: Detailed scroll beats + phone screen update

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Motion Copy** | Frame | 570×? | "Encontre ecopontos perto de você" + explica filtro/lista/detalhe |
| **Motion Visual** | Frame | fill_container×? | Mockup: mapa com pins, lista de locais, card de detalhe |
| **Sticky Note / Motion Spec** | Note | 320×180 | Specs: map tile load, pin cluster zoom, list scroll sync |
| **Detailed Scroll Beats** | Frame | 1248×220 | Breakdown textual: "1) Mapa carrega → 2) Filtro aparece → 3) Click pin → 4) Lista atualiza → 5) Detalhe expande" |
| **Sticky Note / Detailed Interaction** | Note | 340×170 | Specs profundas: velocidade de cada transição, easing, z-order |

### Copy / Mensagem Chave
- "Mapa participativo de coleta"
- Referências de confiança (n empresas, n pontos mapeados)

### Interação & Motion
- **Map load**: Tiles aparecem com fade+scale (mosaic pattern, 100ms stagger)
- **Filter reveal**: Slide up de baixo (300ms, cubic-bezier easing)
- **Pin interaction**: Tap → pin expande + infowindow, lista atualiza (200ms sync)
- **List scroll**: Conforme scroll vertical, pins no mapa ganham highlight outline
- **Detail expansion**: Card de detalhe cresce de baixo com parallax (content scrolls mais rápido que container)

---

## Seção 3.4: Motion Demo — Denúncia: mapa participativo → criar registro
**Altura**: 980px  
**Tipo de Interação**: Multi-step form reveal + phone screen update

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Motion Copy** | Frame | 570×? | "Denuncie resíduos irregulares em tempo real" |
| **Motion Visual** | Frame | fill_container×? | Mockup: mapa → tap local → foto + form → submit success |
| **Sticky Note / Motion Spec** | Note | 320×180 | Specs: camera access flow, form validation states |
| **Detailed Scroll Beats** | Frame | 1248×220 | "1) Mapa pronto → 2) Tap abre form → 3) Câmera captura foto → 4) Form preenche → 5) Validação → 6) Submit → Success modal" |
| **Sticky Note / Detailed Interaction** | Note | 340×170 | Specs: modal z-order, camera permission prompt, error states |

### Copy / Mensagem Chave
- "Sua denúncia ajuda a comunidade"
- Transparência (rastreamento de resolução)

### Interação & Motion
- **Form reveal**: Modal slides up com blur backdrop (250ms)
- **Camera intent**: Button "tirar foto" → simula camera access (visual only, no real camera)
- **Photo preview**: Imagem capturada aparece em carousel com delete/retake
- **Form validation**: Inline validation (red/green, 100ms after keyup)
- **Submit progression**: Button muda cor → loading spinner → success checkmark (600ms total)

---

## Seção 3.5: Motion Demo — Acompanhamento e resolução
**Altura**: 980px  
**Tipo de Interação**: Status timeline + notification simulation

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Motion Copy** | Frame | 570×? | "Acompanhe a resolução de sua denúncia" |
| **Motion Visual** | Frame | fill_container×? | Mockup: lista de denúncias, tap abre timeline de status |
| **Sticky Note / Motion Spec** | Note | 320×180 | Specs: timeline animation, status badge transitions |
| **Detailed Scroll Beats** | Frame | 1248×220 | "1) Lista de denúncias → 2) Tap item → 3) Timeline expande → 4) Status badges aparecem → 5) Resolução marca com check" |
| **Sticky Note / Detailed Interaction** | Note | 340×170 | Specs: timeline vertical layout, badge color mapping (pending/assigned/resolved) |

### Interação & Motion
- **List render**: Items aparecem em cascata (stagger 80ms)
- **Timeline expand**: Tap → modal com timeline vertical, badges appear staggered (100ms cada)
- **Status update simulation**: Badge resolve muda de gray → green com pulse (400ms)
- **Notification bell**: Simula entrada de nova denúncia (badge badge vermelho flickers)

---

## Seção 4: Públicos / Dois CTAs
**Altura**: 780px  
**Tipo de Interação**: Card hover/tap + CTA split

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Audience Header** | Frame | 760×? | "Desenvolvido para dois públicos" + contextualiza |
| **Audience Cards** | Frame | fill_container×? | 2 cards lado-a-lado: "Cidadão" (app mobile) + "Negócio" (dashboard web) |
| **Sticky Note / Motion** | Note | 310×150 | Specs: card enter animation, hover state, CTA click tracking |

### Copy / Mensagem Chave
- **Card 1 (Cidadão)**: 
  - Headline: "Participe ativamente"
  - Descrição: Pontue, denuncie, acompanhe
  - CTA: "Baixe o app" (link App Store + Play Store)
- **Card 2 (Negócio)**:
  - Headline: "Transforme sua cadeia"
  - Descrição: Integre coleta, aumente receita
  - CTA: "Solicite demo"

### Interação & Motion
- **Card enter**: Aparecem em cascata com slide-up (400ms stagger)
- **Card hover**: Slight lift (translateY -8px, box shadow expand, 200ms)
- **CTA buttons**: Glow subtle on hover, ripple on click

---

## Seção 5: Denúncia cidadã
**Altura**: 780px  
**Tipo de Interação**: Visual steps + icon/number progression

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Report Copy** | Frame | 560×? | "Como funciona uma denúncia" + 3–4 passos textuais |
| **Report Steps Visual** | Frame | 520×520 | Ilustração ou diagram: 4–5 steps circulares ou lineares, conectados |
| **Sticky Note / Motion** | Note | 310×150 | Specs: step by step reveal, icon animation, connector draw |

### Copy / Mensagem Chave
- Step 1: "Identifique o resíduo"
- Step 2: "Capture foto e localização"
- Step 3: "Envie denúncia"
- Step 4: "Acompanhe resolução"

### Interação & Motion
- **Steps appear**: Círculos + números aparecem em sequência (stagger 300ms, scale up)
- **Connectors draw**: Linhas entre steps desenham com stroke-dasharray animation (200ms cada)
- **Icons animate**: Ícone interno de cada step aparece após círculo (100ms delay)

---

## Seção 6: CTA final + Footer
**Altura**: 700px  
**Tipo de Interação**: CTA prominence + footer info

### Estrutura
| Elemento | Tipo | Dimensões | Propósito |
|----------|------|-----------|----------|
| **Final Headline** | Text | 820×? | "Comece agora" ou "Juntos transformamos resíduos" |
| **Final Actions** | Frame | ? × ? | 2–3 botões: "Baixar app", "Falar com time", "Ler blog" |
| **Footer** | Frame | fill_container×? | Links, redes sociais, legal (CNPJ, termos, privacy) |
| **Sticky Note / Motion** | Note | 310×150 | Specs: button entry animation, footer fade in, scroll-to-top affordance |

### Copy / Mensagem Chave
- **Headline**: Reforça valor único (circular economy at scale)
- **CTAs**: 
  - Primária: "Baixar app" (App Store + Play Store links)
  - Secundária: "Falar com time" (email/form)
  - Terciária: "Blog" (link externo)
- **Footer**: 
  - Oikos wordmark + year
  - Links: Sobre, Privacidade, Termos, Contato
  - Redes sociais: LinkedIn, Instagram, Twitter

### Interação & Motion
- **Headline appears**: Fade in + scale up (600ms, easeOut)
- **CTA buttons appear**: Staggered (200ms cada), scale from center
- **Footer fade in**: Após headline + CTAs (delayed entry, 300ms)
- **Scroll-to-top button** (affordance): Aparece se user scroll > 50% da página, click → smooth scroll to top (1s)

---

## Resumo de Técnicas de Motion Reutilizadas

| Técnica | Seções | Propósito |
|---------|--------|----------|
| **Fade in / Scale up** | 1, 2, 4, 6 | Entrada de elementos (reusável, 300–600ms) |
| **Stagger animation** | 2, 3, 4, 5, 6 | Múltiplos elementos em cascata (80–300ms delay) |
| **Sticky scroll** | 3 (parent) | Telefone travado enquanto conteúdo scroll (scroll-linked animation) |
| **Scroll-driven reveal** | 1, 2, 3.0–3.5 | Conteúdo aparece conforme scroll enters viewport |
| **Carousel / horizontal scroll** | 2 | Scroll provocation timeline |
| **Modal / overlay** | 3.4, 3.5 | Form reveal com backdrop blur |
| **Timeline step animation** | 3.5, 5 | Steps appear in sequence, connectors draw |
| **Hover lift** | 4 | Cards/buttons elevam on hover (subtle, 200ms) |
| **Number counter** | 3.2 | Value animates 0 → final (2s, easeOut) |
| **Icon pulse / looping** | 3.2 | Badge ou notification blinks continuamente |

---

## Status & Próximas Etapas

- [ ] **Validar copy com product/marketing** — Seções 1–6 têm placeholders de copy; confirmar mensagens finais
- [ ] **Renderizar ilustrações** — Hero (seção 1), Territory map (seção 2), Value transformation (seção 2)
- [ ] **Converter placeholders para 3D** — Phone 3D (seção 3, Blender → three.js export), Ecosystem 3D (seção 1)
- [ ] **Detalhar mobile responsiveness** — Sticky scroll telefone em mobile (reflow a 100vw), breakpoints CSS
- [ ] **Integrar com Next.js** — Exportar Pencil → HTML/Tailwind → injetar em `app/` router
- [ ] **Implementar intersection observers & scroll-linked animations** — Scroll triggers, sticky positioning, scroll snap
- [ ] **A/B testing prep** — Variações de CTA, headline, hero visual (via feature flags ou variants no Framer)

---

**Atualizado**: 2026-08-20  
**Próximo handoff**: Validação de copy + início de renders de assets estáticos
