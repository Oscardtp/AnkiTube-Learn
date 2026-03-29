# Plan de Rediseño: Página /generate y Componentes Relacionados

## 📋 Resumen

Rediseñar la página `/generate` para que sea visualmente idéntica a la landing page, implementar componente `CardFlip` con animación 3D, modal de registro sin redirección, y navbar minimalista.

---

## 🎯 Objetivos

1. `/generate` visualmente consistente con la landing page
2. Navbar minimalista (sin menú hamburguesa, sin links de navegación)
3. Componente `CardFlip` con animación 3D para preview de tarjetas
4. Modal de registro que no redirige (se mantiene en `/preview`)
5. Diseño mobile-first responsive
6. Tono colombiano/Nequi-style en todos los copys
7. Regla de Interrupción Cero (un solo foco de atención)

---

## 📁 Archivos a Crear/Modificar

### 1. Navbar Minimalista
**Archivo:** `frontend/components/MinimalNavbar.tsx`

- Logo AnkiTube (no es link en /preview)
- Sin menú hamburguesa
- Sin links de navegación
- Solo logo centrado o a la izquierda
- Fondo transparente o `bg-surface`

### 2. Página /generate Rediseñada
**Archivo:** `frontend/app/generate/page.tsx`

- Mismo estilo visual que la landing page
- Usar clases CSS de `globals.css` (`.section-padding`, `.container-limit`, `.card`, etc.)
- Colores del sistema de diseño (primary, surface, on-surface, etc.)
- Tipografía Inter
- Bordes redondeados `rounded-2xl` / `rounded-3xl`
- Sombras `shadow-elevated`, `shadow-card`

**Estructura:**
```
MinimalNavbar
├── Sección Hero (título + subtítulo)
├── Formulario Card (bg-surface-container-lowest, rounded-3xl, shadow-elevated)
│   ├── Input URL (con detección en tiempo real)
│   ├── Select Nivel CEFR
│   ├── Grid Contextos (4 opciones, Fluente bloqueados)
│   ├── Barra de progreso lateral (3 pasos)
│   └── CTA "Generar mazo gratis"
└── Stats (2 min, 100% audio, A1-C2)
```

**Copys del formulario (del HTML de referencia):**
- Título: "Empieza ahora. Sin complicaciones."
- Subtítulo: "Pega la URL de cualquier video de YouTube y genera tu mazo Anki en segundos."
- Input placeholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
- Label nivel: "Tu nivel de inglés (CEFR)"
- Hint nivel: "¿No sabes tu nivel? Elige B1 si entiendes series con subtítulos"
- Label contexto: "Contexto de aprendizaje"
- CTA: "Generar mazo gratis"
- Footer: "Sin tarjeta de crédito · Sin registro · 1 mazo gratis por día"

**Contextos Fluente (bloqueados):**
- "Trabajo" con icono Briefcase
- "Viajes" con icono Plane
- "Gaming" con icono Gamepad2
- Mostrar candado o badge "Fluente" sobre estos
- Al hacer click, mostrar tooltip: "Disponible en plan Fluente"

**Barra de progreso lateral:**
- 3 pasos con dots indicadores
- Estados: gris (no visto), #B5D4F4 (visto), #1A56DB (actual)
- Labels: "Extrayendo", "Analizando", "Generando"
- Animación suave entre pasos

### 3. Componente CardFlip
**Archivo:** `frontend/components/CardFlip.tsx`

**Especificación técnica:**
```tsx
// Estructura
<div className="perspective: 1000px">
  <div className="transform-style: preserve-3d; transition: transform 300ms ease-in-out">
    {/* Cara Frontal - rotateY: 0deg */}
    <div className="backface-visibility: hidden">
      {/* Front de la tarjeta */}
    </div>
    {/* Cara Trasera - rotateY: 180deg */}
    <div className="backface-visibility: hidden; transform: rotateY(180deg)">
      {/* Back de la tarjeta + Colombian note */}
    </div>
  </div>
</div>
```

**Cara Frontal:**
- Texto en inglés (front)
- Icono de audio (Volume2) que activa mini player
- Indicador de tipo de tarjeta (vocabulary, phrase, idiom)
- Timestamp del video

**Cara Trasera:**
- Traducción en español (back)
- Colombian note en color #0F6E56 (teal 600)
- Grammar note
- Context note

**Comportamiento:**
- Click/tap en cualquier lugar hace flip
- Animación: rotateY 0° → 180° en 300ms ease-in-out
- Si el usuario presionó play en la frontal, al completar flip se activa mini audio player
- No autoreproducción sin interacción previa

### 4. Modal de Registro
**Archivo:** `frontend/components/RegisterModal.tsx`

**Trigger:** Click en "Descargar" o "Estudiar aquí" en `/preview`

**Copy del modal:**
- H2: "Tu mazo te espera 🎯"
- Subtítulo: "Guardá tu progreso para siempre. Es gratis."
- Campos: Email, Contraseña
- CTA: "Crear cuenta gratis"
- Footer: "¿Ya tienes cuenta? Inicia sesión"

**Comportamiento post-registro:**
1. El mazo anónimo se transfiere automáticamente al usuario nuevo
2. El modal se cierra
3. La descarga/estudio inicia automáticamente
4. Aparece toast verde: "Mazo guardado en tu cuenta ✓"

**Diseño:**
- Overlay oscuro (bg-black/50 backdrop-blur-sm)
- Modal centrado (bg-surface-container-lowest rounded-3xl)
- Max-width: 420px
- Padding: 32px
- Animación: fade-in + scale(0.95) → scale(1)

### 5. Página /preview Actualizada
**Archivo:** `frontend/app/preview/[deck_id]/page.tsx`

**Cambios:**
- Reemplazar vista de tarjetas estática con componente `CardFlip`
- Agregar navegación entre tarjetas (dots indicadores)
- Botones "Descargar" y "Estudiar aquí" abren modal de registro (si no autenticado)
- Si autenticado, descargan/abren directamente
- Botón "Generar otro" regresa a `/generate` sin confirmación
- Logo no es link (evita salida accidental)

**Estructura:**
```
MinimalNavbar
├── Video Info (thumbnail, título, nivel, contexto)
├── CardFlip Component
│   ├── Navegación con dots (gris, #B5D4F4, #1A56DB)
│   ├── Botones anterior/siguiente
│   └── Contador "Tarjeta X de Y"
├── CTAs
│   ├── "Descargar mazo" (primario)
│   └── "Generar otro" (secundario, link a /generate)
└── RegisterModal (si no autenticado)
```

---

## 🎨 Sistema de Diseño (de la landing page)

### Colores
- Primary: `#003fb1`
- Primary Container: `#1a56db`
- Secondary: `#006c49`
- Surface: `#f7f9fb`
- Surface Container Lowest: `#ffffff`
- Surface Container Low: `#f2f4f6`
- On Surface: `#191c1e`
- On Surface Variant: `#434654`
- Error: `#ba1a1a`
- Outline Variant: `#c3c5d7`

### Tipografía
- Font: Inter
- Headings: `font-extrabold` (800)
- Body: `font-medium` (500)
- Labels: `font-semibold` (600)

### Bordes
- Inputs/Buttons: `rounded-xl` (0.75rem)
- Cards: `rounded-2xl` (1rem) o `rounded-3xl` (1.5rem)
- Pills/Badges: `rounded-full`

### Sombras
- Card: `shadow-card` (0 4px 24px -4px rgba(25, 28, 30, 0.08))
- Elevated: `shadow-elevated` (0 8px 32px -8px rgba(25, 28, 30, 0.12))
- Primary CTA: `shadow-lg shadow-primary/30`

### Animaciones
- Transiciones: `transition-all duration-200` o `duration-300`
- Hover CTA: `hover:opacity-90 hover:shadow-xl active:scale-[0.98]`
- Loading: `animate-spin` en Loader2

---

## 📱 Responsive Design

### Mobile (< 768px)
- Padding: `px-6 py-4`
- Grid contextos: `grid-cols-2`
- Stats: `grid-cols-1`
- Navbar: logo centrado
- CardFlip: ancho completo

### Tablet (768px - 1024px)
- Padding: `px-8 py-6`
- Grid contextos: `grid-cols-4`
- Stats: `grid-cols-3`

### Desktop (> 1024px)
- Padding: `px-12 py-8`
- Max-width container: `max-w-7xl`
- CardFlip: `max-w-2xl` centrado

---

## 🔧 Implementación Paso a Paso

### Paso 1: Crear MinimalNavbar
- Componente simple con logo
- Sin links de navegación
- Sin menú hamburguesa
- Fondo transparente

### Paso 2: Rediseñar /generate
- Usar estructura de la landing page
- Mismos colores, tipografía, bordes, sombras
- Formulario con 3 inputs
- Barra de progreso lateral
- Contextos Fluente bloqueados

### Paso 3: Crear CardFlip
- Componente con animación 3D
- Cara frontal y trasera
- Mini audio player
- Navegación con dots

### Paso 4: Crear RegisterModal
- Modal overlay
- Formulario de registro
- Post-registro: transferir mazo + cerrar modal + toast

### Paso 5: Actualizar /preview
- Integrar CardFlip
- Integrar RegisterModal
- Botones con lógica de autenticación
- "Generar otro" sin confirmación

### Paso 6: Verificar responsive
- Probar en 375px, 768px, 1024px, 1440px
- Verificar animaciones
- Verificar tono de voz en copys

---

## ✅ Criterios de Aceptación

- [ ] `/generate` se ve idéntica a la landing page en estilo
- [ ] Navbar minimalista sin links de navegación
- [ ] Formulario tiene exactamente 3 inputs (URL, nivel, contexto)
- [ ] Detección de URL en tiempo real con preview
- [ ] Contextos Fluente visibles pero bloqueados con candado
- [ ] Barra de progreso con 3 pasos y estados propios
- [ ] CardFlip con animación 3D (300ms, ease-in-out, backface-visibility)
- [ ] Modal de registro no redirige
- [ ] Post-registro: mazo se transfiere + descarga automática + toast
- [ ] Diseño responsive en mobile, tablet y desktop
- [ ] Tono colombiano/Nequi-style en todos los copys
- [ ] Regla de Interrupción Cero: un solo foco de atención
