# Índice Técnico — Landing Page Oikos (Pencil Prototype → Next.js)

**Projeto**: Criar Landing Page  
**Issue**: #63  
**Branch**: `63-criar-landing-page`  
**Status**: Prototipagem avançada (copy + motion specs finalizando)  
**Data**: 2026-08-20

---

## Documentação Estruturada

### Nível 1: Planejamento Geral
- **[PLANEJAMENTO-PENCIL.md](./PLANEJAMENTO-PENCIL.md)** — Visão de 30,000ft: 6 seções, 12 subsections, técnicas de motion reutilizadas, próximas etapas

### Nível 2: Specs Técnicos por Seção

| Seção | Arquivo | Interações Chave | Status |
|-------|---------|------------------|--------|
| **01 Hero** | [`01-hero/SPEC-INTERACAO.md`](./01-hero/SPEC-INTERACAO.md) | Parallax scroll, sticky nav, fade-in, glassmorphism | ✅ Documentado |
| **02 Provocação** | `02-problema/SPEC-INTERACAO.md` *(a criar)* | Scroll reveal, stagger animation, carousel horizontal | 📋 Planejado |
| **03 Produto em Ação (Sticky Scroll)** | [`03-produto-em-acao/SPEC-STICKY-SCROLL-PHONE.md`](./03-produto-em-acao/SPEC-STICKY-SCROLL-PHONE.md) | State machine (6 states), intersection observer, modal reveal | ✅ Documentado |
| **03.0–03.5 Motion Demos** | *Detalhado em SPEC-STICKY-SCROLL-PHONE.md* | Voir section acima | ✅ Documentado |
| **04 Públicos** | `04-publicos/SPEC-INTERACAO.md` *(a criar)* | Card hover lift, stagger entry, CTA ripple | 📋 Planejado |
| **05 Denúncia cidadã** | `05-denuncia/SPEC-INTERACAO.md` *(a criar)* | Step animation, connector draw (SVG stroke-dasharray), icon pulse | 📋 Planejado |
| **06 CTA Final + Footer** | `06-cta-final/SPEC-INTERACAO.md` *(a criar)* | Button entry stagger, scroll-to-top affordance, footer fade in | 📋 Planejado |

---

## Guia de Leitura Rápida (por Role)

### 👨‍💼 Product Manager / Designer
1. Comece com **[PLANEJAMENTO-PENCIL.md](./PLANEJAMENTO-PENCIL.md)** para entender fluxo geral
2. Leia resumo de cada seção: "Copy / Mensagem Chave" + "Interação & Motion"
3. Navegue para spec técnico da seção se precisar aprovar detalhe de timing/easing

### 👨‍💻 Frontend Engineer
1. Leia **[PLANEJAMENTO-PENCIL.md](./PLANEJAMENTO-PENCIL.md)** seção "Resumo de Técnicas de Motion Reutilizadas"
2. Mergulhe em specs técnicos por seção (ordem: 01-hero, 03-produto-em-acao são mais complexas)
3. Extraia code snippets (Intersection Observer, RequestAnimationFrame, CSS animations) de cada spec
4. Implemente em Next.js usando Framer Motion, Tailwind CSS, custom hooks para scroll triggers

### 🎨 Motion / Animation Designer
1. Leia **[01-hero/SPEC-INTERACAO.md](./01-hero/SPEC-INTERACAO.md)** — Motion timeline, parallax math
2. Leia **[03-produto-em-acao/SPEC-STICKY-SCROLL-PHONE.md](./03-produto-em-acao/SPEC-STICKY-SCROLL-PHONE.md)** — State transitions, timing curves
3. Translate timing + easing specs into Figma prototypes (Protopie) ou After Effects presets
4. Validate with frontend engineer antes de dev

---

## Técnicas de Motion Mapeadas

### Parallax Scroll
- **Seções**: 01 (hero ecosystem), 02 (territory map, value visual)
- **Padrão**: `translateY(scrollDepth * -0.3)` (element moves slower than scroll)
- **Performance**: Use `transform` + `opacity` only; RAF throttle
- **Fallback**: Disable on `prefers-reduced-motion`
- **Exemplo code**: Ver [01-hero/SPEC-INTERACAO.md](./01-hero/SPEC-INTERACAO.md#scroll-linked-parallax-requestanimationframe)

### Sticky Scroll Container
- **Seção**: 03 (product demo phone)
- **Padrão**: Phone fixed; child sections scroll behind; state updates via IntersectionObserver
- **Performance**: Use CSS `position: sticky` native; JS fallback if needed
- **Mobile**: Reflow to full width, no sticky (scroll normally)
- **Exemplo code**: Ver [03-produto-em-acao/SPEC-STICKY-SCROLL-PHONE.md](./03-produto-em-acao/SPEC-STICKY-SCROLL-PHONE.md#scroll-trigger-logic)

### Fade In + Slide Up (Entry Animation)
- **Seções**: 1, 2, 4, 6 (general entry pattern)
- **Padrão**: Combine `opacity: 0→1` + `translateY: 40px→0`
- **Timing**: 300ms, easing `cubic-bezier(0.34, 1.56, 0.64, 1)` (easeOutBack for spring feel)
- **Trigger**: IntersectionObserver `threshold: 0.1`
- **Fallback**: CSS keyframes + `.animate-in` class toggle

### Stagger Animation (Cascading Entry)
- **Seções**: 2, 3, 4, 5, 6 (multiple elements)
- **Padrão**: Each child delayed by N ms (80–300ms depending on count)
- **Timing**: `nth-child(n) { animation-delay: n * 80ms; }`
- **Performance**: Use CSS animation for best perf; JS fallback for complex triggers

### Modal / Overlay Reveal
- **Seções**: 3.4 (reporting form), possibly others
- **Padrão**: Backdrop blur fade in + modal slide up
- **Timing**: Backdrop 250ms fade, modal 300ms slide from bottom
- **A11y**: Focus trap, escape to close, aria-modal, aria-labelledby

### Number Counter Animation
- **Seção**: 3.2 (points balance)
- **Padrão**: Counter from 0 → final value using RAF + easing function
- **Timing**: 2s, easeOut
- **Fallback**: If JS disabled, show final value statically

### Step Animation + Connector Draw
- **Seções**: 5 (denúncia steps)
- **Padrão**: Steps appear staggered; connector lines draw via SVG `stroke-dasharray` animation
- **Timing**: 300ms stagger per step, 200ms per line draw
- **SVG pattern**: `stroke-dasharray: <length>; stroke-dashoffset: <length>→0`

### Hover Lift + Ripple (Interactive Affordance)
- **Seções**: 4 (audience cards), 6 (CTA buttons)
- **Padrão**: Card/button translateY(-8px) + shadow expand on hover; ripple effect on click
- **Timing**: 200ms hover, 400ms ripple
- **A11y**: Ensure focus state visible + distinct from hover

---

## Fluxo de Implementação Recomendado

### Fase 1: Setup Estrutural (Week 1)
- [ ] Export Pencil prototypes → HTML/Tailwind (via Pencil export tool)
- [ ] Setup Next.js page structure (`app/landing-page/` route)
- [ ] Configure Tailwind CSS + custom motion plugins (Framer Motion)
- [ ] Setup design tokens (colors, fonts, spacing) as CSS variables
- [ ] Define reusable motion hooks (useIntersectionObserver, useScrollParallax, etc.)

### Fase 2: Seções Estáticas (Week 2)
- [ ] Implement seções 01, 02, 04, 05, 06 (layout + typography + hover states)
- [ ] Add CSS animations (fade-in, stagger, step reveal)
- [ ] Test on desktop + mobile (responsive breakpoints)

### Fase 3: Interações Complexas (Week 3)
- [ ] Implement parallax scroll (01, 02)
- [ ] Implement sticky scroll phone (03)
- [ ] Implement scroll-triggered state machine (03.0–03.5)
- [ ] Test performance (60fps target)

### Fase 4: Polish & Optimization (Week 4)
- [ ] Refine motion timing (validate with motion designer)
- [ ] Add accessibility features (focus management, reduced-motion, screen readers)
- [ ] Optimize images (lazy loading, responsive srcset, WebP fallback)
- [ ] A/B testing setup (feature flags for CTA variations)
- [ ] SEO metadata, Open Graph tags, analytics events

### Fase 5: Handoff & Deploy (Week 5)
- [ ] Framer export → production deployment
- [ ] Monitor Core Web Vitals (LCP, FID, CLS)
- [ ] Iterate on user feedback

---

## Stack Técnico Decidido

### Tooling
- **Canvas prototyping**: Pencil (current) → Can export to HTML/Tailwind
- **Production framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 + CSS custom properties (design tokens)
- **Motion library**: Framer Motion (React components) ou Spring Web API nativa
- **3D rendering** (seções 01, 03): Three.js + react-three-fiber (ou Babylon.js fallback)
- **Data visualization** (seção 02): D3.js ou Plotly (territory map, connector lines)
- **Version control**: Git (branch `63-criar-landing-page`)

### Browser Support
- Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
- Mobile: iOS 15+, Android 12+
- Fallback: Graceful degradation for older browsers (no parallax, no CSS backdrop-filter, static content)

---

## Dependências de Assets

| Asset | Status | Owner | Deadline |
|-------|--------|-------|----------|
| **Hero ecosystem illustration** (560×560px, 2x) | 🔴 Pending | Design | TBD |
| **Territory map visual** (520×440px) | 🔴 Pending | Design | TBD |
| **Value transformation visual** (520×350px) | 🔴 Pending | Design | TBD |
| **3D phone model** (Blender export) | 🔴 Pending | 3D/Motion | TBD |
| **Copy finalization** (all sections) | 🟡 In progress | Product/Marketing | TBD |
| **Design tokens export** (colors, fonts, shadows) | 🟢 Ready | Design System | - |
| **Pencil design file** (web.pen) | 🟢 Ready | Designer | - |

---

## Decision Log (Open Questions)

### 1. **Framer as final build target vs. Next.js**
- **Current assumption**: Framer is prototyping validation tool; final build in Next.js
- **Confirmation needed**: Explicitly decide if Framer becomes production home or if exported to Next.js
- **Impact**: Stack, deployment, maintenance, design-dev sync

### 2. **Hero visual: 3D interactive vs. 2D isometric sprites**
- **Current status**: Decision open (Option A: full 3D Blender render, Option B: 2D layered sprites)
- **Trade-off**: A = relighting for day/night free but expensive; B = cheaper but static
- **Confirmation needed**: Decide based on perf budget + design aesthetic preference

### 3. **Sticky scroll phone: Native CSS `position: sticky` vs. JS `position: fixed` fallback**
- **Current assumption**: Prefer native CSS sticky; JS fallback for older browsers
- **Confirmation needed**: Test on iOS Safari (sticky can behave unexpectedly)
- **Fallback**: Full JS implementation ready if native doesn't work

### 4. **Mobile parallax: Disable or simplify**
- **Current assumption**: Disable parallax entirely on mobile (< 768px)
- **Alternative**: Simplify to subtle fade without transform (cheaper parallax lite)
- **Confirmation needed**: A/B test scroll feel with stakeholders

### 5. **Phone screen state transitions: Fade-out/fade-in vs. Swipe/slide**
- **Current assumption**: Fade (350ms) for most state changes
- **Alternative**: Directional swipe (left/right) for specific transitions (e.g., login → signup)
- **Confirmation needed**: Motion designer approval + UX feedback

---

## Métricas de Sucesso

### Performance
- [ ] **LCP** (Largest Contentful Paint): < 2.5s (target: < 1.8s)
- [ ] **FID** (First Input Delay): < 100ms (target: < 50ms)
- [ ] **CLS** (Cumulative Layout Shift): < 0.1 (target: < 0.05)
- [ ] **Scroll FPS**: 60fps sustained (measure with DevTools Performance tab)

### User Engagement
- [ ] **Scroll depth**: 75%+ users scroll to section 3+
- [ ] **CTA click-through**: 8%+ for "Baixar app", 3%+ for "Falar com time"
- [ ] **Mobile conversion**: 70%+ of desktop rate (normalized for traffic)

### Accessibility
- [ ] **WCAG 2.1 AA compliance**: All sections pass automated + manual audit
- [ ] **Lighthouse Accessibility**: 90+ score
- [ ] **Screen reader**: All interactive elements announced correctly

### Design Fidelity
- [ ] **Pencil → Production diff**: < 5% visual variance (motion timing, colors, spacing)
- [ ] **Design System alignment**: 100% of components are instances or variants from design system

---

## Contatos & Proprietários

| Role | Contact | Scope |
|------|---------|-------|
| Product Manager | - | Copy, messaging, CTA strategy |
| Designer | Christian Cesar | Pencil prototype, visual design, motion design |
| Frontend Engineer | - | Implementation, performance, accessibility |
| Motion/Animation Designer | - | Timing curves, easing, annotation in Figma/Protopie |
| 3D Artist | - | Phone model, ecosystem illustration (Blender) |
| DevOps/Deploy | - | Next.js build, Vercel deploy, monitoring |

---

## Links Úteis

- **Pencil file**: `/media/ccrs/development/oikos/web/pencil/web.pen`
- **Planning directory**: `/media/ccrs/development/oikos/web/plans/landing-page/`
- **GitHub issue**: #63 (Criar landing page)
- **Next.js repo**: `/media/ccrs/development/oikos/web/` (App Router)
- **Design system**: shadcn/ui components (Pencil instances)
- **Figma** (if applicable): [Link TBD]

---

**Last Updated**: 2026-08-20  
**Maintained by**: Design System / Product
