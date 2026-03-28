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

COLOMBIAN_NOTE_EXAMPLES = """
Ejemplos de colombian_note correcto:
- "It's on me" → "Yo invito / Corre por mi cuenta — como cuando alguien dice 'listo, yo pago esto'"
- "Let's call it a day" → "Ya vamonos — como cuando es tarde y dicen 'chao, hasta mañana'"
- "What's up?" → "¿Qué más? / ¿Quiubo? — el saludo casual colombiano de toda la vida"
- "I'm broke" → "Estoy pelado / Sin un peso — 'este mes quedé en la olla'"
- "Hold on" → "Espérese un momento — como cuando dicen '¿me regala un momento?'"
- "You're kidding me" → "¿En serio? / ¡No me diga! — como '¿me está tomando del pelo?'"
"""


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
    The same prompt is used for Gemini Flash, Gemini Pro, and Claude.
    """

    cefr_desc = CEFR_DESCRIPTIONS.get(level, CEFR_DESCRIPTIONS["B1"])
    context_desc = CONTEXT_DESCRIPTIONS.get(context, CONTEXT_DESCRIPTIONS["general"])
    
    # Sanitize user inputs to prevent prompt injection
    safe_transcript = _sanitize_for_prompt(transcript_text)
    safe_context = _sanitize_for_prompt(context_desc)

    system_prompt = f"""Eres un experto en pedagogía del inglés para hispanohablantes colombianos.
Tu única función es analizar transcripciones de videos de YouTube y generar tarjetas de memoria (flashcards) para Anki.

NIVEL DEL USUARIO: {level} — {cefr_desc}
CONTEXTO: {safe_context}

REGLAS ABSOLUTAS — NUNCA las rompas:
1. Responde ÚNICAMENTE con JSON válido. Cero texto antes o después. Cero bloques markdown.
2. Genera entre {min_cards} y {max_cards} tarjetas — ni más, ni menos.
3. Selecciona SOLO frases apropiadas para nivel {level}. Si el video es muy avanzado, extrae las partes más simples.
4. Las explicaciones van en español colombiano natural — NO neutro de doblaje. Di "chévere", "bacano", "parce" cuando aplique.
5. El campo "colombian_note" es OBLIGATORIO en cada tarjeta. Si no generas uno real y específico, la tarjeta es inválida.
6. Detecta falsos cognados: "embarrassed" ≠ "embarazada", "actually" ≠ "actualmente", "eventually" ≠ "eventualmente".
7. El campo "front" siempre en inglés. El campo "back" siempre en español colombiano.

TIPOS DE TARJETA:
- "vocabulary": una palabra clave con su contexto de uso
- "phrase": una expresión o frase completa de uso cotidiano
- "idiom": modismo o expresión idiomática
- "grammar_pattern": patrón gramatical con ejemplo del video

{COLOMBIAN_NOTE_EXAMPLES}

ESTRUCTURA JSON REQUERIDA:
{{
  "cards": [
    {{
      "front": "frase en inglés exacta del video",
      "back": "traducción en español colombiano natural",
      "keyword": "la palabra o concepto clave de esta tarjeta",
      "grammar_note": "explicación gramatical simple en español — por qué se usa así",
      "context_note": "cuándo usar esta frase en la vida real",
      "colombian_note": "equivalente colombiano real y específico con ejemplo de uso cotidiano",
      "timestamp_start": 12.5,
      "timestamp_end": 18.3,
      "card_type": "phrase"
    }}
  ]
}}"""

    user_prompt = f"""Analiza esta transcripción y genera las tarjetas siguiendo exactamente el formato indicado.

TRANSCRIPCIÓN:
{safe_transcript}

Recuerda: JSON válido únicamente, entre {min_cards} y {max_cards} tarjetas, nivel {level}, colombian_note obligatorio en cada tarjeta."""

    return system_prompt, user_prompt