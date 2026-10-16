# Zignal Nexora — Semi-Minimalist Spatial Landing Page (`/antigravity-design-expert`)

## Resumen de Diseño
- **Estilo visual:** Semi-minimalista, ejecutivo y limpio, enfocado en gerentes comerciales y tomadores de decisiones en PyMEs.
- **Principios `/antigravity-design-expert` aplicados:**
  - **Profundidad espacial sin peso (*Weightless Spatial Depth*):** Tarjetas translúcidas con `backdrop-filter: blur(12px)`, bordes sutiles de `1px` y sombras difusas suaves (`0 20px 40px rgba(15, 23, 42, 0.05)`).
  - **Arquitectura 3D CSS Isométrica en el Hero (`#iso-stack`):** Tres planos de cristal superpuestos en el eje Z (`01 · Impacto Comercial`, `02 · Orquestación Zignal Nexora Core`, `03 · Infraestructura / Red Privada`) con inclinación suave al pasar el cursor en escritorio.
  - **Ciclo interactivo de scroll en tarjetas del Hero:** Al hacer scroll sobre las tarjetas, la tarjeta superior desciende al fondo en un arco tridimensional (`01` -> `02` -> `03`). Al alcanzarse nuevamente la tarjeta inicial (`01`), la página se desplaza suavemente a la siguiente sección (`#enfoque`).
  - **Animaciones mesuradas y con propósito:** Entradas suaves mediante GSAP + ScrollTrigger (`once: true`, sin bucles distractores, sin canvas de partículas ni popups artificiales) y soporte completo para `prefers-reduced-motion: reduce`.
- **Elementos conservados de `zignalnexora.com`:**
  1. **Logo oficial (`#zn-mark`)**
  2. **Los 5 servicios:**
     - *Automatización de procesos* (`Process Automation`)
     - *Dashboards de métricas* (`Metrics Dashboards`)
     - *Bots de WhatsApp* (`WhatsApp Bots`)
     - *Plataforma multicanal* (`Multichannel Platform` — *En desarrollo*)
     - *Analítica on-premises* (`On-premises Analytics`)
  3. Soporte bilingüe (`ES` / `EN`), modo claro/oscuro (`light` por defecto) y formulario de contacto funcional conectado a Formspree.
