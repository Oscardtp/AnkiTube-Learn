# Plan de Rediseño UI - AnkiTube Learn

## 📋 Resumen de Cambios Solicitados

1. **Landing:** Añadir botón "Ya tengo una cuenta" y "Empieza ahora"
2. **Login:** Rediseñar completamente según DESIGNLogin.md
3. **/generate:** Limpieza visual (eliminar logo duplicado, remover distracciones)
4. **Navbar:** Efecto de resaltado dinámico con scroll spy
5. **Sección de precios:** Alinear con marca según Colores corporativos.md

---

## 🎯 1. Landing Page - Botones de Autenticación

### Cambios solicitados:
- Añadir botón "Ya tengo una cuenta" visible
- Añadir botón "Empieza ahora" sutil pero claro

### Implementación:
**Archivo:** `frontend/app/page.tsx`

**Ubicación del botón "Ya tengo una cuenta":**
- En la navbar superior (junto al logo)
- Estilo: Tertiary button (sin fondo, texto bold)
- Link a `/login`

**Ubicación del botón "Empieza ahora":**
- En el Hero Section, debajo del CTA principal
- Estilo: Secondary button o link sutil
- Link a `/generate`

**Copy:**
- "Ya tengo una cuenta" → `/login`
- "Empieza ahora" → `/generate`

---

## 🎯 2. Login Page - Rediseño Completo

### Directrices de DESIGNLogin.md:
- **The Digital Mentor:** Premium, encouraging, intentionally curated
- **No-Line Rule:** Sin bordes de 1px, usar shifts de color de fondo
- **Surface Hierarchy:** Base `surface` (#f7f9fb), Content `surface-container-low` (#f2f4f6), Cards `surface-container-lowest` (#ffffff)
- **Glass & Gradient Rule:** Glassmorphism para Hero headers, gradient de `primary` a `primary-container`
- **Typography:** Inter, extreme scale, weight contrast, tracking -0.02em para display
- **Elevation & Depth:** Ambient shadows, ghost borders
- **Buttons:** Primary con gradient, Secondary con `surface-container-high`, Tertiary sin fondo

### Estructura del Login:
```
MinimalNavbar (logo centrado)
├── Hero Section (Glassmorphism)
│   ├── Título: "Bienvenido de vuelta 👋"
│   └── Subtítulo: "Tu progreso te espera. Inicia sesión para continuar."
├── Login Card (surface-container-lowest, rounded-3xl, ambient shadow)
│   ├── Email Input
│   ├── Password Input con toggle
│   ├── "¿Olvidaste tu contraseña?" link
│   ├── CTA: "Iniciar sesión" (gradient primary → primary-container)
│   └── Footer: "¿No tienes cuenta? Regístrate gratis"
└── Social Proof (opcional)
```

### Copys:
- Título: "Bienvenido de vuelta 👋"
- Subtítulo: "Tu progreso te espera. Inicia sesión para continuar."
- CTA: "Iniciar sesión"
- Footer: "¿No tienes cuenta? Regístrate gratis"
- Link: "¿Olvidaste tu contraseña?"

### Estilo:
- Sin bordes (No-Line Rule)
- Background shifts para separación
- Glassmorphism en Hero
- Ambient shadows en cards
- Botones con gradient
- Tipografía Inter con weight contrast

---

## 🎯 3. /generate - Limpieza Visual

### Cambios solicitados:
- Eliminar logo que redirige al inicio (duplicidad)
- Remover elementos que distraigan
- Eliminar botones actuales en barra superior

### Implementación:
**Archivo:** `frontend/app/generate/page.tsx`

**Elementos a eliminar:**
1. Logo duplicado en la barra superior (mantener solo MinimalNavbar)
2. Botones de navegación "Características", "Precios", "FAQ"
3. Cualquier link que distraiga del flujo principal

**Elementos a mantener:**
- MinimalNavbar (solo logo, sin links)
- Hero Section con título
- Formulario Card
- Stats

**Botón "Empieza ahora":**
- Añadir en el Hero Section
- Estilo: Secondary button sutil
- Link a `/generate` (si ya está en /generate, no mostrar)

---

## 🎯 4. Navbar - Efecto de Resaltado Dinámico

### Cambios solicitados:
- Al hacer click en botón de navbar, cambia a azul de marca (`#0066FF` o token `--brand-blue`)
- Scroll spy: al desplazarse, los botones correspondientes cambian automáticamente
- Transición suave: `transition: color 0.3s ease`
- Resto de navbar minimalista y coherente

### Implementación:
**Archivo:** `frontend/components/Navbar.tsx` o nuevo `frontend/components/LandingNavbar.tsx`

**Funcionalidad:**
1. **Active state:** Al hacer click, el botón activo cambia a `text-primary` (#003fb1)
2. **Scroll spy:** Usar `IntersectionObserver` para detectar secciones visibles
3. **Transición:** `transition-colors duration-300`

**Secciones a trackear:**
- `#problema` → "Problema"
- `#generador` → "Generador"
- `#como-funciona` → "Cómo funciona"
- `#precios` → "Precios"
- `#faq` → "FAQ"

**Estilo del botón activo:**
```css
text-primary font-semibold  /* Azul de marca + bold */
```

**Estilo del botón inactivo:**
```css
text-on-surface-variant hover:text-primary transition-colors duration-300
```

---

## 🎯 5. Sección de Precios - Alineación con Marca

### Directrices de Colores corporativos.md y DESIGNPlanes y Precios.md:
- **No-Line Rule:** Sin bordes, usar background shifts
- **Surface Hierarchy:** Cards en `surface-container-lowest` (#ffffff)
- **Glass & Gradient Rule:** Glassmorphism para cards destacadas
- **Buttons:** Primary con gradient, Secondary con `surface-container-high`
- **Ambient Shadows:** Para floating elements
- **Do's:** Overlap badges, spacing-12+ entre secciones, secondary green para success
- **Don'ts:** Sin 100% black, sin dividers, sin box-shadow estándar

### Estructura de la sección de precios:
```
Section (bg-surface-container-low)
├── Título: "Planes simples. Resultados reales."
├── Subtítulo: "Empieza gratis. Crece cuando quieras."
├── Grid de 3 planes
│   ├── Explorador (surface-container-lowest, ambient shadow)
│   │   ├── Nombre: "Explorador"
│   │   ├── Precio: "$0"
│   │   ├── Periodo: "/ siempre"
│   │   ├── Features: ["1 mazo/día", "IA Estándar", "Exportación Anki"]
│   │   └── CTA: "Elegir Gratis" (secondary button)
│   ├── Fluente (surface-container-lowest, glassmorphism, badge "Más popular")
│   │   ├── Nombre: "Fluente"
│   │   ├── Precio: "$15.000"
│   │   ├── Periodo: "/ mes"
│   │   ├── Features: ["Mazos ilimitados", "IA Contextual Pro", "Audio HD natural", "Sin anuncios"]
│   │   └── CTA: "¡Me vuelvo fluente!" (primary gradient)
│   └── Nativo (surface-container-lowest, ambient shadow)
│       ├── Nombre: "Nativo"
│       ├── Precio: "$120.000"
│       ├── Periodo: "/ año"
│       ├── Features: ["Todo en Fluente", "Soporte vía WhatsApp", "Comunidad privada", "Acceso anticipado beta"]
│       └── CTA: "Plan Pro" (primary gradient)
└── Footer: "Sin contratos. Cancelas cuando quieras."
```

### Estilo de las cards:
- **Sin bordes** (No-Line Rule)
- **Background:** `surface-container-lowest` (#ffffff)
- **Radius:** `rounded-3xl` (1.5rem)
- **Shadow:** Ambient shadow (on-surface 6% opacity, 24px blur, 8px y-offset)
- **Plan destacado (Fluente):** Glassmorphism + badge "Más popular" que sobresale

### Estilo de los botones:
- **Primary (Fluente, Nativo):** Gradient `primary` → `primary-container`, white text, `rounded-full`
- **Secondary (Explorador):** `surface-container-high` fill, `on-surface` text, `rounded-full`

### Copys:
- Título: "Planes simples. Resultados reales."
- Subtítulo: "Empieza gratis. Crece cuando quieras."
- Footer: "Sin contratos. Cancelas cuando quieras."

---

## 📁 Archivos a Modificar

| # | Archivo | Cambios |
|---|---------|---------|
| 1 | `frontend/app/page.tsx` | Añadir botones "Ya tengo una cuenta" y "Empieza ahora", actualizar sección de precios |
| 2 | `frontend/app/login/page.tsx` | Rediseño completo según DESIGNLogin.md |
| 3 | `frontend/app/generate/page.tsx` | Limpieza visual, eliminar distracciones |
| 4 | `frontend/components/Navbar.tsx` | Añadir scroll spy y active states |
| 5 | `frontend/components/MinimalNavbar.tsx` | Verificar que no tenga links de navegación |

---

## ✅ Criterios de Aceptación

- [ ] Landing tiene botón "Ya tengo una cuenta" visible en navbar
- [ ] Landing tiene botón "Empieza ahora" en Hero Section
- [ ] Login rediseñado con estilo "The Digital Mentor"
- [ ] Login sin bordes (No-Line Rule)
- [ ] Login con Glassmorphism en Hero
- [ ] Login con Ambient shadows en cards
- [ ] /generate no tiene logo duplicado
- [ ] /generate no tiene botones de navegación
- [ ] /generate tiene botón "Empieza ahora"
- [ ] Navbar tiene scroll spy funcional
- [ ] Navbar tiene transición suave (300ms)
- [ ] Sección de precios sin bordes
- [ ] Sección de precios con Ambient shadows
- [ ] Sección de precios con plan destacado (Glassmorphism)
- [ ] Botones de precios con gradient (Primary) y surface-container-high (Secondary)
- [ ] Todos los copys en tono colombiano
