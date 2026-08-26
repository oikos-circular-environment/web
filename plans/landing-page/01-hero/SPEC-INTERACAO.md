# Spec de Interação — Seção 01 Hero / Ecossistema vivo

**Altura**: 920px  
**Tipo Principal**: Parallax scroll + static 3D reveal  
**Mobile behavior**: Full viewport, vertical stack (copy top, eco visual below, flex layout)

---

## Breakdown de Elementos

### 1. Atmospheric Gradient Base (Rectangle 1440×920)
- **Fill**: Linear gradient, rotation 180° (CCW)
  - `#1B3A28` @ 0% (dark forest green, top)
  - `#2D5E3A` @ 52% (mid forest green)
  - `#E6E0C9` @ 100% (light beige, bottom)
- **Purpose**: Atmospheric backdrop, suggests sky → land transition
- **Motion**: Static (no animation), but parallax parent can apply `background-attachment: fixed` in CSS for subtle effect

---

### 2. Glass Nav / Shadcn Shell (Frame 1312×72)
- **Position**: Fixed/sticky top, x=64, y=36 (padded from edges)
- **Styling**:
  - Fill: `#FAF9F4CC` (off-white with 80% opacity)
  - Corner radius: 999px (fully rounded)
  - Stroke: `#FFFFFF80` (white, 50% opacity)
  - Stroke width: 1px
  - **Effect**: Background blur, radius 18px (glassmorphism)
- **Layout**: Horizontal (gap 34px, padding [16, 20])
  - Children: Wordmark (OIKOS, 30px) + Nav Links (horizontal frame)
- **Motion**:
  - **Sticky behavior**: Position fixed on scroll
  - **Blur intensity on scroll**: As scroll depth increases, blur radius → 24px (CSS `calc(18px + scrollY * 0.01)` pattern)
  - **Background opacity**: Slight increase on scroll (0.8 → 0.95) to strengthen contrast as more content scrolls behind
  - **Timing**: Instant (no delay), linear progression

---

### 3. Hero Copy (Frame 640×?, horizontal positioned x=96, y=212)
- **Layout**: Vertical (gap 22px)
- **Children** (estimated):
  - **Headline** (Text, ~60px height, large font)
    - Content: "Transformar resíduo em recurso" or variant
    - Font: Heading family, bold, ~36–48px
    - Fill: `$text-primary` (dark on light)
    - Motion: Fade in + slide up (300ms, cubic-bezier(0.34, 1.56, 0.64, 1) easeOutBack)
  - **Subheadline** (Text, ~80px height)
    - Content: 2–3 sentences contextualizing problem + solution
    - Font: Body family, regular, ~16–18px
    - Fill: `$text-secondary` (gray, lower contrast)
    - Motion: Fade in + slide up (300ms delay + 300ms duration, same easing)
  - **CTA Button** (Instance of Button/Default or Button/Large/Default)
    - Label: "Começar", "Explorar", or "Saiba mais"
    - Motion: Scale from 0.9 → 1 (300ms delay + 400ms duration, easeOut)
    - Hover: Slight glow, lifted shadow
    - Click: Ripple or scale down 0.95 briefly
- **Overall container motion**:
  - **Trigger**: Intersection observer, starts when top of section enters viewport
  - **Fade**: 0 → 1 opacity (300ms, linear)
  - **Slide**: translateY 40px → 0 (300ms, easeOut)

---

### 4. Full Bleed Isometric Ecosystem (Frame 560×560, x=760, y=178)
- **Styling**:
  - Fill: `#E9E3D3` (light beige placeholder)
  - Corner radius: 36px
  - Stroke: `#FFFFFF66` (white, 40% opacity)
  - Stroke width: 1px
  - **Effects**:
    - Shadow: Outer, offset (0, 32), blur 70, color `#00000033` (soft dark shadow)
    - Background blur: 8px (subtle frosted glass effect)
- **Content** (awaits rendering):
  - Isometric ecosystem illustration (diorama style)
  - 3 zones: City (top-left), Ecoponto/Collection Hub (center), Nature (bottom-right)
  - Floating/layered 2D sprites or 3D low-poly render
  - Palette: Limited, pulled from `$lp-*` design tokens
  - Day/night theme support: Two variants (light eco / dark eco)
- **Motion**:
  - **Parallax scroll**: As user scrolls section 1 (0→920px), eco visual parallax offset by scroll depth × 0.3
    - Example: If page scroll = 100px within section, image translateY = -30px (slight upward movement, depth effect)
  - **Fade in**: Starts at opacity 0, animate to 1 (400ms, easeOut)
  - **Scale in**: Starts at scale 0.95, animate to 1 (400ms, easeOut, simultaneous with fade)
  - **Parallax duration**: Full section height (920px scroll = max parallax effect)
  - **Mobile**: No parallax; just fade in. Full width within container.

---

### 5. Sticky Note / Motion (Note 310×150, x=1040, y=690)
**Content** (text; read directly from Pencil):
- Specs for animation: stagger timing, fade durations, parallax factor
- Easing preferences: cubic-bezier values or named (easeOut, easeInOut, etc.)
- Mobile affordance: Touch scroll smoothness, parallax disable flag

---

## Motion Timeline (User Scrolls Section 1)

```
Scroll Position (0–920px)
├─ 0px (top of section)
│  ├─ Nav: blur 18px, opacity 0.8
│  ├─ Copy: opacity 0, translateY +40px
│  ├─ Eco visual: opacity 0, scale 0.95, translateY 0
│
├─ 200px (midway)
│  ├─ Nav: blur 20px, opacity 0.87 (interpolating)
│  ├─ Copy: opacity 1, translateY 0 (animation done at 300ms / ~100px scroll)
│  ├─ Eco visual: opacity 1, scale 1, translateY -60px (parallax active, 200 × 0.3)
│
└─ 920px (bottom of section)
   ├─ Nav: blur 26px (capped), opacity 0.95
   ├─ Copy: fully visible, static
   ├─ Eco visual: opacity 1, scale 1, translateY -276px (920 × 0.3, max depth)
```

---

## CSS / JS Implementation Notes

### Intersection Observer (Fade/Scale Entry)
```javascript
// Pseudo-code
const heroCopy = document.querySelector('[data-hero-copy]');
const ecoVisual = document.querySelector('[data-eco-visual]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in'); // triggers CSS animation
    }
  });
}, { threshold: 0.1 });

observer.observe(heroCopy);
observer.observe(ecoVisual);
```

### Scroll-Linked Parallax (RequestAnimationFrame)
```javascript
// Parallax factor: 0.3 (eco visual moves slower than scroll)
function updateParallax() {
  const scrollY = window.scrollY;
  const sectionTop = section1.getBoundingClientRect().top + window.scrollY;
  const scrollWithinSection = scrollY - sectionTop;
  
  if (scrollWithinSection >= 0 && scrollWithinSection <= 920) {
    const parallaxOffset = scrollWithinSection * -0.3;
    ecoVisual.style.transform = `translateY(${parallaxOffset}px)`;
  }
}

window.addEventListener('scroll', updateParallax, { passive: true });
```

### Sticky Nav (Blur + Opacity Progression)
```javascript
function updateNavOnScroll() {
  const scrollY = window.scrollY;
  const blurAmount = Math.min(26, 18 + scrollY * 0.01); // starts 18, caps at 26
  const opacity = Math.min(0.95, 0.8 + scrollY * 0.0001);
  
  navBar.style.backdropFilter = `blur(${blurAmount}px)`;
  navBar.style.backgroundColor = `rgba(250, 249, 244, ${opacity})`;
}

window.addEventListener('scroll', updateNavOnScroll, { passive: true });
```

### CSS Animations (Entry)
```css
@keyframes fadeUpSlide {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-copy {
  animation: fadeUpSlide 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.eco-visual {
  animation: fadeUpScale 400ms ease-out forwards;
}

@keyframes fadeUpScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## Accessibility & Mobile Considerations

- **Parallax disable on mobile**: Media query `(prefers-reduced-motion)` → disable parallax, keep fade in
- **Touch scroll**: Use `{ passive: true }` on scroll listeners to avoid jank
- **Nav accessibility**: Ensure nav links have sufficient contrast even with glass effect; fallback to solid bg if CSS backdrop-filter not supported
- **Keyboard navigation**: Focus states on CTA button (visible focus ring, 2–4px outline)
- **Screen readers**: Landmark roles (nav, main), alt text for eco visual illustration

---

## Assets Needed

1. **Isometric ecosystem illustration** (560×560px, PNG/SVG with transparency)
   - Requested: 2 variants (light theme, dark theme)
   - Resolution: 2x for Retina (1120×1120px source, 560×560px display)
2. **Design tokens** (colors, fonts, shadows exported from design system)
3. **Copy finalization** (headline, subhead, CTA label from marketing/product)

---

**Last Updated**: 2026-08-20  
**Owner**: Design System / Product
