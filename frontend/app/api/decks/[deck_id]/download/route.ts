interface Card {
  front: string
  back: string
  keyword: string
  grammar_note: string
  context_note: string
  colombian_note: string
  timestamp_start: number
  timestamp_end: number
  audio_filename: string
  card_type: string
}

interface Deck {
  deck_id: string
  video_title: string
  video_id: string
  cards: Card[]
  level: string
}

function generateAnkiPackage(deck: Deck): string {
  // Generate a simple tab-separated text file that can be imported into Anki
  // Format: Front\tBack\tTags
  const lines = deck.cards.map((card, index) => {
    const front = `<div class="front">
<h2>${escapeHtml(card.front)}</h2>
<p class="keyword">${escapeHtml(card.keyword)}</p>
</div>`

    const back = `<div class="back">
<h2>${escapeHtml(card.back)}</h2>
<hr>
<p><strong>Gramática:</strong> ${escapeHtml(card.grammar_note)}</p>
<p><strong>Contexto:</strong> ${escapeHtml(card.context_note)}</p>
<p><strong>Colombiano:</strong> ${escapeHtml(card.colombian_note)}</p>
</div>`

    const tags = `AnkiTube ${deck.level} ${card.card_type}`

    return `${front}\t${back}\t${tags}`
  })

  return lines.join("\n")
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deck_id: string }> }
) {
  const { deck_id } = await params

  // Retrieve deck from global memory
  const decks = (globalThis as Record<string, unknown>).__decks as Record<string, Deck> | undefined

  if (!decks || !decks[deck_id]) {
    return Response.json({ detail: "Mazo no encontrado" }, { status: 404 })
  }

  const deck = decks[deck_id]
  const ankiContent = generateAnkiPackage(deck)

  // Return as downloadable text file (Anki can import .txt files)
  const filename = `${deck.video_title.replace(/[^a-zA-Z0-9]/g, "_")}_AnkiTube.txt`

  return new Response(ankiContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
