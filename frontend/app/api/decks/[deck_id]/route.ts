export async function GET(
  request: Request,
  { params }: { params: Promise<{ deck_id: string }> }
) {
  const { deck_id } = await params

  // Retrieve deck from global memory
  const decks = (globalThis as Record<string, unknown>).__decks as Record<string, unknown> | undefined

  if (!decks || !decks[deck_id]) {
    return Response.json({ detail: "Mazo no encontrado" }, { status: 404 })
  }

  return Response.json(decks[deck_id])
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ deck_id: string }> }
) {
  const { deck_id } = await params

  const decks = (globalThis as Record<string, unknown>).__decks as Record<string, unknown> | undefined

  if (!decks || !decks[deck_id]) {
    return Response.json({ detail: "Mazo no encontrado" }, { status: 404 })
  }

  delete decks[deck_id]

  return Response.json({ message: "Mazo eliminado" })
}
