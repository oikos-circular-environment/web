# Spec de Interação — Seção 03 Produto em ação (Sticky Scroll Phone)

**Altura total**: 980px (seção 3 container)  
**Tipos de Interação**: Sticky scroll container + phone screen state machine  
**Child sections**: 03.0–03.5 (motion demos stacked verticalmente dentro de scroll container)

---

## Visão Geral Técnica

**Sticky Scroll Pattern**: Telefone fica fixo (`position: fixed` ou `position: sticky`) enquanto conteúdo de texto ("Motion Copy") e "Detailed Scroll Beats" rolam atrás/através dele. Cada seção filha (03.0 → 03.5) dispara uma mudança visual na tela do telefone.

**State Machine**: 6 estados discretos, um por motion demo:
1. **03.0**: Index + font source (reference table)
2. **03.1**: Login / signup / terms screens
3. **03.2**: Home (action panel) with points counter
4. **03.3**: Map + collection points (filtro → lista → detalhe)
5. **03.4**: Reporting (map tap → photo → form → success)
6. **03.5**: Tracking (denúncia list → timeline → status update)

---

## Layout (Desktop – 1440px viewport)

```
┌─────────────────────────────────────────┐
│ Product Section Copy (left, 430px)      │  ← Scrolls normally
│                                         │
│ Text: "Veja o produto em ação..."      │
└─────────────────────────────────────────┘
             ↓ scroll

┌──────────────────────┬──────────────────┐
│ Motion 03.0 copy     │                  │
│ (scrolls)            │   3D PHONE       │  ← Sticky/fixed (right, 360×760)
├──────────────────────┤   ┌────────────┐ │
│ Detailed beats 03.0  │   │ Index +    │ │
│ (scrolls)            │   │ font info  │ │
├──────────────────────┤   ├────────────┤ │
│ Sticky note 03.0     │   │ [state 1]  │ │
│ (scrolls)            │   └────────────┘ │
│                      │                  │
├──────────────────────┤                  │
│ Motion 03.1 copy     │   [transition]   │
│ (scrolls)            │                  │
├──────────────────────┤   ┌────────────┐ │
│ Detailed beats 03.1  │   │ Login form │ │
│ (scrolls)            │   │ [state 2]  │ │
└──────────────────────┴───┤            ├─┘
                           └────────────┘
             ↓ (repeat for 03.2–03.5)
```

---

## Component: 3D Phone (Frame 360×760)

### Styling
- **Position**: x=760 (on desktop), sticky/fixed on scroll
- **Dimensions**: 360×760px (Apple iPhone 14 aspect ratio)
- **Visual**:
  - Background: Dark gradient or 3D phone bezel (rendered from Blender/3D model)
  - Border radius: Phone-shaped (top corners ~50px, subtle notch cutout via CSS path)
  - Shadow: Drop shadow to lift from background (offset 0, blur 60, color #00000040)
  - Screen area: Central 340×680px (accounting for phone bezels)
- **Content** (children):
  - Screen frame (340×680) with `clip: true`
  - Current state UI (replicas of app screens in Pencil components)

### States (Screen Content)

#### State 03.0: Index + Font Reference
- **Visual**: Table/list with 6 rows (one per motion demo)
- **Components**:
  - Header: "Ver cada etapa" + icon
  - Rows (repeating List Item instance):
    - Number circle (blue)
    - Title: "Índice e fonte mobile", "Entrada e onboarding", etc.
    - Tap affordance (arrow)
  - Highlight state: Current row has background highlight (blue tint)

#### State 03.1: Entrada e Onboarding
- **Visual**: 3 screen transitions (carousel-like within phone)
  1. **Login form**:
     - Input: Email/phone placeholder
     - Input: Password placeholder
     - Button: "Entrar"
  2. **Sign-up form** (swipes left into view):
     - Input: Name placeholder
     - Input: Email placeholder
     - Input: Password placeholder
     - Checkbox: "Aceito termos"
     - Button: "Criar conta"
  3. **Terms modal** (overlays):
     - Heading: "Termos de uso"
     - Body text: Lorem (clipped)
     - Button: "Aceitar"

- **Transitions**:
  - Between screens: Swipe left animation (200ms, cubic-bezier)
  - Modal fade in: 150ms, easeOut
  - Form labels appear: Stagger 80ms per field

#### State 03.2: Home (Painel de Ações)
- **Visual**:
  - Header: Profile badge + greeting "Oi, [Name]"
  - Cards (grid, 2 columns):
    1. "Pontuar": Balance display with large number (animating counter)
    2. "Denunciar": CTA card with icon
    3. "Histórico": Badge with notification count
    4. "Ecopontos": Map icon card
  - Footer: Soft divider + "Ver tudo"

- **Animations**:
  - Cards enter: Stagger 120ms, scale up + fade
  - Counter: Animate from 0 → final value (2s, easeOut, *only on first enter*)
  - Badge: Pulse continuously (1.5s loop, opacity 0.6 ↔ 1)

#### State 03.3: Mapa e Mercado de Ecopontos
- **Visual**:
  1. Map view (full screen):
     - Tiles load in mosaic (stagger animation)
     - Filter bar slides up from bottom
     - 5–6 pins clustered on map
  2. Tap pin → List view slides up:
     - Collection points list (3 items)
     - Each item has name, address, hours, rating
  3. Tap list item → Detail view expands:
     - Large card with full address, hours, contact, photo (placeholder)
     - "Enviar" CTA

- **Transitions**:
  - Map load: 100ms stagger per tile
  - Filter reveal: Slide up 300ms, ease-out
  - List slide up: 250ms from bottom
  - Detail expand: 300ms, parallax content scroll

#### State 03.4: Denúncia (Mapa Participativo → Form)
- **Visual**:
  1. Map ready (similar to 03.3 but ready for tap)
  2. Tap location → Form modal:
     - "Tipo de resíduo" dropdown
     - "Foto" button (tap → simulated camera UI)
     - Photo preview (portrait orientation)
     - "Delete" / "Retake" buttons
     - Form fields: Descrição (textarea), Contato (optional)
     - Validation states (red/green labels)
  3. Submit progression:
     - Button: Normal → Loading (spinner) → Success (checkmark)
     - Modal backdrop: Fade blur
     - Success modal: "Denúncia enviada! Número: #1234"

- **Transitions**:
  - Form modal fade in: 250ms, ease-out
  - Photo preview: Fade in 150ms after capture
  - Validation feedback: Instant (0ms) on keystroke, green check at 200ms
  - Submit: Button transforms to spinner (200ms), spinner rotates 2s, then checkmark (300ms)

#### State 03.5: Acompanhamento e Resolução
- **Visual**:
  1. List of reports:
     - Multiple items (4–5) with status badges
     - Badge colors: Gray (pending), Blue (assigned), Green (resolved)
  2. Tap item → Timeline modal:
     - "Denúncia #1234" header
     - Vertical timeline with 4–5 steps:
       - "Criada em 23 ago"
       - "Revisada pela Oikos"
       - "Atribuída a prefeitura"
       - "Resolução em andamento"
       - "Resolvida" (latest)
     - Status badge colors per step
  3. Simulated update: "Resolvida" step appears with pulse animation

- **Transitions**:
  - List items render: Stagger 80ms per item
  - Modal expand: Slide up 300ms
  - Timeline steps: Stagger 150ms (appear left-to-right, badge first, then line, then text)
  - Status update pulse: Notify user with badge glow (2s loop)

---

## Scroll Trigger Logic

**Implementation**: Intersection Observer + Scroll Position Calculation

```javascript
// Pseudo-code: Detect which motion section is in viewport
const motionSections = [
  { id: '03.0', ref: section030, state: 'index' },
  { id: '03.1', ref: section031, state: 'onboarding' },
  { id: '03.2', ref: section032, state: 'home' },
  { id: '03.3', ref: section033, state: 'map' },
  { id: '03.4', ref: section034, state: 'reporting' },
  { id: '03.5', ref: section035, state: 'tracking' },
];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const targetState = entry.target.dataset.phoneState;
      updatePhoneScreen(targetState); // Triggers state machine
    }
  });
}, { threshold: 0.5 }); // Trigger when 50% of section is visible

motionSections.forEach(section => {
  observer.observe(section.ref);
});
```

---

## Phone Screen State Transitions

**Timing**:
- **Fade out**: 150ms (opacity 1 → 0)
- **Content swap**: 0ms (instant, happen during fadeOut)
- **Fade in**: 200ms (opacity 0 → 1)
- **Total**: 350ms transition per state change

**Easing**: cubic-bezier(0.4, 0, 0.2, 1) (Material Design standard)

```javascript
async function updatePhoneScreen(newState) {
  if (currentState === newState) return; // No-op if already in state
  
  // Fade out current screen
  screenContent.style.opacity = '0';
  screenContent.style.transition = 'opacity 150ms cubic-bezier(...)';
  
  // Wait for fade
  await new Promise(r => setTimeout(r, 150));
  
  // Swap content
  screenContent.innerHTML = renderScreenContent(newState);
  screenContent.style.opacity = '0'; // Start invisible
  
  // Force reflow to trigger fade-in
  screenContent.offsetHeight;
  
  // Fade in new screen
  screenContent.style.opacity = '1';
  screenContent.style.transition = 'opacity 200ms cubic-bezier(...)';
  
  currentState = newState;
}
```

---

## Mobile Layout (< 768px)

- **Phone positioned**: No sticky; reflows to full width (100vw - padding)
- **Stack**: Copy on top, phone screen below (flex column)
- **Viewport**: Phone scales to 80vw width (max 360px), height auto-maintains aspect ratio
- **Scroll behavior**: Normal vertical scroll; phone state changes still trigger on intersection

---

## Performance Considerations

1. **Sticky positioning**: Use `position: sticky` (native) instead of JS `position: fixed` for better performance; support fallback to fixed if needed
2. **Screen redraws**: Batch DOM updates; avoid rapid re-renders
3. **Intersection Observer**: Throttled (threshold 0.5) to reduce callback frequency
4. **Animations**: Use CSS `transform` + `opacity` only (GPU-accelerated); avoid layout-triggering properties
5. **Lazy loading**: Phone screen states could be lazy-rendered (only render visible state + 1 ahead)

---

## Accessibility Notes

- **Focus management**: When modal opens (reporting form), trap focus within modal
- **Keyboard navigation**: Users can tab through visible form fields; screen reader announces state changes
- **Reduced motion**: Disable transitions if `prefers-reduced-motion` is set; snap to states instantly
- **Color contrast**: Status badge colors (gray, blue, green) must pass WCAG AA on phone screen background
- **Alt text**: Phone screen is presentational (showing UI mockup); if content is critical, provide text alternative below

---

## Assets Needed

1. **3D Phone model** (Blender render, PNG or 3D model for three.js)
   - Resolution: 2x (720×1520px for Retina display)
   - Bezel design: Align with current iOS/Android design language
2. **Screen mockup components** (Pencil instances or exported Figma components)
   - 6 state variants (03.0–03.5), each with placeholder content
   - Icon set for cards, badges, status
3. **Copy for each state** (finalized by product/marketing)

---

## Testing Checklist

- [ ] Scroll through motion sections; verify phone state updates correctly
- [ ] Test on mobile (< 768px); verify reflow and readability
- [ ] Test accessibility: Keyboard nav, screen reader announcement, color contrast
- [ ] Test performance: Scroll 60fps at least (use DevTools Performance profiler)
- [ ] Test reduced motion: Transitions disable, states snap
- [ ] Test keyboard focus: All interactive elements reachable via Tab
- [ ] Cross-browser: Chrome, Firefox, Safari (desktop + mobile)

---

**Last Updated**: 2026-08-20  
**Owner**: Frontend Engineering / Design System
