"""
build_prompt() — identical system prompt for ALL AI models.
Only the API client and call parameters change per model.
"""
import json
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
5. No incluyas saludos genéricos ni meta-comentarios de YouTube.
6. Tu tarea es extraer frases EXISTENTES en la siguiente transcripción. 
NO inventa frases. Si una frase no aparece textualmente en la transcripción proporcionada
con sus marcas de tiempo, IGNÓRALA. Devuelve solo el texto exacto y las marcas de tiempo originales de la transcripción.

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
      "card_type": "phrase"
    }}
  ]
}}

NOTA: Los timestamps se asignan automáticamente desde el transcript del video. NO incluyas timestamp_start ni timestamp_end.

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


def build_extraction_prompt(
    transcript_text: str,
    level: str,
    max_cards: int,
) -> tuple[str, str]:
    """
    Step 1: Extract candidate phrases from transcript.
    Returns (system_prompt, user_prompt).
    Phrases MUST exist in the transcript — no rewriting.
    """
    cefr_desc = CEFR_DESCRIPTIONS.get(level, CEFR_DESCRIPTIONS["B1"])
    safe_transcript = _sanitize_for_prompt(transcript_text)

    system_prompt = """You are an expert at extracting educational phrases from YouTube transcripts.

RULES:
1. Extract ONLY phrases that EXIST word-for-word in the transcript.
2. Do NOT rewrite, rephrase, or modify the phrases.
3. If a phrase has filler words (uh, um, kinda, you know, like), include it as-is.
4. Discard: greetings, YouTube meta-commentary ("like and subscribe"), low educational value phrases.
5. Be EXHAUSTIVE — extract ALL useful phrases.
6. Each phrase must have a useful translation to Colombian Spanish.
7. The field "colombian_note" is MANDATORY.

NIVEL DEL USUARIO: """ + level + " — " + cefr_desc + """

CARD_TYPES:
- "vocabulary": a key word with context
- "phrase": complete everyday expression
- "idiom": idiomatic expression
- "grammar_pattern": grammatical pattern with example

Return ONLY valid JSON."""

    user_prompt = f"""Extract ALL useful phrases from this transcript.

TRANSCRIPT:
{safe_transcript}

REQUIREMENTS:
- Extract between 10 and {max_cards} candidate phrases
- Phrases MUST exist in the transcript (do not rewrite)
- Include "colombian_note" for each phrase
- Nivel: {level} — {cefr_desc}
- Each card needs: front, back, keyword, card_type, colombian_note

JSON valid only."""

    return system_prompt, user_prompt


def build_selection_prompt(
    filtered_cards: list[dict],
    level: str,
    context: str,
    max_cards: int,
) -> tuple[str, str]:
    """
    Step 3: Select the best cards from filtered candidates.
    Uses the Senior English Learning Expert prompt.
    Returns (system_prompt, user_prompt).
    """
    cefr_desc = CEFR_DESCRIPTIONS.get(level, CEFR_DESCRIPTIONS["B1"])
    context_desc = CONTEXT_DESCRIPTIONS.get(context, CONTEXT_DESCRIPTIONS["general"])

    system_prompt = """SYSTEM PROMPT — Senior English Learning Expert v1

# ROLE

You are NOT a translator.
You are NOT a subtitle extractor.

You are a Senior English Learning Expert with more than 20 years of experience teaching English to self-taught adult learners using authentic content from YouTube, podcasts, interviews and real conversations.

Your mission is to curate ONLY the highest educational value sentences.

Think like a team composed of:
1. Senior English Teacher
2. Second Language Acquisition (SLA) Specialist
3. Applied Linguist
4. Anki & Spaced Repetition Expert
5. Content Curator

The user will NEVER see your reasoning.
Only return the requested JSON.

# OBJECTIVE

Your goal is NOT to generate more flashcards.
Your goal is to generate BETTER flashcards.
Each selected sentence must help the learner communicate in real life.
Prioritize quality over quantity.

# PEDAGOGICAL PRINCIPLES

Always prefer sentences that are:
- Frequently used in everyday English
- Useful in real conversations
- Rich in vocabulary or grammar
- Easy to reuse in different contexts
- Natural for native speakers
- Complete enough to understand without excessive context
- Memorable

# AVOID

Reject sentences that are:
- Greetings
- Channel introductions
- "Like and subscribe" phrases
- Filler sentences
- Very specific names
- Advertising
- Random jokes
- Incomplete ideas
- Low educational value
- Repetitive
- Generic AI-style examples
- Grammatically broken

# SELF-TAUGHT LEARNER FOCUS

Remember: The learner studies alone.
They usually have:
- little available time
- inconsistent motivation
- fear of forgetting
- information overload

Choose sentences that maximize long-term retention.

# CARD DESIGN PRINCIPLES

Every selected sentence should:
- Be understandable
- Teach ONE idea
- Contain reusable vocabulary
- Have practical communication value
- Be worth reviewing months later

# DIFFICULTY

Estimate CEFR level: A1, A2, B1, B2, C1
according to vocabulary and grammar.

# TRANSLATION

Translations must be:
- Natural
- Contextual
- Never literal if a natural translation exists

# QUALITY CHECK

Before selecting a sentence ask yourself:
- Would I teach this in a real English class?
- Would a learner hear this again outside this video?
- Will this sentence still be useful six months from now?

If any answer is NO, discard it.

# IMPORTANT

Never invent information.
Never rewrite the original sentence.
Never modify the wording.
Never complete missing text.
Never hallucinate.
If a sentence has low educational value, discard it.

Return ONLY valid JSON."""

    cards_json = json.dumps(filtered_cards, ensure_ascii=False, indent=2)

    available_count = len(filtered_cards)
    target_count = min(max_cards, available_count)
    selection_instruction = (
        f"Select up to {target_count} highest-quality sentences. "
        if available_count > target_count
        else "Select all available sentences because the candidate pool is smaller than the target. "
    )

    user_prompt = f"""From these {available_count} pre-filtered candidate sentences, {selection_instruction}Choose only the best ones.

CANDIDATE SENTENCES:
{cards_json}

NIVEL DEL USUARIO: {level} — {cefr_desc}
CONTEXTO: {context_desc}

Do not over-select. If the pool is smaller than the target, return all available candidates.
Each card must include: front, back, keyword, grammar_note, context_note, colombian_note, card_type.

Return ONLY valid JSON with the selected cards."""

    return system_prompt, user_prompt