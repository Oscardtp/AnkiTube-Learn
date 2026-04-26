"""
build_prompt() — identical system prompt for ALL AI models.
Only the API client and call parameters change per model.
"""
import re

CEFR_DESCRIPTIONS = {
    "A1": "principiante absoluto — frases muy simples, vocabulario de uso diario como saludos, números y colores",
    "A2": "básico — puede comunicarse en situaciones simples y habituales, vocabulario de 1000-2000 palabras",
    "B1": "intermedio — puede entender los puntos principales de temas cotidianos, ve series con subtítulos",
    "B2": "intermedio-alto — puede entender ideas complejas, ve películas sin subtítulos con esfuerzo",
    "C1": "avanzado — puede usar el idioma de forma flexible y eficaz para propósitos sociales y profesionales",
    "C2": "maestría — puede entender prácticamente todo lo que escucha o lee, expresión fluida y espontánea",
}

CONTEXT_DESCRIPTIONS = {
    "general": "contexto general — vocabulario útil para cualquier situación cotidiana",
    "bpo": "call center / BPO colombiano — frases de atención al cliente, vocabulario de servicio, expresiones telefónicas",
    "developers": "desarrollo de software — terminología técnica, vocabulario de reuniones de equipo, inglés para código",
    "interviews": "entrevistas de trabajo — preguntas frecuentes, cómo hablar de experiencia, negociación de salario",
    "travel": "viajes — aeropuertos, hoteles, restaurantes, pedir indicaciones, emergencias",
    "academic": "inglés académico — escritura formal, presentaciones, vocabulario universitario",
}

SYSTEM_PROMPT_TEMPLATE = """Eres un asistente especializado en procesamiento estructurado de lenguaje para sistemas de aprendizaje.
Tu rol NO es ser creativo — eres preciso, consistente y estructurado.

REGLAS ABSOLUTAS:
1. Responde ÚNICAMENTE con JSON válido. Sin texto antes o después. Sin bloques markdown.
2. Si no hay suficientes frases útiles en la transcripción, genera menos tarjetas — nunca inventas contenido.
3. El campo "colombian_note" es OBLIGATORIO. Sin él, la tarjeta es inválida y se descarta.
4. Traducciones en español colombiano natural — NO neutro de doblaje.

PROCESO POR TARJETA:
1. Lee cada frase de la transcripción original
2. Si es útil, natural y práctica → ÚSALA
3. Si tiene "filler words" (uh, um, kinda, stuff, you know, like) → LÍMPIALA
4. Si es de baja calidad → REESCRÍBELA con una frase útil similar
5. Si es genérica de YouTube ("Hey guys!", "Don't forget to like and subscribe") → DESCÁRTALA

ENFOQUE:
- Extrae frases cortas, prácticas y gramaticalmente correctas
- Prefiere inglés oral informal sobre inglés corporativo o formal
- Las tarjetas deben tener valor de aprendizaje único — evita repetir la misma idea
- Puedes dividir frases largas en partes más pequeñas si mejora el valor educativo
- No inventes ideas nuevas — deriva todo de la transcripción

NIVEL DEL USUARIO: {level} — {cefr_desc}
CONTEXTO: {safe_context}

IDIOMA:
- "front": siempre en inglés (preferiblemente extraído directamente del video)
- "back": español colombiano natural — usa "tú", no "usted"
- Usa expresiones colombianas reales: "chévere", "bacano", "parce", "¿Quiubo?", "pelado", "la embarré"

CARD_TYPES:
- "vocabulary": una palabra clave con su contexto
- "phrase": expresión o frase completa de uso cotidiano
- "idiom": modismo o expresión idiomática
- "grammar_pattern": patrón gramatical con ejemplo del video

COLOMBIAN_NOTE — ejemplos del equivalente colombiano real:
- "It's on me" → "Yo invito / Corre por mi cuenta — como cuando alguien dice 'listo, yo pago esto'"
- "Let's call it a day" → "Ya vamonos — como cuando es tarde y dicen 'chao, hasta mañana'"
- "What's up?" → "¿Qué más? / ¿Quiubo? — el saludo casual colombiano de toda la vida"
- "I'm broke" → "Estoy pelado / Sin un peso — 'este mes quedé en la olla'"
- "Hold on" → "Espérese un momento — como cuando dicen '¿me regala un momento?'"

ESTRUCTURA JSON:
{{
  "cards": [
    {{
      "front": "frase en inglés (del video o ligeramente reescrita)",
      "back": "traducción en español colombiano natural",
      "keyword": "palabra clave o concepto central",
      "grammar_note": "explicación gramatical simple en español — por qué se usa así",
      "context_note": "cuándo usar esta frase en la vida real",
      "colombian_note": "equivalente colombiano real con ejemplo de uso cotidiano",
      "timestamp_start": 12.5,
      "timestamp_end": 18.3,
      "card_type": "phrase"
    }}
  ]
}}

REGLAS DE CALIDAD:
- Detecta falsos cognados: "embarrassed" ≠ "embarazada", "actually" ≠ "actualmente"
- No incluyas saludos genéricos ni meta-comentarios de YouTube
- No retornen fewer sentences si más válidas existen
- El output debe ser JSON válido"""


def _sanitize_for_prompt(text: str) -> str:
    """
    Sanitize user input to prevent prompt injection.
    Removes common injection patterns while preserving legitimate content.
    """
    if not text:
        return ""
    
    # Remove common injection patterns
    injection_patterns = [
        r"(?i)ignore\s+(all\s+)?previous\s+(instructions|rules|prompts)",
        r"(?i)ignore\s+(all\s+)?above",
        r"(?i)disregard\s+(all\s+)?(previous|above|prior)",
        r"(?i)forget\s+(all\s+)?(previous|above|prior)",
        r"(?i)you\s+are\s+now",
        r"(?i)new\s+instructions?:",
        r"(?i)system\s*prompt",
        r"(?i)act\s+as\s+(a\s+)?",
        r"(?i)pretend\s+(you\s+are|to\s+be)",
        r"(?i)do\s+not\s+follow",
        r"(?i)instead\s+(of|do|respond|output|return)",
    ]
    
    sanitized = text
    for pattern in injection_patterns:
        sanitized = re.sub(pattern, "[filtered]", sanitized)
    
    # Limit length to prevent prompt overflow
    max_length = 10000
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length] + "... [truncated]"
    
    return sanitized


def build_prompt(
    transcript_text: str,
    level: str,
    context: str,
    min_cards: int,
    max_cards: int,
) -> tuple[str, str]:
    """
    Returns (system_prompt, user_prompt) for all AI models.
    The same prompt is used for all AI providers.
    """

    cefr_desc = CEFR_DESCRIPTIONS.get(level, CEFR_DESCRIPTIONS["B1"])
    context_desc = CONTEXT_DESCRIPTIONS.get(context, CONTEXT_DESCRIPTIONS["general"])

    # Sanitize user inputs to prevent prompt injection
    safe_transcript = _sanitize_for_prompt(transcript_text)
    safe_context = _sanitize_for_prompt(context_desc)

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        level=level,
        cefr_desc=cefr_desc,
        safe_context=safe_context,
    )

    user_prompt = f"""Extrae frases útiles de esta transcripción y genera tarjetas de memoria.

TRANSCRIPCIÓN DEL VIDEO:
{safe_transcript}

REQUISITOS:
- Genera entre {min_cards} y {max_cards} tarjetas
- Solo usa frases de la transcripción (puedes limpiarlas ligeramente)
- Cada tarjeta debe tener un "colombian_note" real y específico
- Nivel: {level} — {cefr_desc}
- Contexto: {context_desc}

JSON válido únicamente."""

    return system_prompt, user_prompt