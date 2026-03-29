# Plan de Correcciones: Preview de Cartas y Dashboard

## 📋 Resumen

Dos problemas a resolver:
1. **Preview de cartas**: La selección de cartas no funciona
2. **Dashboard**: Rediseñar según referencia HTML

---

## 🎯 1. Corregir Selección de Cartas en Preview

### Problema actual:
- Al hacer clic en una carta, no cambia de estado
- No hay indicador visual de selección
- Toggle de selección no responde

### Solución:

**Archivo:** `frontend/app/preview/[deck_id]/page.tsx`

#### Estado a implementar:
```tsx
const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set())
```

#### Funciones a implementar:
```tsx
function toggleCardSelection(index: number) {
  setSelectedCards(prev => {
    const newSet = new Set(prev)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    return newSet
  })
}

function selectAll() {
  setSelectedCards(new Set(cards.map((_, i) => i)))
}

function deselectAll() {
  setSelectedCards(new Set())
}
```

#### Indicador visual:
- Checkbox en esquina superior derecha de cada carta
- Borde `border-primary` cuando seleccionada
- Overlay semi-transparente con check icon
- Opacidad reducida en cartas no seleccionadas

#### Botones de acción:
- "Seleccionar todas" / "Deseleccionar todas"
- "Descargar seleccionadas" (solo las seleccionadas)

---

## 🎯 2. Rediseñar Dashboard

### Referencia: `Workspace colaborativo/codeUser Dashboard.html`

### Estructura a implementar:

```
SideNavBar (desktop only)
├── Panel de Control (activo)
├── Mis Mazos → /my-decks
├── Estadísticas → /stats
├── Explorar → /explore
├── Configuración → /settings
├── Ayuda → /help
└── Cerrar Sesión → logout

Main Content
├── TopAppBar
│   ├── Saludo: "¡Hola de nuevo, [nombre]!"
│   ├── Subtítulo: "¿Listo para otro video?"
│   ├── Notificaciones (icono con badge)
│   └── Avatar + nombre + rol
├── Stats Bento Grid (3 cards)
│   ├── Tarjetas creadas
│   ├── Racha de estudio
│   └── Mazos generados
├── Generator Section
│   ├── Título: "Generar nuevo mazo"
│   ├── Input URL
│   └── Botón "Generar"
├── Recent Decks Grid
│   ├── Título: "Tus mazos recientes"
│   ├── Cards de mazos reales
│   └── Placeholder "¿Más lecciones?"
└── Floating Monthly Usage Indicator
    ├── Uso del mes
    ├── Barra de progreso
    └── Botón "Upgrade"
```

### Datos reales a conectar:
- Mazos: `GET /api/decks/user/my-decks`
- Usuario: `GET /api/auth/me`
- Estadísticas: Calcular desde mazos del usuario

---

## 📁 Archivos a Modificar

| # | Archivo | Cambios |
|---|---------|---------|
| 1 | `frontend/app/preview/[deck_id]/page.tsx` | Añadir selección de cartas |
| 2 | `frontend/app/dashboard/page.tsx` | Rediseñar según referencia |

---

## ✅ Criterios de Aceptación

### Preview:
- [ ] Click en carta togglea selección
- [ ] Checkbox visible en cartas seleccionadas
- [ ] Borde destacado en cartas seleccionadas
- [ ] Botón "Seleccionar todas" funciona
- [ ] Botón "Deseleccionar todas" funciona
- [ ] Estado de selección persiste durante navegación

### Dashboard:
- [ ] SideNavBar visible en desktop
- [ ] SideNavBar oculta en mobile
- [ ] Stats muestran datos reales
- [ ] Mazos recientes desde API real
- [ ] Generador rápido funcional
- [ ] Indicador de uso mensual
- [ ] Diseño responsive
