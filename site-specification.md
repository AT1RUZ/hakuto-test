# Site Specification

## Configuration
- **Site Type**: General (seguros / protección de salud)
- **Target Audience**: Personas y familias que buscan cobertura clara, premium y sin fricción
- **Primary Goal**: Conversión al cotizador (lead → plan recomendado)
- **Tone**: Preciso, serio, premium — sin calidez infantil ni “alegre”

## Design Direction
- **Direction**: "Escudo Cinético" — Dark Premium Insurance con un escudo orgánico como hilo narrativo
- **Base Language**: Technology + Editorial dark
- **Dials**: VARIANCE 7 · MOTION 9 · DENSITY 5
- **Palette** (60/30/10): dominant #050505 · secondary #121212 · accents status #00E676 (protegido) / #FFB300 (atención)
- **Fonts**: Instrument Serif (display) / Outfit (UI) / JetBrains Mono (datos) — Astro Fonts API
- **Signature patterns**: Morphing organic shield blob; horizontal pin-scrub comparator; 3D coverage cards
- **Motion recipes**: Preloader calibration → SplitText hero assemble → ScrollTrigger morph → Lenis+GSAP single rAF

### Contrast
- foreground on background ≈ 18:1 (pass)
- protected (#00E676) on #050505 ≈ 10:1 (pass)
- attention (#FFB300) on #050505 ≈ 9:1 (pass)

## Design Evolution
- **User customizations**: Brief completo del usuario (2026-10-27) — dirección bloqueada sin preview gate
- **Current style**: Negro profundo, tipografía editorial + geométrica, acentos de estado, escudo líquido como contenedor narrativo

## Project Plan
- [x] index.css (theme tokens Dark Premium)
- [x] Layout.astro + site.ts + fonts
- [x] Header / Footer
- [x] Preloader
- [x] Hero
- [x] Cotizador (multi-step)
- [x] Resultados (cartas 3D)
- [x] Comparador horizontal pin
- [x] Muro de confianza
- [x] FAQ morph accordion
- [x] CTA final magnético
- [x] branding.astro
- [x] public/llms.txt
- [x] Deploy Vercel
