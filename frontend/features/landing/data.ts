import { Briefcase, Plane, Gamepad2, GraduationCap, History, Timer, XCircle } from "lucide-react"

export const CEFR_LEVELS = [
  { value: "A1", label: "A1 — Principiante", desc: "Saludos, números, colores" },
  { value: "A2", label: "A2 — Básico", desc: "Situaciones simples del día a día" },
  { value: "B1", label: "B1 — Intermedio", desc: "Entiendo series con subtítulos" },
  { value: "B2", label: "B2 — Intermedio-alto", desc: "Películas sin subtítulos" },
  { value: "C1", label: "C1 — Avanzado", desc: "Uso flexible y profesional" },
  { value: "C2", label: "C2 — Maestría", desc: "Dominio casi nativo" },
]

export const CONTEXTS = [
  { value: "general", label: "General", icon: GraduationCap, desc: "Mezcla equilibrada de todo" },
  { value: "work", label: "Trabajo", icon: Briefcase, desc: "Llamadas, emails, reuniones" },
  { value: "travel", label: "Viajes", icon: Plane, desc: "Aeropuertos, hoteles, restaurantes" },
  { value: "gaming", label: "Gaming", icon: Gamepad2, desc: "Vocabulario de videojuegos" },
]

export const PROBLEMS = [
  {
    icon: History,
    text: "Ves horas de YouTube en inglés pero al día siguiente no recuerdas nada.",
  },
  {
    icon: Timer,
    text: "Crear mazos en Anki a mano toma 2-3 horas por video.",
  },
  {
    icon: XCircle,
    text: "Duolingo, Babbel, apps genéricas. Ninguna usa el contenido que tú ya consumes.",
  },
]

export const STEPS = [
  {
    icon: "Link",
    title: "1. Pega el enlace",
    desc: "Cualquier video de YouTube que te guste. Sin límites.",
  },
  {
    icon: "Brain",
    title: "2. La IA analiza",
    desc: "Extraemos frases reales, pronunciación y contexto cultural.",
  },
  {
    icon: "Download",
    title: "3. Descarga y estudia",
    desc: "Importa a Anki en un clic y empieza a memorizar de verdad.",
  },
]

export const FEATURES = [
  "Jerga y expresiones locales de Colombia.",
  "Explicaciones sencillas, como te las diría un parcero.",
]

export const TESTIMONIALS = [
  {
    name: "Mariana R.",
    city: "Medellín",
    level: "B1",
    quote:
      "Me armé un mazo con un podcast que me escucho todos los días y ¡qué cambio! Ya le cogí el tiro a como 40 frases que oía todo el tiempo pero a las que no les agarraba el sentido.",
  },
  {
    name: "Carlos T.",
    city: "Bogotá",
    level: "B2",
    quote:
      "La nota 'CO' en las tarjetas es un golazo completo. Cero traducciones robóticas de diccionario; la herramienta te explica la vuelta tal cual como la habla la gente de verdad.",
  },
  {
    name: "Laura M.",
    city: "Cali",
    level: "A2",
    quote:
      "Tenía el Anki tirado y vacío hace meses. Ahora ya llevo tres mazos activos y me siento a repasar todos los días sin pereza; ya no se siente como una obligación aburrida.",
  },
]

export const PRICING_PLANS = [
  {
    name: "Explorador",
    identity: "SOY EXPLORADOR",
    identityColor: "#5F5E5A",
    price: "$0",
    period: "siempre",
    tagline: "Para probar si esto es lo tuyo.",
    features: [
      { text: "1 mazo por día", included: true },
      { text: "Hasta 15 tarjetas por mazo", included: true },
      { text: "Contexto general", included: true },
      { text: "Contextos BPO, entrevistas, viajes", included: false },
      { text: "Mazos ilimitados", included: false },
      { text: "Modo estudio completo", included: false },
    ],
    cta: "Empezar gratis",
    ctaStyle: "secondary" as const,
    featured: false,
  },
  {
    name: "Fluente",
    identity: "SOY FLUENTE",
    identityColor: "#185FA5",
    price: "$15.000",
    period: "COP/mes",
    tagline: "Quiero progresar de verdad.",
    features: [
      { text: "Mazos ilimitados", included: true },
      { text: "Tarjetas ilimitadas por mazo", included: true },
      { text: "Todos los contextos incluyendo BPO", included: true },
      { text: "Modo estudio completo + SRS", included: true },
      { text: "Frase del día por WhatsApp", included: true },
      { text: "IA mejorada (Gemini Pro)", included: true },
    ],
    cta: "Quiero ser Fluente",
    ctaStyle: "primary" as const,
    featured: true,
  },
  {
    name: "Nativo",
    identity: "SOY NATIVO",
    identityColor: "#3B6D11",
    price: "$120.000",
    period: "COP/año",
    tagline: "Para el que va en serio y quiere lo mejor.",
    features: [
      { text: "Todo lo de Fluente", included: true },
      { text: "IA de mayor calidad (Claude)", included: true },
      { text: "Soporte directo por WhatsApp", included: true },
      { text: "Acceso prioritario a nuevas funciones", included: true },
      { text: "Exportación completa de historial", included: true },
      { text: "$10.000/mes equivalente", included: true },
    ],
    cta: "Quiero ser Nativo",
    ctaStyle: "secondary" as const,
    featured: false,
  },
]

export const FAQS = [
  {
    question: "¿Necesito tener Anki instalado?",
    answer:
      "No, parce. Podés estudiar directamente en AnkiTube con el mismo sistema de repetición inteligente tipo SM-2. Si ya sos team Anki o querés llevar las tarjetas a otro lado, descargás el .apkg e importás donde quieras — Desktop, Mobile, lo que te sirva.",
  },
  {
    question: "¿Funciona con cualquier video?",
    answer:
      "Casi todos. Solo necesitamos que el video tenga subtítulos en inglés — ya sean automáticos o que los haya puesto el creador. Y entre más te guste el contenido, mejor funciona el aprendizaje. Porque no es lo mismo memorizar frases random que aprender con lo que tú ya verías por gusto.",
  },
  {
    question: "¿Cómo sé mi nivel?",
    answer:
      "Si entendés series con subtítulos en español, B1 es tu nivel. Es el que mejor funciona para arrancar. Después vas subiendo conforme te sientas cómodo. Y si no sabés, empezá por B1 — no vas a perder nada.",
  },
  {
    question: "¿El registro es simple?",
    answer:
      "Sí, de una. Google o email, lo que te quede más cómodo. Y si generaste un mazo sin tener cuenta, se te guarda automáticamente cuando te registrás. Sin enredarte.",
  },
]

export const STATUS_MESSAGES: Record<string, string> = {
  idle: "",
  extracting: "Buscando ese video...",
  analyzing: "Analizando el contenido...",
  generating: "Armando tu mazo con IA...",
  completed: "Listo, tu mazo quedó brutal",
  error: "Uy, algo falló",
}
