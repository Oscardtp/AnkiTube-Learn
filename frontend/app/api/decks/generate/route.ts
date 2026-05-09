import { generateText, Output } from "ai"
import * as z from "zod"
import { YoutubeTranscript } from "youtube-transcript"

const CardSchema = z.object({
  front: z.string().describe("The English phrase or word to learn"),
  back: z.string().describe("Spanish translation"),
  keyword: z.string().describe("Main keyword or phrase being taught"),
  grammar_note: z.string().describe("Brief grammar explanation in Spanish"),
  context_note: z.string().describe("Context of usage in Spanish"),
  colombian_note: z.string().describe("Colombian Spanish equivalent or cultural note"),
  timestamp_start: z.number().describe("Start timestamp in seconds"),
  timestamp_end: z.number().describe("End timestamp in seconds"),
  audio_filename: z.string().describe("Audio filename placeholder"),
  card_type: z.enum(["vocabulary", "phrase", "idiom", "grammar_pattern"]),
})

const DeckSchema = z.object({
  cards: z.array(CardSchema).describe("Array of flashcards generated from the video"),
})

function getVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

async function getVideoInfo(videoId: string) {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title || "Video de YouTube",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    }
  } catch {
    // Fallback
  }
  return {
    title: "Video de YouTube",
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { youtube_url, level, context } = body

    if (!youtube_url) {
      return Response.json({ detail: "URL de YouTube requerida" }, { status: 400 })
    }

    const videoId = getVideoId(youtube_url)
    if (!videoId) {
      return Response.json({ detail: "URL de YouTube inválida" }, { status: 400 })
    }

    // Get video info
    const videoInfo = await getVideoInfo(videoId)

    // Get transcript
    let transcript: string
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" })
      transcript = transcriptItems.map(item => `[${Math.floor(item.offset / 1000)}s] ${item.text}`).join("\n")
      
      if (!transcript || transcript.length < 50) {
        return Response.json({ 
          detail: "No se encontraron subtítulos en inglés para este video. Intenta con otro video que tenga subtítulos." 
        }, { status: 400 })
      }
    } catch (error) {
      console.error("[v0] Transcript error:", error)
      return Response.json({ 
        detail: "No se pudieron obtener los subtítulos del video. Asegúrate de que el video tenga subtítulos en inglés disponibles." 
      }, { status: 400 })
    }

    // Generate flashcards with AI
    const levelDescriptions: Record<string, string> = {
      A1: "absolute beginner - very basic words and simple phrases",
      A2: "elementary - simple everyday expressions",
      B1: "intermediate - clear standard speech on familiar matters",
      B2: "upper intermediate - main ideas of complex text",
      C1: "advanced - flexible and effective language use",
      C2: "proficiency - near-native fluency",
    }

    const contextDescriptions: Record<string, string> = {
      general: "general everyday language",
      work: "professional and business contexts",
      travel: "travel and tourism situations",
      gaming: "video game and online gaming vocabulary",
    }

    const prompt = `You are an expert English teacher creating Anki flashcards for Spanish speakers learning English.

Analyze this YouTube video transcript and create 8-12 high-quality flashcards.

Student level: ${level} (${levelDescriptions[level] || "intermediate"})
Learning context: ${context} (${contextDescriptions[context] || "general"})

TRANSCRIPT:
${transcript.slice(0, 8000)}

INSTRUCTIONS:
1. Select the most useful and interesting phrases/vocabulary from the video
2. Focus on phrases that match the student's level (${level})
3. Include a mix of vocabulary, phrases, and idioms when appropriate
4. For each card:
   - front: The English phrase or word (as spoken in the video)
   - back: Natural Spanish translation
   - keyword: The main word/phrase being taught
   - grammar_note: Brief grammar explanation in Spanish (e.g., "Verbo irregular", "Phrasal verb")
   - context_note: When/how to use this phrase in Spanish
   - colombian_note: Colombian Spanish equivalent or cultural note
   - timestamp_start/end: Approximate timestamps from the transcript markers
   - card_type: vocabulary, phrase, idiom, or grammar_pattern
   - audio_filename: Use format "card_1.mp3", "card_2.mp3", etc.

Make the cards practical, memorable, and appropriate for the student's level.`

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      output: Output.object({
        schema: DeckSchema,
      }),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    if (!output || !output.cards) {
      return Response.json({ detail: "Error al generar las tarjetas" }, { status: 500 })
    }

    // Generate unique deck ID
    const deckId = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store deck in memory (in production, use a database)
    const deck = {
      deck_id: deckId,
      video_title: videoInfo.title,
      video_thumbnail: videoInfo.thumbnail,
      video_id: videoId,
      cards: output.cards,
      model_used: "gpt-4o-mini",
      total_cards: output.cards.length,
      level,
      context,
      created_at: new Date().toISOString(),
    }

    // Store in global memory for retrieval
    if (typeof globalThis !== "undefined") {
      (globalThis as Record<string, unknown>).__decks = (globalThis as Record<string, unknown>).__decks || {}
      ;((globalThis as Record<string, unknown>).__decks as Record<string, unknown>)[deckId] = deck
    }

    return Response.json(deck)
  } catch (error) {
    console.error("[v0] Generation error:", error)
    return Response.json({ 
      detail: error instanceof Error ? error.message : "Error al generar el mazo" 
    }, { status: 500 })
  }
}
