# Plan de Implementación: Dashboard del Usuario y Perfil/Configuración

## 📋 Resumen

Implementar dos páginas nuevas:
1. **Dashboard del Usuario** (`/dashboard`) - Panel de control con estadísticas, generador rápido y mazos recientes
2. **Perfil y Configuración** (`/profile`) - Información personal, nivel de inglés, contexto profesional

---

## 🎯 1. Dashboard del Usuario (`/dashboard`)

### Estructura (basada en `codeUser Dashboard.html`)

```
MinimalNavbar
├── SideNavBar (opcional - para desktop)
│   ├── Panel de Control (activo)
│   ├── Mis Mazos
│   ├── Estadísticas
│   ├── Explorar
│   ├── Configuración
│   ├── Ayuda
│   └── Cerrar Sesión
├── Main Content
│   ├── TopAppBar
│   │   ├── Saludo: "¡Hola de nuevo, [nombre]!"
│   │   ├── Subtítulo: "¿Listo para otro video? Tu progreso hoy va volando."
│   │   ├── Notificaciones (icono con badge)
│   │   └── Avatar + nombre + rol
│   ├── Stats Bento Grid (3 cards)
│   │   ├── Tarjetas creadas: 1,248
│   │   ├── Racha de estudio: 15 días
│   │   └── Mazos generados: 42
│   ├── Generator Section
│   │   ├── Título: "Generar nuevo mazo"
│   │   ├── Subtítulo: "Pega el link y yo me encargo del resto. ¡Hágale pues!"
│   │   ├── Input URL
│   │   └── Botón "Generar"
│   └── Recent Decks Grid
│       ├── Título: "Tus mazos recientes"
│       ├── Botón "Ver toda la biblioteca"
│       ├── Cards de mazos recientes (thumbnail, título, nivel, progreso)
│       └── Card "¿Más lecciones?" (placeholder para crear nuevo)
└── Floating Monthly Usage Indicator
    ├── Título: "Uso del mes"
    ├── Barra de progreso (65%)
    └── Botón "Upgrade"
```

### Características:
- **SideNavBar** para navegación en desktop
- **Stats Bento Grid** con 3 métricas clave
- **Generador rápido** integrado en el dashboard
- **Mazos recientes** con cards interactivas
- **Indicador de uso mensual** flotante
- **Diseño responsive** (mobile-first)

### Copys (tono colombiano):
- "¡Hola de nuevo, [nombre]!"
- "¿Listo para otro video? Tu progreso hoy va volando."
- "Pega el link y yo me encargo del resto. ¡Hágale pues!"
- "¿Más lecciones? Tu curiosidad no tiene límites."

---

## 🎯 2. Perfil y Configuración (`/profile`)

### Estructura (basada en `codePerfil y Configuración.html`)

```
MinimalNavbar
├── Header
│   ├── Título: "Perfil y Configuración"
│   ├── Botón notificaciones
│   └── Botón guardar
├── Main Content
│   ├── Profile Header
│   │   ├── Avatar (editable)
│   │   ├── Nombre: "Carlos Méndez"
│   │   └── Subtítulo: "Personaliza tu experiencia de aprendizaje asistida por IA"
│   ├── Personal Information
│   │   ├── Nombre Completo (input)
│   │   └── Correo Electrónico (input)
│   ├── English Proficiency Level
│   │   ├── Título: "Nivel de Inglés"
│   │   ├── Subtítulo: "Selecciona tu nivel actual según el MCER"
│   │   └── Grid de niveles CEFR (A1, A2, B1, B2, C1, C2)
│   ├── Professional Context
│   │   ├── Título: "Contexto Profesional"
│   │   ├── Subtítulo: "La IA generará vocabulario y ejemplos específicos"
│   │   └── Grid de contextos (Software & Tech, Medicina, Negocios, Derecho, Ingeniería, Otro)
│   ├── Anki Integration
│   │   ├── Título: "Integración con Anki"
│   │   ├── Subtítulo: "Sincroniza automáticamente tus tarjetas"
│   │   ├── Botón "Configurar Deck"
│   │   └── Botón "Vincular Cuenta"
│   └── Footer Actions
│       ├── Botón "Cancelar"
│       └── Botón "Guardar Cambios"
└── Fixed Bottom Nav (mobile)
    ├── Inicio
    ├── Estudiar
    └── Ajustes
```

### Características:
- **Avatar editable** con botón de edición
- **Selector de nivel CEFR** con grid visual
- **Selector de contexto profesional** con radio buttons
- **Integración con Anki** (placeholder)
- **Botones de acción** (Cancelar, Guardar)
- **Bottom Nav** para mobile
- **Diseño responsive**

### Copys:
- "Perfil y Configuración"
- "Personaliza tu experiencia de aprendizaje asistida por IA"
- "Selecciona tu nivel actual según el MCER para ajustar la complejidad de las tarjetas"
- "La IA generará vocabulario y ejemplos específicos para tu industria"
- "Sincroniza automáticamente tus tarjetas generadas con tu cuenta de AnkiWeb"

---

## 📁 Archivos a Crear/Modificar

| # | Archivo | Acción |
|---|---------|--------|
| 1 | `frontend/app/dashboard/page.tsx` | Crear - Dashboard del usuario |
| 2 | `frontend/app/profile/page.tsx` | Modificar - Rediseñar con nueva estructura |
| 3 | `frontend/components/SideNavBar.tsx` | Verificar/Modificar - Para dashboard |

---

## 🎨 Sistema de Diseño

### Colores (de Colores corporativos.md)
- Primary: `#003fb1`
- Primary Container: `#1a56db`
- Secondary: `#006c49`
- Surface: `#f7f9fb`
- Surface Container Lowest: `#ffffff`
- Surface Container Low: `#f2f4f6`
- On Surface: `#191c1e`
- On Surface Variant: `#434654`

### Componentes:
- **SideNavBar**: Navegación lateral con iconos Material Symbols
- **Stats Cards**: Bento grid con iconos y métricas
- **Generator Section**: Input URL + botón Generar
- **Deck Cards**: Thumbnails con overlay de información
- **Profile Form**: Inputs con labels y validación
- **CEFR Selector**: Grid de botones con estados
- **Context Selector**: Radio buttons con cards

---

## ✅ Criterios de Aceptación

- [ ] Dashboard muestra estadísticas del usuario (tarjetas, racha, mazos)
- [ ] Dashboard tiene generador rápido funcional
- [ ] Dashboard muestra mazos recientes con cards interactivas
- [ ] Dashboard tiene indicador de uso mensual flotante
- [ ] Perfil muestra información del usuario
- [ ] Perfil tiene selector de nivel CEFR funcional
- [ ] Perfil tiene selector de contexto profesional
- [ ] Perfil tiene sección de integración con Anki
- [ ] Ambas páginas son responsive (mobile-first)
- [ ] Ambas páginas usan el sistema de diseño establecido
- [ ] Copys en tono colombiano
