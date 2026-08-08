# Plan: Sitio Web Zignal Nexora

## Brief consolidado

| Aspecto | Definición |
|---|---|
| **Empresa** | Zignal Nexora (empresa de desarrollo de sistemas) |
| **Productos** | 5 servicios principales (ver abajo) |
| **Idioma** | Bilingüe: español por defecto, toggle a inglés |
| **Estructura** | Landing page de conversión (one-page scroll) |
| **Estilo visual** | Dark/light con toggle, dark por defecto |
| **Paleta** | Confiabilidad + innovación: azul profundo + acento cian/violeta |
| **Base de diseño** | Sistema de Linear (dark-first, enterprise, tech confiable) |
| **Entrega** | `index.html` autocontenido (CSS+JS embebidos, sin dependencias externas excepto Google Fonts) |

## Los 5 productos

1. **Automatización de flujos de procesos** — orquestación de workflows, eliminación de tareas manuales repetitivas
2. **Dashboards de métricas** — visualización en tiempo real, KPIs, data-dense, monitoring
3. **Bots de WhatsApp** — automatización conversacional, atención 24/7, integración con APIs
4. **Plataforma omnicanal** — integración de bandejas de atención (WhatsApp, email, chat web, telefónica) en una sola bandeja unificada
5. **Analítica de datos on-premises** — BI local sin enviar datos a la nube, privacidad total, despliegue en infraestructura propia

---

## Arquitectura del archivo

```
zignal-site/
├── index.html          # Todo el sitio en un solo archivo
│   ├── <head>          # Meta tags, Google Fonts (Inter + JetBrains Mono), todos los CSS en <style>
│   ├── <body>          # Estructura semántica completa
│   └── <script>        # JS embebido: theme toggle, lang toggle, form handler, smooth scroll
└── (sin más archivos — 100% autocontenido)
```

---

## Estructura del HTML (secciones en orden)

### 1. Navbar (sticky, colapsa en mobile)
- **Logo:** "Zignal Nexora" en texto con un SVG mark prefijado (zípero/diamante geométrico en azul-cian)
- **Links de navegación:** Productos · Cómo funciona · Contacto (con `data-es` / `data-en` para i18n)
- **Toggle de tema:** 🌙/☀️ (persiste en localStorage)
- **Toggle de idioma:** ES | EN (persiste en localStorage)
- **CTA primario:** "Agendar demo" / "Book a demo" → scroll al lead form

### 2. Hero (superficie: Decide/Learn)
- **Headline:** 56-64px, Inter weight 510, letter-spacing negativo, `#f7f8f8` (dark) / `#0a0a0a` (light)
  - ES: "Software que automatiza, conecta y analiza. Sin fricción."
  - EN: "Software that automates, connects, and analyzes. Without friction."
- **Subheadline:** 18px, `#8a8f98` (dark) / `#525252` (light), una sola línea describiendo propuesta de valor
- **CTAs:** Botón primario (brand indigo `#5e6ad2`) "Agendar demo" + botón ghost "Ver productos"
- **Sin imagen hero** — composición tipográfica pura con glow sutil del accent detrás del headline (radial-gradient muy sutil). Decision deliberada: evita el "stock-photo hero" del anti-slop checklist.
- **Badges de confianza:** fila de pills pequeñas: "On-premises" · "API-first" · "WhatsApp Business" · "24/7"

### 3. Sección "Qué hacemos" / "What we do" (Decide/Learn)
- **Layout:** NO grid de 3 tarjetas iguales (anti-slop). Usar un layout asimétrico:
  - Columna izquierda (40%): título de sección + descripción párrafo
  - Columna derecha (60%): 5 ítems en lista vertical con tamaño decreciente (jerarquía visual, no parity)
- Cada producto:
  - **Ícono SVG** custom (no emoji, no icon library genérica) — 24px, trazo 1.5px, color accent
  - **Título** 20px weight 590
  - **Descripción** 15px weight 400, `#8a8f98`
  - **Tag pequeño** mono: ej. "API", "On-prem", "Cloud"
- Los 5 productos con copy bilingüe:

| # | Producto (ES) | Producto (EN) | Descripción (ES) | Descripción (EN) |
|---|---|---|---|---|
| 1 | Automatización de procesos | Process Automation | Orquesta workflows de principio a fin. Elimina tareas manuales repetitivas y reduce errores operativos. | Orchestrate workflows end-to-end. Eliminate repetitive manual tasks and reduce operational errors. |
| 2 | Dashboards de métricas | Metrics Dashboards | Visualiza KPIs en tiempo real. Monitoreo de operaciones con datos densos y accionables. | Visualize KPIs in real-time. Operational monitoring with dense, actionable data. |
| 3 | Bots de WhatsApp | WhatsApp Bots | Atención conversacional 24/7. Responde, deriva y transacciona directamente en WhatsApp Business. | 24/7 conversational support. Respond, route, and transact directly on WhatsApp Business. |
| 4 | Plataforma omnicanal | Omnichannel Platform | Una sola bandeja para WhatsApp, email, chat web y voz. Tus agentes responden desde un único lugar. | One unified inbox for WhatsApp, email, web chat, and voice. Your agents respond from one place. |
| 5 | Analítica on-premises | On-premises Analytics | Business intelligence en tu infraestructura. Tus datos nunca salen de tu red. Privacidad por diseño. | Business intelligence on your infrastructure. Your data never leaves your network. Privacy by design. |

### 4. Sección "Cómo funciona" / "How it works" (Decide/Learn)
- 3 pasos numerados en layout horizontal (no tarjetas):
  1. **Diagnosticamos** / **We diagnose** — Mapeamos tus procesos manuales y cuellos de botella
  2. **Diseñamos e integramos** / **We design and integrate** — Construimos la solución sobre tu infraestructura actual
  3. **Automatizamos y medimos** / **We automate and measure** — Despliegue, monitoreo y optimización continua
- Conectados con una línea sutil horizontal (border-top `rgba(255,255,255,0.05)`)

### 5. CTA intermedio
- Banda con fondo accent sutil (`rgba(94,106,210,0.04)`)
- Texto: "¿Listo para automatizar tu operación?" / "Ready to automate your operations?"
- Botón: "Hablar con un experto" / "Talk to an expert"

### 6. Lead Form (Configuración — progressive disclosure, baja decoración)
- Título: "Agenda una demo" / "Book a demo"
- Campos:
  - Nombre (requerido)
  - Email corporativo (requerido, validación)
  - Empresa (requerido)
  - Teléfono (opcional)
  - Mensaje / ¿Qué proceso quieres automatizar? (textarea opcional)
- Select: "¿Qué producto te interesa?" (multiple optgroup con los 5 productos + "Todos")
- **Botón submit:** "Enviar solicitud" / "Send request"
- **Handler:** `fetch` a Formspree (placeholder: `https://formspree.io/f/TU-ID`) con fallback a `mailto:`. Si no hay Formspree configurado, el form hace `mailto:hola@zignalnexora.com` con el body prellenado.
- Estado de éxito: mensaje inline verde-ish (`#27a644` accent) "Gracias, te contactaremos en 24h"
- Estado de error: mensaje inline rojo

### 7. Footer
- Columna 1: Logo + tagline breve
- Columna 2: Productos (links a #productos con anchor)
- Columna 3: Empresa (Sobre nosotros, Casos de éxito — placeholders con `#`)
- Columna 4: Contacto (email, teléfono, ubicación)
- Fila inferior: copyright + links legales (placeholder)
- Un Switch TINY Toggles: theme | ES/EN

---

## Sistema de diseño (especificación para el modelo que ejecute)

### Variables CSS (dark por defecto, `[data-theme="light"]` override)

```css
:root {
  /* === Dark theme (default) === */
  --bg-canvas:      #08090a;
  --bg-panel:      #0f1011;
  --bg-elevated:    #191a1b;
  --bg-hover:       #28282c;

  --text-primary:   #f7f8f8;
  --text-secondary: #d0d6e0;
  --text-muted:     #8a8f98;
  --text-subtle:    #62666d;

  --accent:         #5e6ad2;  /* brand indigo */
  --accent-hover:   #7170ff;
  --accent-light:   #828fff;
  --success:        #27a644;
  --danger:         #e5484d;

  --border:         rgba(255,255,255,0.08);
  --border-subtle:  rgba(255,255,255,0.05);
  --border-solid:   #23252a;

  --shadow-focus:   rgba(0,0,0,0.1) 0px 4px 12px;
}

[data-theme="light"] {
  --bg-canvas:      #f7f8f8;
  --bg-panel:       #ffffff;
  --bg-elevated:    #f3f4f5;
  --bg-hover:       #e6e6e6;

  --text-primary:   #0a0a0a;
  --text-secondary:  #404040;
  --text-muted:      #6b6b6b;
  --text-subtle:     #999999;

  --accent:         #4f5bd0;
  --accent-hover:   #5e6ad2;
  --accent-light:   #7170ff;

  --border:         rgba(0,0,0,0.10);
  --border-subtle:  rgba(0,0,0,0.05);
  --border-solid:   #e6e6e6;

  --shadow-focus:   rgba(0,0,0,0.08) 0px 4px 12px;
}
```

### Tipografía

```css
body {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-feature-settings: "cv01", "ss03";
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-canvas);
}

/* Display */
.display-xl { font-size: clamp(40px, 6vw, 64px); font-weight: 510;
               letter-spacing: -0.04em; line-height: 1.05; }
.display    { font-size: clamp(32px, 4vw, 48px); font-weight: 510;
               letter-spacing: -0.03em; line-height: 1.1; }

/* Headings */
h2 { font-size: 32px; font-weight: 510; letter-spacing: -0.02em; }
h3 { font-size: 20px; font-weight: 590; letter-spacing: -0.01em; }

/* Body */
.body-lg    { font-size: 18px; font-weight: 400; color: var(--text-muted); }
.body       { font-size: 16px; font-weight: 400; }
.body-sm    { font-size: 15px; font-weight: 400; color: var(--text-muted); }

/* Mono */
.mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px; font-weight: 500; }
```

### Componentes clave

**Buttons**
```css
.btn-primary {
  background: var(--accent);
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 510;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover { background: var(--accent-hover); }

.btn-ghost {
  background: rgba(255,255,255,0.02);
  color: var(--text-secondary);
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 510;
  cursor: pointer;
}
```

**Cards (translucent, never solid)**
```css
.product-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 24px;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.product-card:hover {
  background: rgba(255,255,255,0.04);
  border-color: var(--border);
}
```

**Input**
```css
input, textarea, select {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(94,106,210,0.15);
}
```

### Layout & spacing

- Max content width: `1200px` (.container)
- Section padding: `80px 0` desktop, `48px 0` mobile
- Grid: `repeat(auto-fit, minmax(280px, 1fr))` para grid de productos
- Spacing rhythm: 8px base (16, 24, 32, 48, 64, 80)
- `prefers-reduced-motion: reduce` — deshabilita todas las transiciones

### Logo SVG (embebido inline)

```html
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 2L26 14L14 26L2 14L14 2Z" stroke="currentColor" stroke-width="1.5"/>
  <path d="M14 8L20 14L14 20L8 14L14 8Z" fill="var(--accent)"/>
</svg>
```

Un diamante geométrico — transmite precisión técnica + el "signal" de Zignal.

---

## JavaScript (embebido en `<script>`)

### Theme toggle

```js
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('zn-theme') || (prefersDark ? 'dark' : 'dark');
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('zn-theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});
```

### Language toggle (i18n con data attributes)

```js
const langToggle = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('zn-lang') || 'es';

function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-es]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  // Update placeholders
  document.querySelectorAll(`[data-${lang}-ph]`).forEach(el => {
    el.placeholder = el.dataset[lang + 'Ph'];
  });
  langToggle.textContent = lang === 'es' ? 'EN' : 'ES';
  localStorage.setItem('zn-lang', lang);
}
langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  applyLang(currentLang);
});
applyLang(currentLang);
```

### Lead form handler (con Formspree + fallback mailto)

```js
const form = document.getElementById('lead-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const statusEl = document.getElementById('form-status');

  try {
    // Si tienes Formspree ID, reemplaza TU-FORM-ID
    const response = await fetch('https://formspree.io/f/TU-FORM-ID', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      statusEl.textContent = currentLang === 'es'
        ? '✓ Gracias. Te contactaremos en 24 horas.'
        : '✓ Thank you. We will contact you within 24 hours.';
      statusEl.className = 'form-status success';
      form.reset();
    } else {
      throw new Error('Form submission failed');
    }
  } catch (err) {
    // Fallback: abrir cliente de email
    const subject = encodeURIComponent(
      currentLang === 'es' ? 'Solicitud de demo - Zignal Nexora' : 'Demo request - Zignal Nexora'
    );
    const body = encodeURIComponent(
      `Nombre: ${data.get('name')}\nEmail: ${data.get('email')}\nEmpresa: ${data.get('company')}\nTel: ${data.get('phone')}\nProducto: ${data.get('product')}\nMensaje: ${data.get('message')}`
    );
    window.location.href = `mailto:hola@zignalnexora.com?subject=${subject}&body=${body}`;
  }
});
```

### Smooth scroll para anchor links

```js
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
```

### Mobile menu toggle

```js
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
menuToggle.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});
```

---

## Responsive breakpoints

| Breakpoint | Ancho | Cambios |
|---|---|---|
| `max-width: 1024px` | Tablet | Productos: grid de 2 columnas |
| `max-width: 768px` | Mobile | Nav colapsa a hamburger, hero 40px, productos 1 columna, footer stack |
| `max-width: 480px` | Mobile small | Padding reducido 24px, botones fullwidth |

---

## Patrón i18n en el HTML

Cada texto bilingüe usa `data-es` y `data-en`:

```html
<!-- Ejemplo: heading del hero -->
<h1 class="display-xl"
    data-es="Software que automatiza, conecta y analiza. Sin fricción."
    data-en="Software that automates, connects, and analyzes. Without friction.">
  Software que automatiza, conecta y analiza. Sin fricción.
</h1>

<!-- Placeholders -->
<input type="email" name="email" required
    data-es-ph="Email corporativo"
    data-en-ph="Work email"
    placeholder="Email corporativo">
```

---

## Checklist anti-slop a cumplir

Antes de declarar Done, el modelo debe verificar:

- [ ] **NO hero de 3 tarjetas iguales** — layout asimétrico en sección de productos
- [ ] **NO gradientes tech genéricos** — solo accent sutil detrás del hero
- [ ] **NO glassmorphism** — superficies con opacidad controlada, sin blur decorativo
- [ ] **NO números monumentales inventados** — cero métricas falsas
- [ ] **NO icon-toppersTailwind genéricos** — SVGs custom de trazo 1.5px
- [ ] **NO centrado automático** — composición intencional por sección
- [ ] **NO "Insights / Growth / Scale" como labels genéricos** — copy específica por producto
- [ ] **NO Inter default sin feature settings** — `font-feature-settings: "cv01", "ss03"` obligatorio
- [ ] **Sí dark-first con light toggle funcional** — las 2 paletas con variables CSS
- [ ] **Sí bilingüe funcional** — toggle ES/EN actualiza todo el contenido en runtime
- [ ] **Sí responsive** — probado en 768px y 480px
- [ ] **Sí form funcional** — handler con Formspree + fallback mailto
- [ ] **Sí `prefers-reduced-motion`** — transiciones deshabilitadas

---

## Pasos de ejecución para el modelo que tome el relevo

1. **`write_file`** a `C:\Users\arlug\agy_projects\zignal-site\index.html` con el HTML completo
2. **`browser_navigate`** a `file:///C:/Users/arlug/agy_projects/zignal-site/index.html`
3. **`browser_snapshot`** — verificar que no hay errores de estructura
4. **`browser_vision`** con question "Verificar que el dark theme renderiza correctamente, el hero tiene composición tipográfica fuerte, y los 5 productos se ven diferenciados"
5. **`browser_console`** — verificar 0 errores JS
6. Click en toggle theme → `browser_vision` con question "Verificar light theme: contraste texto, backgrounds, inputs del form legibles"
7. Click en toggle EN → `browser_snapshot` — verificar que todos los textos cambiaron a inglés
8. Resize a 768px (DevTools o `browser_vision` tras redimensionar) — verificar responsive
9. **`text/File`** el HTML final para confirmar que el archivo quedó guardado completo
10. Reportar al usuario: path del archivo, qué incluye, estado de verificación

---

Este plan está completo y autocontenido. Cuando cambies de modelo, pásale este documento (o ponle este chat como contexto) y podrá ejecutar `write_file` + verificación directamente sin necesidad de más preguntas.